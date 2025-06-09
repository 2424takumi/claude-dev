/**
 * GridMe テーマグリッドアプリケーション
 * 
 * 動的サイズのテーマグリッドでテーマを管理するインタラクティブなアプリケーション
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 2, // デフォルトを2x2に設定
        gridSections: [], // グリッドセクションを格納
        saveTimeout: null,
        currentFocusedInput: null // 現在フォーカスされている入力フィールド
    };
    
    // テーマサジェスチョンのリスト
    const themeSuggestions = [
        '動物', 'キャラクター', '花', 'MBTI', '植物',
        '宝石', '季節', '天気', '食べ物', '飲み物',
        '色', '音楽ジャンル', '映画ジャンル', 'スポーツ', '趣味',
        '国', '都市', '自然現象', '職業', '感情',
        '時代', '神話', '星座', '元素', 'ポケモン'
    ];
    
    // DOM要素
    const elements = {
        themeGrid: document.getElementById('theme-grid'),
        mainShareBtn: document.getElementById('main-share-btn'),
        shareBtn: document.getElementById('share-btn'),
        gridSizeSelect: document.getElementById('grid-size'),
        downloadBtn: document.getElementById('download-btn'),
        saveBtn: document.getElementById('save-btn')
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
    
    // グリッドの初期化
    function initializeGrid() {
        const size = state.gridSize;
        const totalSections = size * size;
        
        // グリッドセクション配列の初期化
        state.gridSections = [];
        for (let i = 0; i < totalSections; i++) {
            const row = Math.floor(i / size);
            const col = i % size;
            state.gridSections.push(new GridSection(i, row, col));
        }
        
        // グリッドHTMLの生成
        renderGrid();
        
        // 初期状態でボタンを無効化
        checkAllSectionsCompleted();
    }
    
    // グリッドのレンダリング
    function renderGrid() {
        const size = state.gridSize;
        
        elements.themeGrid.innerHTML = '';
        elements.themeGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        elements.themeGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        state.gridSections.forEach((section, index) => {
            const gridItem = createGridItem(section, index);
            elements.themeGrid.appendChild(gridItem);
        });
    }
    
    // グリッドアイテムの作成
    function createGridItem(section, index) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-theme-item';
        gridItem.dataset.index = index;
        
        // セクションコンテナ
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'grid-section-container';
        
        // タイトル入力（テーマ入力として使用）
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'section-title-input';
        titleInput.placeholder = 'テーマを入力';
        titleInput.maxLength = 30;
        titleInput.value = section.title;
        titleInput.dataset.index = index;
        titleInput.dataset.field = 'title';
        
        // イベントリスナーの追加
        titleInput.addEventListener('input', handleSectionUpdate);
        titleInput.addEventListener('focus', () => {
            state.currentFocusedInput = titleInput;
        });
        titleInput.addEventListener('blur', () => {
            // 少し遅延させて、チップクリックが先に処理されるようにする
            setTimeout(() => {
                if (state.currentFocusedInput === titleInput) {
                    state.currentFocusedInput = null;
                }
            }, 200);
        });
        
        // 要素の組み立て
        sectionContainer.appendChild(titleInput);
        gridItem.appendChild(sectionContainer);
        
        return gridItem;
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
    
    // セクションにテーマを適用
    function applyThemeToSection(gridItem, theme) {
        // 既存のテーマクラスを削除
        gridItem.className = gridItem.className.replace(/theme-\w+/g, '');
        gridItem.classList.add('grid-theme-item', `theme-${theme}`);
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
    function handleGridSizeChange(e) {
        const newSize = parseInt(e.target.value);
        
        // 確認ダイアログ
        if (state.gridSections.some(section => section.title || section.content)) {
            if (!confirm('グリッドサイズを変更すると、現在の内容が失われます。続行しますか？')) {
                e.target.value = state.gridSize;
                return;
            }
        }
        
        state.gridSize = newSize;
        initializeGrid();
        showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
    }
    
    // 共有機能
    async function shareGrid() {
        if (!checkAllSectionsCompleted()) {
            showToast('全てのセクションにテーマを入力してください', 'warning');
            return;
        }
        
        // 共有用のデータを生成
        const shareData = {
            size: state.gridSize,
            sections: state.gridSections.map(section => ({
                title: section.title
            }))
        };
        
        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}shared.html?data=${encodedData}`;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'GridMe - テーマグリッド',
                    text: 'カスタムテーマグリッドを共有します',
                    url: shareUrl
                });
                showToast('共有しました', 'success');
            } else {
                // フォールバック: URLをクリップボードにコピー
                await navigator.clipboard.writeText(shareUrl);
                showToast('共有URLをコピーしました', 'success');
            }
        } catch (err) {
            console.error('共有エラー:', err);
            showToast('共有に失敗しました', 'error');
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
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('gridme-sections', JSON.stringify(gridData));
    }
    
    // 保存データの読み込み
    function loadSavedGrid() {
        const savedData = localStorage.getItem('gridme-sections');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                state.gridSize = data.size || 2;
                
                // グリッドサイズセレクトを更新
                if (elements.gridSizeSelect) {
                    elements.gridSizeSelect.value = state.gridSize;
                }
                
                // セクションデータを復元
                if (data.sections && Array.isArray(data.sections)) {
                    state.gridSections = data.sections.map((section, index) => {
                        const row = Math.floor(index / state.gridSize);
                        const col = index % state.gridSize;
                        const gridSection = new GridSection(index, row, col);
                        gridSection.title = section.title || '';
                        return gridSection;
                    });
                }
                
                // グリッドを再描画
                renderGrid();
                checkAllSectionsCompleted();
            } catch (err) {
                console.error('保存データの読み込みエラー:', err);
            }
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
    }
    
    // トースト通知を表示
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // アニメーション後に削除
            setTimeout(() => {
                toast.classList.add('toast-fade-out');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }
    }
    
    // テーマサジェスチョンチップを作成
    function createThemeChip(theme, colorIndex) {
        const chip = document.createElement('div');
        chip.className = `theme-chip chip-color-${colorIndex}`;
        chip.textContent = theme;
        
        chip.addEventListener('click', () => {
            if (state.currentFocusedInput) {
                state.currentFocusedInput.value = theme;
                // イベントを手動でトリガー
                const event = new Event('input', { bubbles: true });
                state.currentFocusedInput.dispatchEvent(event);
                state.currentFocusedInput.focus();
            } else {
                showToast('まずテーマ入力欄をクリックしてください', 'info');
            }
        });
        
        return chip;
    }
    
    // テーマサジェスチョンを初期化
    function initializeThemeSuggestions() {
        const tracks = document.querySelectorAll('.suggestions-track');
        
        tracks.forEach((track, rowIndex) => {
            // 各行に異なるテーマを配置
            const startIndex = rowIndex * Math.floor(themeSuggestions.length / 2);
            const endIndex = startIndex + Math.floor(themeSuggestions.length / 2);
            const rowThemes = themeSuggestions.slice(startIndex, endIndex);
            
            // アニメーションのために2セット作成
            for (let set = 0; set < 2; set++) {
                rowThemes.forEach((theme, index) => {
                    const colorIndex = ((startIndex + index) % 10) + 1;
                    const chip = createThemeChip(theme, colorIndex);
                    track.appendChild(chip);
                });
            }
        });
    }
    
    // 初期化
    function init() {
        initializeGrid();
        setupEventListeners();
        loadSavedGrid();
        initializeThemeSuggestions();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();