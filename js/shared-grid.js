/**
 * GridMe 共有グリッドページ
 * 
 * 共有されたテーマグリッドに写真を追加できるページ
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 3,
        gridSections: [],
        gridImages: [],
        selectedCell: null
    };
    
    // DOM要素
    const elements = {
        photoThemeGrid: document.getElementById('photo-theme-grid'),
        uploadModal: document.getElementById('upload-modal'),
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input'),
        modalClose: document.querySelector('.modal-close'),
        downloadBtn: document.getElementById('download-grid-btn')
    };
    
    // URLパラメータからデータを取得
    function getSharedData() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        
        if (!encodedData) {
            showToast('共有データが見つかりません', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return null;
        }
        
        try {
            const decodedData = atob(encodedData);
            return JSON.parse(decodedData);
        } catch (err) {
            console.error('データのデコードエラー:', err);
            showToast('共有データの読み込みに失敗しました', 'error');
            return null;
        }
    }
    
    // グリッドの初期化
    function initializeGrid() {
        const sharedData = getSharedData();
        if (!sharedData) return;
        
        state.gridSize = sharedData.size || 3;
        state.gridSections = sharedData.sections || [];
        const totalCells = state.gridSize * state.gridSize;
        state.gridImages = new Array(totalCells).fill(null);
        
        // グリッドHTMLの生成
        elements.photoThemeGrid.innerHTML = '';
        elements.photoThemeGrid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
        elements.photoThemeGrid.style.gridTemplateRows = `repeat(${state.gridSize}, 1fr)`;
        
        for (let i = 0; i < totalCells; i++) {
            const section = state.gridSections[i] || { title: '', theme: '' };
            const gridItem = createPhotoSection(i, section);
            elements.photoThemeGrid.appendChild(gridItem);
        }
        
        // 保存されたデータを読み込む
        loadSavedImages();
    }
    
    // 写真セクションの作成
    function createPhotoSection(index, section) {
        const gridItem = document.createElement('div');
        gridItem.className = 'photo-section-item empty';
        gridItem.dataset.index = index;
        
        // セクションヘッダー（タイトル表示）
        if (section.title) {
            const header = document.createElement('div');
            header.className = 'photo-section-header';
            header.textContent = section.title;
            gridItem.appendChild(header);
        }
        
        // テーマラベル
        const themeLabel = document.createElement('div');
        themeLabel.className = 'photo-theme-label';
        themeLabel.textContent = section.theme || `セクション ${index + 1}`;
        
        // 写真プレースホルダー
        const placeholder = document.createElement('div');
        placeholder.className = 'photo-placeholder';
        
        if (state.gridImages[index]) {
            placeholder.innerHTML = `<img src="${state.gridImages[index]}" alt="${section.title || section.theme || 'Grid image'}">`;
            gridItem.classList.remove('empty');
        } else {
            placeholder.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>写真を追加</span>
            `;
        }
        
        gridItem.appendChild(themeLabel);
        gridItem.appendChild(placeholder);
        
        gridItem.addEventListener('click', () => handleCellClick(index));
        
        return gridItem;
    }
    
    // セルクリックハンドラー
    function handleCellClick(index) {
        state.selectedCell = index;
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
            if (state.selectedCell !== null) {
                state.gridImages[state.selectedCell] = e.target.result;
                updateGridDisplay();
                closeModal();
                saveImages();
                showToast('画像をアップロードしました', 'success');
            }
        };
        reader.readAsDataURL(file);
    }
    
    // グリッド表示の更新
    function updateGridDisplay() {
        const gridItems = elements.photoThemeGrid.querySelectorAll('.photo-section-item');
        
        gridItems.forEach((item, index) => {
            const image = state.gridImages[index];
            const placeholder = item.querySelector('.photo-placeholder');
            const section = state.gridSections[index] || { title: '', theme: '' };
            
            if (image) {
                item.classList.remove('empty');
                placeholder.innerHTML = `<img src="${image}" alt="${section.title || section.theme || 'Grid image'}">`;
            } else {
                item.classList.add('empty');
                placeholder.innerHTML = `
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>写真を追加</span>
                `;
            }
        });
    }
    
    // モーダルを閉じる
    function closeModal() {
        elements.uploadModal.classList.remove('active');
        state.selectedCell = null;
    }
    
    // 画像データの保存
    function saveImages() {
        const saveKey = `gridme-shared-${btoa(JSON.stringify(state.gridSections)).substring(0, 20)}`;
        const saveData = {
            images: state.gridImages,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(saveKey, JSON.stringify(saveData));
        } catch (err) {
            console.error('保存エラー:', err);
            showToast('画像の保存に失敗しました', 'warning');
        }
    }
    
    // 保存された画像の読み込み
    function loadSavedImages() {
        const saveKey = `gridme-shared-${btoa(JSON.stringify(state.gridSections)).substring(0, 20)}`;
        const savedData = localStorage.getItem(saveKey);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                state.gridImages = data.images || [];
                updateGridDisplay();
            } catch (err) {
                console.error('読み込みエラー:', err);
            }
        }
    }
    
    // ダウンロード機能
    function downloadGrid() {
        const filledImages = state.gridImages.filter(img => img !== null);
        
        if (filledImages.length === 0) {
            showToast('ダウンロードする画像がありません', 'warning');
            return;
        }
        
        // html2canvasライブラリを使用してグリッドをキャプチャ
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                performDownload();
            };
            document.head.appendChild(script);
        } else {
            performDownload();
        }
    }
    
    // 実際のダウンロード処理
    function performDownload() {
        html2canvas(elements.photoThemeGrid).then(canvas => {
            const link = document.createElement('a');
            link.download = `gridme-photos-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('ダウンロードを開始しました', 'success');
        }).catch(err => {
            console.error('ダウンロードエラー:', err);
            showToast('ダウンロードに失敗しました', 'error');
        });
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
        elements.modalClose.addEventListener('click', closeModal);
        elements.uploadModal.addEventListener('click', (e) => {
            if (e.target === elements.uploadModal) {
                closeModal();
            }
        });
        
        elements.downloadBtn.addEventListener('click', downloadGrid);
        
        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.uploadModal.classList.contains('active')) {
                closeModal();
            }
        });
    }
    
    // 初期化
    function init() {
        initializeGrid();
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