/**
 * GridMe テーマグリッドアプリケーション (リファクタリング版)
 * 
 * モジュール化されたユーティリティを使用
 */

import { toast, modal, storage, share, GridRenderer, theme } from './utils/index.js';

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 3,
        gridSections: [],
        saveTimeout: null,
        currentFocusedInput: null,
        gridBgColor: '#000000' // デフォルトは黒
    };
    
    // テーマサジェスチョンのリスト
    const themeSuggestions = [
        '動物', 'キャラクター', '花', 'MBTI', '植物',
        '宝石', '季節', '天気', '食べ物', '飲み物',
        '色', '音楽ジャンル', '映画ジャンル', 'スポーツ', '趣味',
        '国', '都市', '自然現象', '職業', '感情',
        '時代', '神話', '星座', '元素', 'ポケモン'
    ];
    
    // ランダムテーマを取得する関数
    function getRandomTheme() {
        return themeSuggestions[Math.floor(Math.random() * themeSuggestions.length)];
    }
    
    // DOM要素
    const elements = {
        themeGrid: document.getElementById('theme-grid'),
        mainShareBtn: document.getElementById('main-share-btn'),
        shareBtn: document.getElementById('share-btn'),
        gridSizeSelect: document.getElementById('grid-size'),
        downloadBtn: document.getElementById('download-btn'),
        saveBtn: document.getElementById('save-btn'),
        shareModal: document.getElementById('share-modal'),
        copyUrlBtn: document.getElementById('copy-url-btn'),
        shareTwitterBtn: document.getElementById('share-twitter-btn'),
        shareFacebookBtn: document.getElementById('share-facebook-btn'),
        shareLineBtn: document.getElementById('share-line-btn'),
        shareUrlInput: document.getElementById('share-url-input'),
        gridBgColorInput: document.getElementById('grid-bg-color')
    };
    
    // グリッドセクションクラス
    class GridSection {
        constructor(index, row, col) {
            this.index = index;
            this.row = row;
            this.col = col;
            this.title = '';
        }
    }
    
    // グリッドレンダラーの初期化
    const gridRenderer = new GridRenderer('theme-grid', {
        defaultSize: 3,
        itemClass: 'grid-theme-item',
        renderItem: (item, section, index) => {
            // セクションコンテナ
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'grid-section-container';
            
            // タイトル入力
            const titleInput = document.createElement('textarea');
            titleInput.className = 'section-title-input';
            titleInput.placeholder = 'テーマを入力';
            titleInput.maxLength = 30;
            titleInput.value = section.title;
            titleInput.dataset.index = index;
            titleInput.dataset.field = 'title';
            titleInput.rows = 2;
            
            // イベントリスナーの追加
            titleInput.addEventListener('input', handleSectionUpdate);
            titleInput.addEventListener('focus', () => {
                state.currentFocusedInput = titleInput;
            });
            titleInput.addEventListener('blur', () => {
                setTimeout(() => {
                    if (state.currentFocusedInput === titleInput) {
                        state.currentFocusedInput = null;
                    }
                }, 200);
            });
            
            sectionContainer.appendChild(titleInput);
            item.appendChild(sectionContainer);
        }
    });
    
    // グリッドの初期化
    function initializeGrid() {
        const size = state.gridSize;
        const totalSections = size * size;
        
        // グリッドセクション配列の初期化
        state.gridSections = [];
        for (let i = 0; i < totalSections; i++) {
            const row = Math.floor(i / size);
            const col = i % size;
            const section = new GridSection(i, row, col);
            // ランダムテーマを初期値として設定
            section.title = getRandomTheme();
            state.gridSections.push(section);
        }
        
        // グリッドをレンダリング
        gridRenderer.setSize(size);
        gridRenderer.render(state.gridSections);
        
        // 背景色を適用
        applyGridBackgroundColor();
        
        // 初期状態でボタンを無効化
        checkAllSectionsCompleted();
    }
    
    // セクション更新ハンドラー
    function handleSectionUpdate(e) {
        const index = parseInt(e.target.dataset.index);
        const field = e.target.dataset.field;
        const value = e.target.value;
        
        state.gridSections[index][field] = value;
        
        // 全てのセクションが完了しているかチェック
        checkAllSectionsCompleted();
        
        // 自動保存
        autoSave();
    }
    
    // 全てのセクションが完了しているかチェック
    function checkAllSectionsCompleted() {
        const allCompleted = state.gridSections.every(section => 
            section.title.trim() !== ''
        );
        
        // 共有ボタンの有効/無効を制御
        if (elements.mainShareBtn) {
            elements.mainShareBtn.disabled = !allCompleted;
            if (allCompleted) {
                elements.mainShareBtn.classList.remove('btn-disabled');
            } else {
                elements.mainShareBtn.classList.add('btn-disabled');
            }
        }
        
        if (elements.shareBtn) {
            elements.shareBtn.disabled = !allCompleted;
            if (allCompleted) {
                elements.shareBtn.classList.remove('btn-disabled');
            } else {
                elements.shareBtn.classList.add('btn-disabled');
            }
        }
        
        return allCompleted;
    }
    
    // グリッドサイズ変更
    async function handleGridSizeChange(e) {
        const newSize = parseInt(e.target.value);
        
        // 確認ダイアログ
        if (state.gridSections.some(section => section.title)) {
            const confirmed = await modal.confirm(
                'グリッドサイズを変更すると、現在の内容が失われます。続行しますか？',
                { title: '確認' }
            );
            
            if (!confirmed) {
                e.target.value = state.gridSize;
                return;
            }
        }
        
        state.gridSize = newSize;
        initializeGrid();
        toast.success(`グリッドサイズを${newSize}x${newSize}に変更しました`);
    }
    
    // 共有モーダルの設定
    const shareModalInstance = modal.register('share-modal', {
        onOpen: () => {
            const shareUrl = generateShareUrl();
            if (elements.shareUrlInput) {
                elements.shareUrlInput.value = shareUrl;
            }
        }
    });
    
    // 共有機能
    function shareGrid() {
        if (!checkAllSectionsCompleted()) {
            toast.warning('全てのセクションにテーマを入力してください');
            return;
        }
        
        shareModalInstance.open();
    }
    
    // 共有URLを生成
    function generateShareUrl() {
        const shareData = {
            size: state.gridSize,
            sections: state.gridSections.map(section => ({
                title: section.title
            })),
            bgColor: state.gridBgColor
        };
        
        const baseUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}shared.html`;
        return share.generateShareUrl(baseUrl, shareData);
    }
    
    // URLをコピー
    async function copyShareUrl() {
        const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
        const success = await share.copyToClipboard(shareUrl);
        
        if (success) {
            toast.success('URLをコピーしました');
        } else {
            toast.error('URLのコピーに失敗しました');
        }
    }
    
    // ソーシャル共有ハンドラー
    function setupShareHandlers() {
        if (elements.shareTwitterBtn) {
            elements.shareTwitterBtn.addEventListener('click', () => {
                const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
                share.shareOnTwitter(shareUrl, 'GridMeで作成したテーマグリッドを共有します！', ['GridMe']);
            });
        }
        
        if (elements.shareFacebookBtn) {
            elements.shareFacebookBtn.addEventListener('click', () => {
                const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
                share.shareOnFacebook(shareUrl);
            });
        }
        
        if (elements.shareLineBtn) {
            elements.shareLineBtn.addEventListener('click', () => {
                const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
                share.shareOnLine(shareUrl, 'GridMeで作成したテーマグリッドを見てください！');
            });
        }
    }
    
    // 自動保存
    function autoSave() {
        clearTimeout(state.saveTimeout);
        state.saveTimeout = setTimeout(() => {
            saveGrid();
        }, 1000);
    }
    
    // データの保存
    function saveGrid() {
        const gridData = {
            size: state.gridSize,
            sections: state.gridSections,
            bgColor: state.gridBgColor
        };
        
        storage.set('sections', gridData);
    }
    
    // 保存データの読み込み
    function loadSavedGrid() {
        const savedData = storage.get('sections');
        
        if (savedData) {
            state.gridSize = savedData.size || 3;
            state.gridBgColor = savedData.bgColor || '#000000';
            
            // グリッドサイズセレクトを更新
            if (elements.gridSizeSelect) {
                elements.gridSizeSelect.value = state.gridSize;
            }
            
            // 背景色を更新
            if (elements.gridBgColorInput) {
                elements.gridBgColorInput.value = state.gridBgColor;
            }
            
            // セクションデータを復元
            if (savedData.sections && Array.isArray(savedData.sections)) {
                state.gridSections = savedData.sections.map((section, index) => {
                    const row = Math.floor(index / state.gridSize);
                    const col = index % state.gridSize;
                    const gridSection = new GridSection(index, row, col);
                    gridSection.title = section.title || '';
                    return gridSection;
                });
            }
            
            // グリッドを再描画
            gridRenderer.setSize(state.gridSize);
            gridRenderer.render(state.gridSections);
            applyGridBackgroundColor();
            checkAllSectionsCompleted();
        }
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        // グリッドサイズ変更
        if (elements.gridSizeSelect) {
            elements.gridSizeSelect.addEventListener('change', handleGridSizeChange);
        }
        
        // 共有ボタン
        if (elements.mainShareBtn) {
            elements.mainShareBtn.addEventListener('click', shareGrid);
        }
        if (elements.shareBtn) {
            elements.shareBtn.addEventListener('click', shareGrid);
        }
        
        // URLコピー
        if (elements.copyUrlBtn) {
            elements.copyUrlBtn.addEventListener('click', copyShareUrl);
        }
        
        // ソーシャル共有
        setupShareHandlers();
        
        // 背景色変更
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.addEventListener('input', handleBgColorChange);
        }
    }
    
    // テーマサジェスチョンチップを作成
    function createThemeChip(theme, colorIndex) {
        const chip = document.createElement('div');
        chip.className = `theme-chip chip-color-${colorIndex}`;
        chip.textContent = theme;
        chip.style.opacity = '0';
        chip.style.transition = 'opacity 0.3s ease-in-out';
        
        // フェードインアニメーション
        setTimeout(() => {
            chip.style.opacity = '1';
        }, 50);
        
        chip.addEventListener('click', () => {
            if (state.currentFocusedInput) {
                state.currentFocusedInput.value = theme;
                const event = new Event('input', { bubbles: true });
                state.currentFocusedInput.dispatchEvent(event);
                state.currentFocusedInput.focus();
            } else {
                toast.info('まずテーマ入力欄をクリックしてください');
            }
        });
        
        return chip;
    }
    
    // テーマサジェスチョンを初期化
    function initializeThemeSuggestions() {
        const tracks = document.querySelectorAll('.suggestions-track');
        
        tracks.forEach((track, rowIndex) => {
            // 既存のチップをクリア
            track.innerHTML = '';
            
            // 各行に異なるテーマセットを割り当て
            const themes = rowIndex === 0 
                ? themeSuggestions.slice(0, Math.ceil(themeSuggestions.length / 2))
                : themeSuggestions.slice(Math.ceil(themeSuggestions.length / 2));
            
            // アニメーションのために2セット作成
            for (let set = 0; set < 2; set++) {
                themes.forEach((theme, index) => {
                    const colorIndex = ((rowIndex * themes.length + index) % 10) + 1;
                    const chip = createThemeChip(theme, colorIndex);
                    track.appendChild(chip);
                });
            }
            
            // トラックの幅を設定してアニメーションを安定化
            const chipWidth = 120; // チップの推定幅（min-width + padding + gap）
            const totalWidth = themes.length * chipWidth;
            track.style.width = `${totalWidth * 2}px`;
        });
    }
    
    // 背景色を適用
    function applyGridBackgroundColor() {
        if (elements.themeGrid) {
            elements.themeGrid.style.backgroundColor = state.gridBgColor;
        }
    }
    
    // 背景色変更ハンドラー
    function handleBgColorChange(e) {
        state.gridBgColor = e.target.value;
        applyGridBackgroundColor();
        autoSave();
    }
    
    // 初期化
    function init() {
        initializeGrid();
        setupEventListeners();
        loadSavedGrid();

        initializeThemeSuggestions();
        
        // テーマ切り替えボタンの設定
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            theme.setToggleButton(themeToggle);
        }
        // DOM要素が完全に読み込まれてからチップを初期化
        setTimeout(() => {
            initializeThemeSuggestions();
        }, 100);
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();