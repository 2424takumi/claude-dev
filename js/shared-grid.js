/**
 * GridMe 共有グリッドページ
 * 
 * 共有されたテーマグリッドを表示するページ
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 2,
        gridSections: [],
        uploadedImages: {} // インデックスをキーとして画像を保存
    };
    
    // DOM要素
    const elements = {
        photoThemeGrid: document.getElementById('photo-theme-grid'),
        downloadBtn: document.getElementById('download-grid-btn'),
        shareInstagramBtn: document.getElementById('share-instagram-stories-btn')
    };
    
    // URLパラメータからデータを取得
    function getSharedData() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        
        if (!encodedData) {
            showToast('共有データが見つかりません', 'error');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 2000);
            return null;
        }
        
        try {
            const decodedData = decodeURIComponent(escape(atob(encodedData)));
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
        
        state.gridSize = sharedData.size || 2;
        state.gridSections = sharedData.sections || [];
        
        // グリッドHTMLの生成
        elements.photoThemeGrid.innerHTML = '';
        elements.photoThemeGrid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
        elements.photoThemeGrid.style.gridTemplateRows = `repeat(${state.gridSize}, 1fr)`;
        
        state.gridSections.forEach((section, index) => {
            const gridItem = createGridItem(section, index);
            elements.photoThemeGrid.appendChild(gridItem);
        });
    }
    
    // グリッドアイテムの作成
    function createGridItem(section, index) {
        const gridItem = document.createElement('div');
        gridItem.className = 'photo-theme-item';
        gridItem.dataset.index = index;
        
        // セクションコンテナ
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'shared-section-container';
        
        // タイトル表示
        const titleDiv = document.createElement('div');
        titleDiv.className = 'shared-section-title';
        titleDiv.textContent = section.title || `テーマ ${index + 1}`;
        
        // 写真表示エリア
        const photoArea = document.createElement('div');
        photoArea.className = 'photo-display-area';
        photoArea.dataset.index = index;
        
        // フリップカードの内部構造
        const flipCardInner = document.createElement('div');
        flipCardInner.className = 'flip-card-inner';
        
        // カードの表面（写真またはプラスアイコン）
        const flipCardFront = document.createElement('div');
        flipCardFront.className = 'flip-card-front';
        
        // プラスアイコン
        const addPhotoIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        addPhotoIcon.className = 'add-photo-icon';
        addPhotoIcon.setAttribute('viewBox', '0 0 24 24');
        addPhotoIcon.setAttribute('fill', 'none');
        addPhotoIcon.setAttribute('stroke', 'currentColor');
        addPhotoIcon.setAttribute('stroke-width', '2');
        addPhotoIcon.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
        
        flipCardFront.appendChild(addPhotoIcon);
        
        // カードの裏面（テーマテキスト）
        const flipCardBack = document.createElement('div');
        flipCardBack.className = 'flip-card-back';
        
        const themeText = document.createElement('div');
        themeText.className = 'theme-text';
        themeText.textContent = section.title || `テーマ ${index + 1}`;
        
        flipCardBack.appendChild(themeText);
        
        // 要素の組み立て
        flipCardInner.appendChild(flipCardFront);
        flipCardInner.appendChild(flipCardBack);
        photoArea.appendChild(flipCardInner);
        
        sectionContainer.appendChild(titleDiv);
        sectionContainer.appendChild(photoArea);
        gridItem.appendChild(sectionContainer);
        
        // クリックイベントの設定
        photoArea.addEventListener('click', (e) => handlePhotoAreaClick(e, index));
        
        return gridItem;
    }
    
    // テーマラベルを取得
    function getThemeLabel(theme) {
        const themeMap = {
            'default': 'デフォルト',
            'warm': '暖色',
            'cool': '寒色',
            'nature': '自然',
            'elegant': 'エレガント',
            'modern': 'モダン'
        };
        return themeMap[theme] || 'デフォルト';
    }
    
    // 写真エリアのクリックハンドラー
    function handlePhotoAreaClick(e, index) {
        const photoArea = e.currentTarget;
        
        // 画像がアップロードされている場合はフリップ
        if (state.uploadedImages[index]) {
            photoArea.classList.toggle('flipped');
        } else {
            // 画像がない場合はアップロードモーダルを開く
            openUploadModal(index);
        }
    }
    
    // アップロードモーダルを開く
    function openUploadModal(index) {
        const modal = document.getElementById('upload-modal');
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        // 現在のインデックスを保存
        uploadArea.dataset.targetIndex = index;
        
        // モーダルを表示
        modal.classList.add('active');
        
        // ファイル選択イベント
        fileInput.onchange = (e) => handleFileSelect(e, index);
    }
    
    // ファイル選択処理
    function handleFileSelect(e, index) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // 画像を保存
                state.uploadedImages[index] = e.target.result;
                
                // 画像を表示
                updatePhotoDisplay(index);
                
                // モーダルを閉じる
                closeUploadModal();
                
                showToast('画像をアップロードしました', 'success');
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // 写真表示を更新
    function updatePhotoDisplay(index) {
        const photoArea = document.querySelector(`.photo-display-area[data-index="${index}"]`);
        const flipCardFront = photoArea.querySelector('.flip-card-front');
        
        // 既存のコンテンツをクリア
        flipCardFront.innerHTML = '';
        
        // 画像を追加
        const img = document.createElement('img');
        img.className = 'uploaded-image';
        img.src = state.uploadedImages[index];
        img.alt = `アップロードされた画像 ${index + 1}`;
        
        flipCardFront.appendChild(img);
    }
    
    // アップロードモーダルを閉じる
    function closeUploadModal() {
        const modal = document.getElementById('upload-modal');
        const fileInput = document.getElementById('file-input');
        
        modal.classList.remove('active');
        fileInput.value = '';
    }
    
    // ダウンロード機能
    function downloadGrid() {
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
    
    // Instagram Stories共有機能
    function shareInstagramStories() {
        // html2canvasライブラリを使用してグリッドをキャプチャ
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                createInstagramStoriesImage();
            };
            document.head.appendChild(script);
        } else {
            createInstagramStoriesImage();
        }
    }
    
    // Instagram Stories用の画像を作成
    function createInstagramStoriesImage() {
        const gridContainer = elements.photoThemeGrid;
        
        // Create a temporary container for Instagram Stories format (9:16 aspect ratio)
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '1080px';
        tempContainer.style.height = '1920px';
        tempContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        tempContainer.style.display = 'flex';
        tempContainer.style.flexDirection = 'column';
        tempContainer.style.alignItems = 'center';
        tempContainer.style.justifyContent = 'center';
        tempContainer.style.padding = '80px';
        tempContainer.style.boxSizing = 'border-box';
        
        // Add title
        const title = document.createElement('h1');
        title.textContent = 'GridMe フォトグリッド';
        title.style.color = 'white';
        title.style.fontSize = '64px';
        title.style.marginBottom = '40px';
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.textShadow = '0 4px 6px rgba(0,0,0,0.3)';
        
        // Clone and style the grid
        const gridClone = gridContainer.cloneNode(true);
        gridClone.style.width = '920px';
        gridClone.style.height = '920px';
        gridClone.style.background = 'white';
        gridClone.style.borderRadius = '24px';
        gridClone.style.padding = '40px';
        gridClone.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
        
        // Add URL footer
        const footer = document.createElement('div');
        footer.style.marginTop = '40px';
        footer.style.color = 'white';
        footer.style.fontSize = '32px';
        footer.style.textAlign = 'center';
        footer.innerHTML = 'Created with GridMe<br><span style="font-size: 24px; opacity: 0.8;">Share your photos!</span>';
        
        tempContainer.appendChild(title);
        tempContainer.appendChild(gridClone);
        tempContainer.appendChild(footer);
        document.body.appendChild(tempContainer);
        
        // Generate image
        html2canvas(tempContainer, {
            width: 1080,
            height: 1920,
            scale: 1,
            backgroundColor: null
        }).then(canvas => {
            // Remove temporary container
            document.body.removeChild(tempContainer);
            
            // Convert to blob
            canvas.toBlob((blob) => {
                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `gridme-instagram-stories-${Date.now()}.png`;
                link.href = url;
                link.click();
                
                // Show instructions
                showToast('画像をダウンロードしました。Instagramアプリでストーリーズに投稿してください！', 'success');
                
                // Clean up
                setTimeout(() => URL.revokeObjectURL(url), 100);
            }, 'image/png');
        }).catch(err => {
            document.body.removeChild(tempContainer);
            console.error('Instagram Stories画像の作成エラー:', err);
            showToast('画像の作成に失敗しました', 'error');
        });
    }
    
    // 実際のダウンロード処理
    function performDownload() {
        html2canvas(elements.photoThemeGrid).then(canvas => {
            const link = document.createElement('a');
            link.download = `gridme-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('ダウンロードを開始しました', 'success');
        }).catch(err => {
            console.error('ダウンロードエラー:', err);
            showToast('ダウンロードに失敗しました', 'error');
        });
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', downloadGrid);
        }
        
        if (elements.shareInstagramBtn) {
            elements.shareInstagramBtn.addEventListener('click', shareInstagramStories);
        }
        
        // モーダル関連のイベント
        const modal = document.getElementById('upload-modal');
        const modalClose = modal.querySelector('.app-modal-close');
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        // モーダルを閉じる
        modalClose.addEventListener('click', closeUploadModal);
        
        // モーダルの背景クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeUploadModal();
            }
        });
        
        // アップロードエリアのクリック
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // ドラッグ＆ドロップの処理
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const index = parseInt(uploadArea.dataset.targetIndex);
            const file = e.dataTransfer.files[0];
            
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    state.uploadedImages[index] = e.target.result;
                    updatePhotoDisplay(index);
                    closeUploadModal();
                    showToast('画像をアップロードしました', 'success');
                };
                
                reader.readAsDataURL(file);
            }
        });
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
    
    // 初期化
    function init() {
        initializeGrid();
        setupEventListeners();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();