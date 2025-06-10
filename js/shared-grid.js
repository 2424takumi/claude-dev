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
        uploadedImages: {}, // インデックスをキーとして画像を保存
        gridBgColor: '#FF8B25' // グリッド背景色のデフォルト値
    };
    
    // DOM要素
    const elements = {
        photoThemeGrid: document.getElementById('photo-theme-grid'),
        mainShareBtn: document.getElementById('main-share-btn'),
        downloadBtn: document.getElementById('download-grid-btn'),
        shareInstagramBtn: document.getElementById('share-instagram-btn'),
        copyUrlBtn: document.getElementById('copy-url-btn'),
        shareTwitterBtn: document.getElementById('share-twitter-btn'),
        shareFacebookBtn: document.getElementById('share-facebook-btn'),
        shareLineBtn: document.getElementById('share-line-btn'),
        shareUrlInput: document.getElementById('share-url-input'),
        gridBgColorInput: document.getElementById('grid-bg-color'),
        shareModal: document.getElementById('share-modal'),
        shareModalClose: null
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
            // URLパラメータは自動的にデコードされるが、念のため再度デコード
            const decodedUrlData = decodeURIComponent(encodedData);
            // Base64デコード後、UTF-8として解釈
            const decodedBase64 = atob(decodedUrlData);
            // UTF-8バイト列を文字列に変換
            const decodedString = decodeURIComponent(decodedBase64.split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(decodedString);
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
        state.gridBgColor = sharedData.bgColor || '#FF8B25';
        

        // ニックネームがある場合はタイトルとサブタイトルを更新
        if (sharedData.nickname) {
            const titleElement = document.querySelector('.shared-title');
            const subtitleElement = document.querySelector('.shared-subtitle');
            
            if (titleElement) {
                titleElement.textContent = `${sharedData.nickname} をGridしましょう`;
            }
            if (subtitleElement) {
                subtitleElement.textContent = `${sharedData.nickname}にあった画像を追加してね`;
            }
        }
        
        // グリッドHTMLの生成
        elements.photoThemeGrid.innerHTML = '';
        elements.photoThemeGrid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
        elements.photoThemeGrid.style.gridTemplateRows = `repeat(${state.gridSize}, 1fr)`;
        
        state.gridSections.forEach((section, index) => {
            const gridItem = createGridItem(section, index);
            elements.photoThemeGrid.appendChild(gridItem);
        });
        
        // 背景色を適用
        applyGridBackgroundColor();
        
        // カラーピッカーの値を設定
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.value = state.gridBgColor;
        }
    }
    
    // グリッドアイテムの作成
    function createGridItem(section, index) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-theme-item';
        gridItem.dataset.index = index;
        
        // テーマテキストを追加
        if (section.title) {
            const themeText = document.createElement('div');
            themeText.className = 'theme-text';
            themeText.textContent = section.title;
            gridItem.appendChild(themeText);
        }
        
        // セクションコンテナ
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'grid-section-container';
        
        // 写真表示エリア
        const photoArea = document.createElement('div');
        photoArea.className = 'photo-display-area';
        photoArea.dataset.index = index;
        
        // プラスアイコン
        const addPhotoIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        addPhotoIcon.setAttribute('class', 'add-photo-icon');
        addPhotoIcon.setAttribute('viewBox', '0 0 24 24');
        addPhotoIcon.setAttribute('fill', 'none');
        addPhotoIcon.setAttribute('stroke', 'currentColor');
        addPhotoIcon.setAttribute('stroke-width', '2');
        addPhotoIcon.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
        
        photoArea.appendChild(addPhotoIcon);
        
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
    
    // ページのタイトルとサブタイトルを更新
    function updatePageTitles(nickname) {
        const sharedTitle = document.querySelector('.shared-title');
        const sharedSubtitle = document.querySelector('.shared-subtitle');
        
        if (sharedTitle) {
            sharedTitle.textContent = `${nickname} Grid`;
        }
        
        if (sharedSubtitle) {
            sharedSubtitle.textContent = `Please add photos related to ${nickname}.`;
        }
    }
    
    // 写真エリアのクリックハンドラー
    function handlePhotoAreaClick(e, index) {
        // Always open upload modal when clicking on photo area
        openUploadModal(index);
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
        const gridItem = photoArea.closest('.grid-theme-item');
        
        // 既存のコンテンツをクリア
        photoArea.innerHTML = '';
        
        // 画像コンテナを作成
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        
        // 画像を追加
        const img = document.createElement('img');
        img.className = 'uploaded-image';
        img.src = state.uploadedImages[index];
        img.alt = `アップロードされた画像 ${index + 1}`;
        
        // 削除ボタンを作成
        const deleteButton = document.createElement('button');
        deleteButton.className = 'image-delete-button';
        deleteButton.innerHTML = '&times;';
        deleteButton.setAttribute('aria-label', '画像を削除');
        deleteButton.style.display = 'none'; // 初期状態は非表示
        
        // 削除ボタンのクリックイベント
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteImage(index);
        });
        
        imageContainer.appendChild(img);
        imageContainer.appendChild(deleteButton);
        photoArea.appendChild(imageContainer);
        
        // has-imageクラスを追加
        photoArea.classList.add('has-image');
        gridItem.classList.add('has-image');
        
        // 長押し検出の設定
        setupLongPressDetection(img, deleteButton);
        
        // Do not hide theme text when image is uploaded - keep it above the image
        // grid-menu-button functionality removed as requested

        // Hide theme text when image is uploaded
        const themeText = gridItem.querySelector('.theme-text');
        if (themeText) {
            themeText.style.display = 'none';
        }

    }
    
    // 長押し検出の設定
    function setupLongPressDetection(img, deleteButton) {
        let pressTimer = null;
        let isLongPress = false;
        
        // タッチイベント（モバイル用）
        img.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pressTimer = setTimeout(() => {
                isLongPress = true;
                deleteButton.style.display = 'block';
                // 5秒後に自動的に非表示
                setTimeout(() => {
                    if (deleteButton.style.display === 'block') {
                        deleteButton.style.display = 'none';
                    }
                }, 5000);
            }, 500); // 500ms = 0.5秒の長押し
        });
        
        img.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
            if (!isLongPress) {
                // 短いタップの場合は何もしない
            }
            isLongPress = false;
        });
        
        img.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
            isLongPress = false;
        });
        
        // マウスイベント（デスクトップ用）
        img.addEventListener('mousedown', (e) => {
            e.preventDefault();
            pressTimer = setTimeout(() => {
                isLongPress = true;
                deleteButton.style.display = 'block';
                // 5秒後に自動的に非表示
                setTimeout(() => {
                    if (deleteButton.style.display === 'block') {
                        deleteButton.style.display = 'none';
                    }
                }, 5000);
            }, 500); // 500ms = 0.5秒の長押し
        });
        
        img.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
            if (!isLongPress) {
                // 短いクリックの場合は何もしない
            }
            isLongPress = false;
        });
        
        img.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
            isLongPress = false;
        });
        
        // 画像の外側をクリックしたら削除ボタンを非表示
        document.addEventListener('click', (e) => {
            if (!img.contains(e.target) && !deleteButton.contains(e.target)) {
                deleteButton.style.display = 'none';
            }
        });
    }
    
    // 画像を削除
    function deleteImage(index) {
        if (confirm('この画像を削除しますか？')) {
            // 画像データを削除
            delete state.uploadedImages[index];
            
            // 表示をリセット
            resetPhotoDisplay(index);
            
            showToast('画像を削除しました', 'success');
        }
    }
    
    // Photo menu functionality removed as grid-menu-button is deleted
    
    // 写真表示をリセット
    function resetPhotoDisplay(index) {
        const photoArea = document.querySelector(`.photo-display-area[data-index="${index}"]`);
        const gridItem = photoArea.closest('.grid-theme-item');
        
        // クラスを削除
        photoArea.classList.remove('has-image');
        gridItem.classList.remove('has-image');
        
        // Show theme text again when image is removed
        const themeText = gridItem.querySelector('.theme-text');
        if (themeText) {
            themeText.style.display = 'block';
        }
        
        // コンテンツをリセット
        photoArea.innerHTML = '';
        
        // プラスアイコンを再追加
        const addPhotoIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        addPhotoIcon.setAttribute('class', 'add-photo-icon');
        addPhotoIcon.setAttribute('viewBox', '0 0 24 24');
        addPhotoIcon.setAttribute('fill', 'none');
        addPhotoIcon.setAttribute('stroke', 'currentColor');
        addPhotoIcon.setAttribute('stroke-width', '2');
        addPhotoIcon.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
        
        photoArea.appendChild(addPhotoIcon);
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
    
    // 共有モーダルを表示
    function showShareModal() {
        if (elements.shareModal) {
            elements.shareModal.classList.add('active');
        }
        
        // 現在のURLを共有URLとして設定
        if (elements.shareUrlInput) {
            elements.shareUrlInput.value = window.location.href;
        }
    }
    
    // 共有モーダルを閉じる
    function closeShareModal() {
        if (elements.shareModal) {
            elements.shareModal.classList.remove('active');
        }
    }
    
    // URLをコピー
    async function copyShareUrl() {
        const shareUrl = window.location.href;
        
        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast('URLをコピーしました', 'success');
        } catch (err) {
            console.error('コピーエラー:', err);
            showToast('URLのコピーに失敗しました', 'error');
        }
    }
    
    // Twitterで共有
    function shareOnTwitter() {
        const shareUrl = window.location.href;
        const text = encodeURIComponent('GridMe!!でフォトグリッドを作成しました！');
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
    
    // Facebookで共有
    function shareOnFacebook() {
        const shareUrl = window.location.href;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
    
    // LINEで共有
    function shareOnLine() {
        const shareUrl = window.location.href;
        const text = encodeURIComponent('GridMe!!でフォトグリッドを作成しました！');
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        window.open(lineUrl, '_blank', 'width=600,height=400');
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
        // 共有ボタン
        if (elements.mainShareBtn) {
            elements.mainShareBtn.addEventListener('click', showShareModal);
        }
        
        // ダウンロードボタン（モーダル内）
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', () => {
                downloadGrid();
                closeShareModal();
            });
        }
        
        // Instagram Storiesボタン（モーダル内）
        if (elements.shareInstagramBtn) {
            elements.shareInstagramBtn.addEventListener('click', () => {
                shareInstagramStories();
                closeShareModal();
            });
        }
        
        // 新しいSNS共有ボタンのイベントリスナー
        if (elements.copyUrlBtn) {
            elements.copyUrlBtn.addEventListener('click', () => {
                copyShareUrl();
            });
        }
        
        if (elements.shareTwitterBtn) {
            elements.shareTwitterBtn.addEventListener('click', () => {
                shareOnTwitter();
            });
        }
        
        if (elements.shareFacebookBtn) {
            elements.shareFacebookBtn.addEventListener('click', () => {
                shareOnFacebook();
            });
        }
        
        if (elements.shareLineBtn) {
            elements.shareLineBtn.addEventListener('click', () => {
                shareOnLine();
            });
        }
        
        // カラーピッカーのイベント
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.addEventListener('input', handleBgColorChange);
        }
        
        // 共有モーダル関連
        if (elements.shareModal) {
            // モーダルの閉じるボタンを取得
            elements.shareModalClose = elements.shareModal.querySelector('.app-modal-close');
            
            // モーダルを閉じる
            if (elements.shareModalClose) {
                elements.shareModalClose.addEventListener('click', closeShareModal);
            }
            
            // モーダル背景クリックで閉じる
            elements.shareModal.addEventListener('click', (e) => {
                if (e.target === elements.shareModal) {
                    closeShareModal();
                }
            });
        }
        
        // アップロードモーダル関連のイベント
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
                
                reader.onload = (evt) => {
                    state.uploadedImages[index] = evt.target.result;
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
    
    // グリッド背景色を適用
    function applyGridBackgroundColor() {
        if (elements.photoThemeGrid) {
            elements.photoThemeGrid.style.backgroundColor = state.gridBgColor;
        }
    }
    
    // 背景色変更ハンドラー
    function handleBgColorChange(e) {
        state.gridBgColor = e.target.value;
        applyGridBackgroundColor();
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