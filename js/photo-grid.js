/**
 * GridMe テーマグリッドアプリケーション
 * 
 * 動的サイズのテーマグリッドでテーマを管理するインタラクティブなアプリケーション
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 3,
        gridSections: [], // 各セクションのデータ（タイトル、テーマ、画像）
        selectedSection: null,
        shareId: null
    };
    
    // DOM要素
    const elements = {
        themeGrid: document.getElementById('theme-grid'),
        mainShareBtn: document.getElementById('main-share-btn'),
        shareBtn: document.getElementById('share-btn'),
        gridSizeSelect: document.getElementById('grid-size'),
        uploadModal: document.getElementById('upload-modal'),
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input'),
        modalClose: document.querySelector('.app-modal-close')
    };
    
    // グリッドの初期化
    function initializeGrid() {
        const size = state.gridSize;
        const totalCells = size * size;
        
        // グリッドセクション配列の初期化
        state.gridSections = [];
        for (let i = 0; i < totalCells; i++) {
            state.gridSections.push({
                title: '',
                theme: '',
                image: null,
                index: i
            });
        }
        
        // グリッドHTMLの生成
        elements.themeGrid.innerHTML = '';
        elements.themeGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        elements.themeGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        for (let i = 0; i < totalCells; i++) {
            const gridItem = createGridSection(i);
            elements.themeGrid.appendChild(gridItem);
        }
    }
    
    // グリッドセクションの作成
    function createGridSection(index) {
        const section = state.gridSections[index];
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-section-item';
        gridItem.dataset.index = index;
        
        // セクションヘッダー（タイトル入力）
        const header = document.createElement('div');
        header.className = 'section-header';
        
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'section-title-input';
        titleInput.placeholder = 'タイトル';
        titleInput.value = section.title;
        titleInput.maxLength = 30;
        titleInput.dataset.index = index;
        titleInput.addEventListener('input', (e) => handleTitleInput(e));
        
        header.appendChild(titleInput);
        
        // セクションコンテンツ
        const content = document.createElement('div');
        content.className = 'section-content';
        
        // テーマ入力
        const themeInput = document.createElement('input');
        themeInput.type = 'text';
        themeInput.className = 'section-theme-input';
        themeInput.placeholder = 'テーマを入力';
        themeInput.value = section.theme;
        themeInput.maxLength = 50;
        themeInput.dataset.index = index;
        themeInput.addEventListener('input', (e) => handleThemeInput(e));
        
        // 画像エリア
        const imageArea = document.createElement('div');
        imageArea.className = 'section-image-area';
        imageArea.dataset.index = index;
        
        if (section.image) {
            const img = document.createElement('img');
            img.src = section.image;
            img.alt = section.title || 'Section image';
            imageArea.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>画像を追加</span>
            `;
            imageArea.appendChild(placeholder);
        }
        
        imageArea.addEventListener('click', () => handleImageAreaClick(index));
        
        content.appendChild(themeInput);
        content.appendChild(imageArea);
        
        gridItem.appendChild(header);
        gridItem.appendChild(content);
        
        return gridItem;
    }
    
    // タイトル入力ハンドラー
    function handleTitleInput(e) {
        const index = parseInt(e.target.dataset.index);
        state.gridSections[index].title = e.target.value;
        saveToLocalStorage();
    }
    
    // テーマ入力ハンドラー
    function handleThemeInput(e) {
        const index = parseInt(e.target.dataset.index);
        state.gridSections[index].theme = e.target.value;
        saveToLocalStorage();
    }
    
    // 画像エリアクリックハンドラー
    function handleImageAreaClick(index) {
        state.selectedSection = index;
        elements.uploadModal.classList.add('active');
    }
    
    // 画像アップロード処理
    function handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            showToast('画像ファイルを選択してください', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (state.selectedSection !== null) {
                state.gridSections[state.selectedSection].image = e.target.result;
                updateGridSection(state.selectedSection);
                closeModal();
                saveToLocalStorage();
                showToast('画像をアップロードしました', 'success');
            }
        };
        reader.readAsDataURL(file);
    }
    
    // グリッドセクションの更新
    function updateGridSection(index) {
        const gridItems = elements.themeGrid.querySelectorAll('.grid-section-item');
        const gridItem = gridItems[index];
        if (gridItem) {
            const newGridItem = createGridSection(index);
            gridItem.parentNode.replaceChild(newGridItem, gridItem);
        }
    }
    
    // グリッド全体の更新
    function updateGrid() {
        elements.themeGrid.innerHTML = '';
        const totalCells = state.gridSize * state.gridSize;
        
        for (let i = 0; i < totalCells; i++) {
            const gridItem = createGridSection(i);
            elements.themeGrid.appendChild(gridItem);
        }
    }
    
    // モーダルを閉じる
    function closeModal() {
        elements.uploadModal.classList.remove('active');
        state.selectedSection = null;
    }
    
    // グリッドサイズ変更
    function handleGridSizeChange(e) {
        const newSize = parseInt(e.target.value);
        const oldSize = state.gridSize;
        
        // データの保存
        const oldSections = [...state.gridSections];
        
        state.gridSize = newSize;
        const totalCells = newSize * newSize;
        
        // 新しいセクション配列を作成
        state.gridSections = [];
        for (let i = 0; i < totalCells; i++) {
            if (i < oldSections.length) {
                state.gridSections.push(oldSections[i]);
            } else {
                state.gridSections.push({
                    title: '',
                    theme: '',
                    image: null,
                    index: i
                });
            }
        }
        
        initializeGrid();
        updateGrid();
        saveToLocalStorage();
        showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
    }
    
    // 共有機能
    async function shareGrid() {
        const filledSections = state.gridSections.filter(section => 
            section.title.trim() !== '' || section.theme.trim() !== ''
        );
        
        if (filledSections.length === 0) {
            showToast('少なくとも1つのセクションにタイトルまたはテーマを入力してください', 'warning');
            return;
        }
        
        // 共有用のURLパラメータを生成
        const shareData = {
            size: state.gridSize,
            sections: state.gridSections.map(section => ({
                title: section.title,
                theme: section.theme
                // 画像は共有しない（サイズの問題）
            }))
        };
        
        // Base64エンコード
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
    
    // ローカルストレージへの保存
    function saveToLocalStorage() {
        const saveData = {
            size: state.gridSize,
            sections: state.gridSections,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('gridme-sections', JSON.stringify(saveData));
        } catch (err) {
            console.error('保存エラー:', err);
        }
    }
    
    // ローカルストレージからの読み込み
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('gridme-sections');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                state.gridSize = data.size || 3;
                state.gridSections = data.sections || [];
                
                // グリッドサイズセレクトを更新
                elements.gridSizeSelect.value = state.gridSize;
                
                return true;
            } catch (err) {
                console.error('読み込みエラー:', err);
            }
        }
        
        return false;
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
        // グリッドサイズ変更
        elements.gridSizeSelect.addEventListener('change', handleGridSizeChange);
        
        // 共有ボタン
        elements.mainShareBtn.addEventListener('click', shareGrid);
        if (elements.shareBtn) {
            elements.shareBtn.addEventListener('click', shareGrid);
        }
        
        // モーダル関連
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
    
    // 初期化
    function init() {
        const hasStoredData = loadFromLocalStorage();
        initializeGrid();
        if (hasStoredData) {
            updateGrid();
        }
        setupEventListeners();
        setupDragAndDrop();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();