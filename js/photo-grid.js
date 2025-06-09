/**
 * GridMe テーマグリッドアプリケーション
 * 
 * 3x3のテーマグリッドでテーマを管理するインタラクティブなアプリケーション
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 3,
        gridThemes: []
    };
    
    // DOM要素
    const elements = {
        themeGrid: document.getElementById('theme-grid'),
        mainShareBtn: document.getElementById('main-share-btn'),
        shareBtn: document.getElementById('share-btn'),
        gridSizeSelect: document.getElementById('grid-size')
    };
    
    // グリッドの初期化
    function initializeGrid() {
        const size = state.gridSize;
        const totalCells = size * size;
        
        // グリッドテーマ配列の初期化
        state.gridThemes = new Array(totalCells).fill('');
        
        // グリッドHTMLの生成
        elements.themeGrid.innerHTML = '';
        elements.themeGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        elements.themeGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        for (let i = 0; i < totalCells; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-theme-item';
            gridItem.dataset.index = i;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'theme-input';
            input.placeholder = 'テーマを入力';
            input.maxLength = 50;
            input.dataset.index = i;
            
            input.addEventListener('input', (e) => handleThemeInput(e));
            
            gridItem.appendChild(input);
            elements.themeGrid.appendChild(gridItem);
        }
    }
    
    // テーマ入力ハンドラー
    function handleThemeInput(e) {
        const index = parseInt(e.target.dataset.index);
        state.gridThemes[index] = e.target.value;
    }
    
    // グリッドサイズ変更
    function handleGridSizeChange(e) {
        const newSize = parseInt(e.target.value);
        state.gridSize = newSize;
        initializeGrid();
        showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
    }
    
    // 共有機能
    async function shareGrid() {
        const filledThemes = state.gridThemes.filter(theme => theme.trim() !== '');
        
        if (filledThemes.length === 0) {
            showToast('少なくとも1つのテーマを入力してください', 'warning');
            return;
        }
        
        // 共有用のURLパラメータを生成
        const shareData = {
            size: state.gridSize,
            themes: state.gridThemes
        };
        
        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}/shared.html?data=${encodedData}`;
        
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
    
    // 保存データの読み込み
    function loadSavedGrid() {
        const savedData = localStorage.getItem('gridme-themes');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                state.gridSize = data.size || 3;
                state.gridThemes = data.themes || [];
                
                // グリッドサイズセレクトを更新
                elements.gridSizeSelect.value = state.gridSize;
                
                // グリッドを再初期化
                initializeGrid();
                
                // 保存されたテーマを入力
                state.gridThemes.forEach((theme, index) => {
                    const input = elements.themeGrid.querySelector(`input[data-index="${index}"]`);
                    if (input) {
                        input.value = theme;
                    }
                });
            } catch (err) {
                console.error('保存データの読み込みエラー:', err);
            }
        }
    }
    
    // データの保存
    function saveGrid() {
        const gridData = {
            size: state.gridSize,
            themes: state.gridThemes,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('gridme-themes', JSON.stringify(gridData));
        showToast('グリッドを保存しました', 'success');
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        // グリッドサイズ変更
        elements.gridSizeSelect.addEventListener('change', handleGridSizeChange);
        
        // 共有ボタン
        elements.mainShareBtn.addEventListener('click', shareGrid);
        if (elements.shareBtn) {
            elements.shareBtn.addEventListener('click', shareGrid);
        }
        
        // 自動保存（入力時）
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('theme-input')) {
                // デバウンス処理
                clearTimeout(state.saveTimeout);
                state.saveTimeout = setTimeout(() => {
                    saveGrid();
                }, 1000);
            }
        });
    }
    
    // 初期化
    function init() {
        initializeGrid();
        setupEventListeners();
        loadSavedGrid();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();