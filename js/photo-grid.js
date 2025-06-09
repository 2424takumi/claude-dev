/**
 * GridMe フォトグリッドアプリケーション
 * 
 * 9x9のフォトグリッドで写真を管理するインタラクティブなアプリケーション
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        currentTheme: '',
        gridImages: new Array(81).fill(null),
        selectedCell: null
    };
    
    // DOM要素
    const elements = {
        themeInput: document.getElementById('theme-input'),
        applyThemeBtn: document.getElementById('apply-theme-btn'),
        suggestionChips: document.querySelectorAll('.suggestion-chip'),
        photoGrid: document.getElementById('photo-grid'),
        currentThemeDisplay: document.getElementById('current-theme-display'),
        clearGridBtn: document.getElementById('clear-grid-btn'),
        randomizeBtn: document.getElementById('randomize-btn'),
        shareBtn: document.getElementById('share-btn'),
        downloadBtn: document.getElementById('download-btn'),
        saveBtn: document.getElementById('save-btn'),
        uploadModal: document.getElementById('upload-modal'),
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input'),
        modalClose: document.querySelector('.modal-close')
    };
    
    // グリッドの初期化
    function initializeGrid() {
        elements.photoGrid.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item empty';
            gridItem.dataset.index = i;
            
            const placeholder = document.createElement('div');
            placeholder.className = 'grid-placeholder';
            placeholder.textContent = '+';
            gridItem.appendChild(placeholder);
            
            gridItem.addEventListener('click', () => handleCellClick(i));
            elements.photoGrid.appendChild(gridItem);
        }
    }
    
    // セルクリックハンドラー
    function handleCellClick(index) {
        state.selectedCell = index;
        elements.uploadModal.classList.add('active');
    }
    
    // テーマ適用
    function applyTheme() {
        const theme = elements.themeInput.value.trim();
        if (!theme) {
            showToast('テーマを入力してください', 'warning');
            return;
        }
        
        state.currentTheme = theme;
        elements.currentThemeDisplay.textContent = `フォトグリッド - ${theme}`;
        showToast(`テーマ「${theme}」を適用しました`, 'success');
        
        // テーマに基づいて背景グラデーションを変更
        updateThemeColors();
    }
    
    // テーマカラーの更新
    function updateThemeColors() {
        const hue = Math.abs(hashCode(state.currentTheme)) % 360;
        const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${(hue + 60) % 360}, 70%, 60%) 100%)`;
        
        elements.photoGrid.style.background = gradient;
    }
    
    // 文字列のハッシュコード生成
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    
    // サジェスチョンチップのクリック
    function handleSuggestionClick(e) {
        const theme = e.target.dataset.theme;
        elements.themeInput.value = theme;
        applyTheme();
    }
    
    // グリッドクリア
    function clearGrid() {
        if (!confirm('すべての写真を削除しますか？')) return;
        
        state.gridImages = new Array(81).fill(null);
        updateGridDisplay();
        showToast('グリッドをクリアしました', 'info');
    }
    
    // グリッドシャッフル
    function randomizeGrid() {
        const filledCells = state.gridImages
            .map((img, index) => ({ img, index }))
            .filter(item => item.img !== null);
        
        if (filledCells.length === 0) {
            showToast('シャッフルする写真がありません', 'warning');
            return;
        }
        
        // 配列をシャッフル
        for (let i = filledCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filledCells[i], filledCells[j]] = [filledCells[j], filledCells[i]];
        }
        
        // 新しい配列を作成
        const newImages = new Array(81).fill(null);
        filledCells.forEach((item, index) => {
            const newIndex = state.gridImages.findIndex((img, idx) => img !== null && !newImages.includes(img));
            if (newIndex !== -1) {
                newImages[newIndex] = item.img;
            }
        });
        
        state.gridImages = newImages;
        updateGridDisplay();
        showToast('写真をシャッフルしました', 'success');
    }
    
    // グリッド表示の更新
    function updateGridDisplay() {
        const gridItems = elements.photoGrid.querySelectorAll('.grid-item');
        
        gridItems.forEach((item, index) => {
            const image = state.gridImages[index];
            
            if (image) {
                item.classList.remove('empty');
                item.innerHTML = `<img src="${image}" alt="Grid image ${index + 1}">`;
            } else {
                item.classList.add('empty');
                item.innerHTML = '<div class="grid-placeholder">+</div>';
            }
        });
    }
    
    // 画像アップロード処理
    function handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            showToast('画像ファイルを選択してください', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (state.selectedCell !== null) {
                state.gridImages[state.selectedCell] = e.target.result;
                updateGridDisplay();
                closeModal();
                showToast('画像をアップロードしました', 'success');
            }
        };
        reader.readAsDataURL(file);
    }
    
    // モーダルを閉じる
    function closeModal() {
        elements.uploadModal.classList.remove('active');
        state.selectedCell = null;
    }
    
    // 共有機能
    async function shareGrid() {
        if (!state.currentTheme) {
            showToast('まずテーマを設定してください', 'warning');
            return;
        }
        
        const shareData = {
            title: `GridMe - ${state.currentTheme}`,
            text: `「${state.currentTheme}」のフォトグリッドを作成しました！`,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showToast('共有しました', 'success');
            } else {
                // フォールバック: URLをクリップボードにコピー
                await navigator.clipboard.writeText(window.location.href);
                showToast('URLをコピーしました', 'success');
            }
        } catch (err) {
            console.error('共有エラー:', err);
            showToast('共有に失敗しました', 'error');
        }
    }
    
    // ダウンロード機能
    function downloadGrid() {
        if (!state.currentTheme) {
            showToast('まずテーマを設定してください', 'warning');
            return;
        }
        
        // Canvas要素を作成してグリッドを描画
        html2canvas(elements.photoGrid).then(canvas => {
            const link = document.createElement('a');
            link.download = `gridme-${state.currentTheme.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('ダウンロードを開始しました', 'success');
        }).catch(err => {
            console.error('ダウンロードエラー:', err);
            showToast('ダウンロードに失敗しました', 'error');
        });
    }
    
    // 保存機能
    function saveGrid() {
        const gridData = {
            theme: state.currentTheme,
            images: state.gridImages,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('gridme-current', JSON.stringify(gridData));
        showToast('グリッドを保存しました', 'success');
    }
    
    // 保存データの読み込み
    function loadSavedGrid() {
        const savedData = localStorage.getItem('gridme-current');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                state.currentTheme = data.theme || '';
                state.gridImages = data.images || new Array(81).fill(null);
                
                if (state.currentTheme) {
                    elements.themeInput.value = state.currentTheme;
                    elements.currentThemeDisplay.textContent = `フォトグリッド - ${state.currentTheme}`;
                    updateThemeColors();
                }
                
                updateGridDisplay();
            } catch (err) {
                console.error('保存データの読み込みエラー:', err);
            }
        }
    }
    
    // ドラッグ&ドロップ処理
    function setupDragAndDrop() {
        elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.add('dragover');
        });
        
        elements.uploadArea.addEventListener('dragleave', () => {
            elements.uploadArea.classList.remove('dragover');
        });
        
        elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                handleImageUpload(file);
            }
        });
        
        elements.uploadArea.addEventListener('click', () => {
            elements.fileInput.click();
        });
        
        elements.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file);
            }
        });
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        elements.applyThemeBtn.addEventListener('click', applyTheme);
        elements.themeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyTheme();
            }
        });
        
        elements.suggestionChips.forEach(chip => {
            chip.addEventListener('click', handleSuggestionClick);
        });
        
        elements.clearGridBtn.addEventListener('click', clearGrid);
        elements.randomizeBtn.addEventListener('click', randomizeGrid);
        elements.shareBtn.addEventListener('click', shareGrid);
        elements.downloadBtn.addEventListener('click', downloadGrid);
        elements.saveBtn.addEventListener('click', saveGrid);
        
        elements.modalClose.addEventListener('click', closeModal);
        elements.uploadModal.addEventListener('click', (e) => {
            if (e.target === elements.uploadModal) {
                closeModal();
            }
        });
        
        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.uploadModal.classList.contains('active')) {
                closeModal();
            }
        });
    }
    
    // html2canvasライブラリの動的読み込み
    function loadHtml2Canvas() {
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }
    
    // 初期化
    function init() {
        initializeGrid();
        setupEventListeners();
        setupDragAndDrop();
        loadSavedGrid();
        loadHtml2Canvas();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();