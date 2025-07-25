/**
 * GridMe 共有グリッドページ (DEBUG VERSION)
 * 
 * 共有されたテーマグリッドを表示するページ
 * This version includes extensive debug logging for share URL issues
 */

(function() {
    'use strict';
    
    // Enable debug mode
    const DEBUG = true;
    
    // Debug logger
    function debugLog(category, message, data = null) {
        if (!DEBUG) return;
        
        const timestamp = new Date().toISOString();
        const logStyle = 'color: #FF8B25; font-weight: bold;';
        
        console.group(`%c[GridMe Debug - ${category}] ${timestamp}`, logStyle);
        console.log(message);
        if (data) {
            console.log('Data:', data);
        }
        console.groupEnd();
    }
    
    // 状態管理
    const state = {
        gridSize: 2,
        gridSections: [],
        uploadedImages: {}, // インデックスをキーとして画像を保存
        gridBgColor: '#FF8B25', // グリッド背景色のデフォルト値
        nickname: '' // ニックネームを保存
    };
    
    // DOM要素
    const elements = {
        photoThemeGrid: document.getElementById('photo-theme-grid'),
        mainShareBtn: document.getElementById('main-share-btn'),
        downloadBtn: document.getElementById('download-grid-btn'),
        copyUrlBtn: document.getElementById('copy-url-btn'),
        shareTwitterBtn: document.getElementById('share-twitter-btn'),
        shareLineBtn: document.getElementById('share-line-btn'),
        shareUrlInput: document.getElementById('share-url-input'),
        gridBgColorInput: document.getElementById('grid-bg-color'),
        shareModal: document.getElementById('share-modal'),
        shareModalClose: null
    };
    
    // URLパラメータからデータを取得
    function getSharedData() {
        debugLog('URL_PARSING', 'Starting to parse shared data from URL');
        
        const fullUrl = window.location.href;
        debugLog('URL_PARSING', 'Full URL', { url: fullUrl, length: fullUrl.length });
        
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        
        debugLog('URL_PARSING', 'URL Parameters', {
            hasDataParam: !!encodedData,
            dataLength: encodedData ? encodedData.length : 0,
            allParams: Array.from(urlParams.entries())
        });
        
        if (!encodedData) {
            debugLog('URL_PARSING', 'ERROR: No data parameter found in URL');
            showToast('共有データが見つかりません', 'error');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 2000);
            return null;
        }
        
        try {
            // Log the raw encoded data
            debugLog('DECODING', 'Raw encoded data', {
                length: encodedData.length,
                first100: encodedData.substring(0, 100),
                last100: encodedData.substring(Math.max(0, encodedData.length - 100))
            });
            
            // URLパラメータは自動的にデコードされるが、念のため再度デコード
            debugLog('DECODING', 'Step 1: URL decode');
            const decodedUrlData = decodeURIComponent(encodedData);
            debugLog('DECODING', 'After URL decode', {
                length: decodedUrlData.length,
                first100: decodedUrlData.substring(0, 100),
                isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(decodedUrlData)
            });
            
            // Base64デコード後、UTF-8として解釈
            debugLog('DECODING', 'Step 2: Base64 decode');
            const decodedBase64 = atob(decodedUrlData);
            debugLog('DECODING', 'After Base64 decode', {
                length: decodedBase64.length,
                firstBytes: decodedBase64.substring(0, 50).split('').map(c => c.charCodeAt(0))
            });
            
            // UTF-8バイト列を文字列に変換
            debugLog('DECODING', 'Step 3: UTF-8 decode');
            const decodedString = decodeURIComponent(decodedBase64.split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            debugLog('DECODING', 'After UTF-8 decode', {
                length: decodedString.length,
                first200: decodedString.substring(0, 200),
                isValidJSON: decodedString.trim().startsWith('{') && decodedString.trim().endsWith('}')
            });
            
            // Parse JSON
            debugLog('DECODING', 'Step 4: JSON parse');
            const parsedData = JSON.parse(decodedString);
            debugLog('DECODING', 'Successfully parsed data', {
                size: parsedData.size,
                nickname: parsedData.nickname,
                bgColor: parsedData.bgColor,
                sectionsCount: parsedData.sections ? parsedData.sections.length : 0,
                hasImages: !!parsedData.images,
                imageCount: parsedData.images ? Object.keys(parsedData.images).length : 0
            });
            
            return parsedData;
        } catch (err) {
            debugLog('DECODING', 'ERROR during decoding', {
                error: err.message,
                stack: err.stack,
                errorType: err.name
            });
            console.error('データのデコードエラー:', err);
            showToast('共有データの読み込みに失敗しました', 'error');
            return null;
        }
    }
    
    // サブタイトルテキストを更新
    function updateSubtitleText() {
        const subtitleElement = document.querySelector('.shared-subtitle');
        if (!subtitleElement || !state.nickname) return;
        
        // アップロードされた画像の数をカウント
        const imageCount = Object.keys(state.uploadedImages).length;
        
        if (imageCount > 0) {
            // 画像がある場合：長押しで削除できることを案内
            subtitleElement.textContent = '画像を長押しすると画像を削除できるよ';
        } else {
            // 画像がない場合：元のメッセージ
            subtitleElement.textContent = `${state.nickname}にあった画像を追加してね`;
        }
    }
    
    // グリッドの初期化
    function initializeGrid() {
        debugLog('INIT', 'Starting grid initialization');
        
        const sharedData = getSharedData();
        if (!sharedData) {
            debugLog('INIT', 'No shared data available, aborting initialization');
            return;
        }
        
        state.gridSize = sharedData.size || 2;
        state.gridSections = sharedData.sections || [];
        state.gridBgColor = sharedData.bgColor || '#FF8B25';
        state.nickname = sharedData.nickname || '';
        
        // Load images if available
        if (sharedData.images) {
            state.uploadedImages = sharedData.images;
            debugLog('INIT', 'Loaded images from shared data', {
                imageCount: Object.keys(sharedData.images).length,
                indices: Object.keys(sharedData.images)
            });
        }
        
        // ニックネームがある場合はタイトルとサブタイトルを更新
        if (sharedData.nickname) {
            const titleElement = document.querySelector('.shared-title');
            const subtitleElement = document.querySelector('.shared-subtitle');
            
            if (titleElement) {
                titleElement.textContent = `${sharedData.nickname} をGridしましょう`;
            }
            updateSubtitleText();
        }
        
        // グリッドHTMLの生成
        elements.photoThemeGrid.innerHTML = '';
        elements.photoThemeGrid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
        elements.photoThemeGrid.style.gridTemplateRows = `repeat(${state.gridSize}, 1fr)`;
        
        state.gridSections.forEach((section, index) => {
            const gridItem = createGridItem(section, index);
            elements.photoThemeGrid.appendChild(gridItem);
            
            // If we have an image for this index, display it
            if (state.uploadedImages[index]) {
                updatePhotoDisplay(index);
            }
        });
        
        // 背景色を適用
        applyGridBackgroundColor();
        
        // カラーピッカーの値を設定
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.value = state.gridBgColor;
        }
        
        debugLog('INIT', 'Grid initialization complete');
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
            debugLog('IMAGE_UPLOAD', 'Processing image file', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                index: index
            });
            
            // 画像を圧縮してから保存
            compressImage(file, (compressedDataUrl) => {
                debugLog('IMAGE_UPLOAD', 'Image compressed', {
                    originalSize: file.size,
                    compressedLength: compressedDataUrl.length,
                    compressionRatio: (compressedDataUrl.length / file.size).toFixed(2),
                    index: index
                });
                
                // 圧縮された画像を保存
                state.uploadedImages[index] = compressedDataUrl;
                
                // 画像を表示
                updatePhotoDisplay(index);
                
                // モーダルを閉じる
                closeUploadModal();
                
                showToast('画像をアップロードしました', 'success');
                
                // サブタイトルテキストを更新
                updateSubtitleText();
            });
        }
    }
    
    // 画像圧縮関数
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // キャンバスを作成
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 最大サイズを設定（共有用に小さくする）
                const maxSize = 300;
                let width = img.width;
                let height = img.height;
                
                // アスペクト比を保持しながらリサイズ
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                // キャンバスのサイズを設定
                canvas.width = width;
                canvas.height = height;
                
                // 画像を描画
                ctx.drawImage(img, 0, 0, width, height);
                
                // 圧縮されたデータURLを取得（JPEG形式で品質70%）
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                callback(compressedDataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
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
        
        // Hide theme text when image is uploaded
        const themeText = gridItem.querySelector('.theme-text');
        if (themeText) {
            themeText.style.display = 'none';
        }
        
        // サブタイトルテキストを更新
        updateSubtitleText();
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
            
            // サブタイトルテキストを更新
            updateSubtitleText();
            
            showToast('画像を削除しました', 'success');
        }
    }
    
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
    
    // 共有モーダルを表示
    function showShareModal() {
        debugLog('SHARE', 'Opening share modal');
        
        if (elements.shareModal) {
            elements.shareModal.classList.add('active');
        }
        
        // 画像を含めた新しい共有URLを生成
        const shareData = {
            size: state.gridSize,
            sections: state.gridSections,
            bgColor: state.gridBgColor,
            nickname: state.nickname,
            images: state.uploadedImages // 画像データを含める
        };
        
        debugLog('SHARE', 'Preparing share data', {
            size: shareData.size,
            sectionsCount: shareData.sections.length,
            bgColor: shareData.bgColor,
            nickname: shareData.nickname,
            imageCount: Object.keys(shareData.images).length,
            imageSizes: Object.entries(shareData.images).map(([key, value]) => ({
                index: key,
                size: value.length
            }))
        });
        
        // データをエンコード
        const encodedData = encodeShareData(shareData);
        
        if (!encodedData) {
            debugLog('SHARE', 'ERROR: Failed to encode share data');
            showToast('共有URLの生成に失敗しました', 'error');
            return;
        }
        
        // theme-grid.htmlへのURLを生成
        const baseUrl = window.location.origin + window.location.pathname.replace('shared.html', 'theme-grid.html');
        const shareUrl = `${baseUrl}?data=${encodeURIComponent(encodedData)}`;
        
        debugLog('SHARE', 'Generated share URL', {
            baseUrl: baseUrl,
            encodedDataLength: encodedData.length,
            urlEncodedLength: encodeURIComponent(encodedData).length,
            finalUrlLength: shareUrl.length,
            urlLengthStatus: shareUrl.length < 2048 ? 'OK' : shareUrl.length < 8192 ? 'WARNING' : 'TOO_LONG'
        });
        
        if (shareUrl.length > 2048) {
            console.warn('Share URL is longer than 2048 characters, may not work in all browsers');
            showToast('警告: URLが長すぎる可能性があります', 'warning');
        }
        
        if (elements.shareUrlInput) {
            elements.shareUrlInput.value = shareUrl;
        }
    }
    
    // 共有データのエンコード
    function encodeShareData(data) {
        try {
            debugLog('ENCODING', 'Starting encode process');
            
            // Step 1: JSON stringify
            const jsonString = JSON.stringify(data);
            debugLog('ENCODING', 'Step 1: JSON stringify', {
                length: jsonString.length,
                first100: jsonString.substring(0, 100)
            });
            
            // Step 2: UTF-8 encode
            const utf8Bytes = encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
                function(match, p1) {
                    return String.fromCharCode('0x' + p1);
                });
            debugLog('ENCODING', 'Step 2: UTF-8 encode', {
                length: utf8Bytes.length
            });
            
            // Step 3: Base64 encode
            const base64Result = btoa(utf8Bytes);
            debugLog('ENCODING', 'Step 3: Base64 encode', {
                length: base64Result.length,
                first100: base64Result.substring(0, 100),
                last100: base64Result.substring(Math.max(0, base64Result.length - 100))
            });
            
            return base64Result;
        } catch (error) {
            debugLog('ENCODING', 'ERROR during encoding', {
                error: error.message,
                stack: error.stack
            });
            console.error('Share data encode error:', error);
            return null;
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
        const shareUrl = elements.shareUrlInput.value; // 生成された共有URLを使用
        
        debugLog('SHARE', 'Copying URL to clipboard', {
            urlLength: shareUrl.length
        });
        
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
        const shareUrl = elements.shareUrlInput.value; // 生成された共有URLを使用
        const text = encodeURIComponent('GridMe!!でフォトグリッドを作成しました！');
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
        
        debugLog('SHARE', 'Sharing on Twitter', {
            shareUrlLength: shareUrl.length,
            twitterUrlLength: twitterUrl.length
        });
        
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
    
    // LINEで共有
    function shareOnLine() {
        const shareUrl = elements.shareUrlInput.value; // 生成された共有URLを使用
        const text = encodeURIComponent('GridMe!!でフォトグリッドを作成しました！');
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        
        debugLog('SHARE', 'Sharing on LINE', {
            shareUrlLength: shareUrl.length,
            lineUrlLength: lineUrl.length
        });
        
        window.open(lineUrl, '_blank', 'width=600,height=400');
    }
    
    // ダウンロード機能（写真アルバムへの保存）
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
    
    // フォールバックダウンロード処理
    function fallbackDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        
        // リソースをクリーンアップ
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        showToast('画像を保存しました', 'success');
    }
    
    // 実際のダウンロード処理
    async function performDownload() {
        // グリッドに背景色を一時的に設定
        const originalBg = elements.photoThemeGrid.style.backgroundColor;
        elements.photoThemeGrid.style.backgroundColor = state.gridBgColor;
        
        // スケールファクターを取得（高解像度対応）
        const scale = 3; // html2canvasのscaleと同じ値
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // html2canvasの前に画像を手動でクロップ処理
        const images = elements.photoThemeGrid.querySelectorAll('.uploaded-image');
        const originalImageStyles = [];
        const imageLoadPromises = [];
        
        // 各画像を一時的にCanvasでクロップした画像に置き換える
        images.forEach((img, index) => {
            if (img.complete && img.naturalWidth > 0) {
                const container = img.closest('.photo-display-area') || img.closest('.image-container');
                if (container) {
                    // 元のスタイルを保存
                    originalImageStyles.push({
                        element: img,
                        src: img.src,
                        style: img.style.cssText
                    });
                    
                    // 一時的なCanvasを作成してクロップ
                    const tempCanvas = document.createElement('canvas');
                    const ctx = tempCanvas.getContext('2d');
                    
                    // 高解像度用のサイズを計算
                    const displaySize = container.getBoundingClientRect().width;
                    const canvasSize = displaySize * scale;
                    
                    tempCanvas.width = canvasSize;
                    tempCanvas.height = canvasSize;
                    
                    // 画像のアスペクト比を計算して正方形にクロップ
                    const imgAspect = img.naturalWidth / img.naturalHeight;
                    let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;
                    
                    if (imgAspect > 1) {
                        // 横長の画像：左右をクロップ（中央を残す）
                        sWidth = img.naturalHeight;
                        sx = (img.naturalWidth - sWidth) / 2;
                    } else if (imgAspect < 1) {
                        // 縦長の画像：上下をクロップ（中央を残す）
                        sHeight = img.naturalWidth;
                        sy = (img.naturalHeight - sHeight) / 2;
                    }
                    // 正方形の画像はそのまま
                    
                    // 高品質でクロップして描画
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasSize, canvasSize);
                    
                    // 新しい画像の読み込みを待つPromiseを作成
                    const loadPromise = new Promise((resolve) => {
                        const newImg = new Image();
                        newImg.onload = () => {
                            img.src = tempCanvas.toDataURL('image/png', 1.0);
                            // 元のスタイルを維持しながら、幅と高さを明示的に設定
                            img.style.width = displaySize + 'px';
                            img.style.height = displaySize + 'px';
                            img.style.objectFit = 'contain';
                            resolve();
                        };
                        newImg.src = tempCanvas.toDataURL('image/png', 1.0);
                    });
                    
                    imageLoadPromises.push(loadPromise);
                }
            }
        });
        
        // すべての画像の読み込みを待つ
        await Promise.all(imageLoadPromises);
        
        // 少し待機して、DOMの更新を確実に反映させる
        await new Promise(resolve => setTimeout(resolve, 100));
        
        html2canvas(elements.photoThemeGrid, {
            backgroundColor: state.gridBgColor,
            scale: 3, // より高解像度（画質向上）
            useCORS: true, // CORS画像のサポート
            allowTaint: true, // 外部画像の許可
            logging: false, // デバッグログを無効化
            imageTimeout: 0, // 画像タイムアウトを無効化
            // html2canvasのoncloneは画像のスタイル調整には使用しない
            onclone: (clonedDoc) => {
                // クローンされたドキュメントのグリッドを取得
                const clonedGrid = clonedDoc.getElementById('photo-theme-grid');
                
                // グリッドのサイズを明示的に設定
                if (clonedGrid) {
                    const computedStyle = window.getComputedStyle(elements.photoThemeGrid);
                    clonedGrid.style.width = computedStyle.width;
                    clonedGrid.style.height = computedStyle.height;
                }
                
                // 各グリッドアイテムと画像コンテナのサイズを固定
                const clonedGridItems = clonedDoc.querySelectorAll('.grid-theme-item');
                clonedGridItems.forEach((item, index) => {
                    const originalItem = elements.photoThemeGrid.querySelectorAll('.grid-theme-item')[index];
                    if (originalItem) {
                        const originalRect = originalItem.getBoundingClientRect();
                        item.style.width = originalRect.width + 'px';
                        item.style.height = originalRect.height + 'px';
                    }
                });
                
                // 画像表示エリアのサイズを固定
                const clonedPhotoAreas = clonedDoc.querySelectorAll('.photo-display-area');
                clonedPhotoAreas.forEach((area, index) => {
                    const originalArea = elements.photoThemeGrid.querySelectorAll('.photo-display-area')[index];
                    if (originalArea) {
                        const originalRect = originalArea.getBoundingClientRect();
                        area.style.width = originalRect.width + 'px';
                        area.style.height = originalRect.height + 'px';
                        area.style.position = 'relative';
                        area.style.overflow = 'hidden';
                        area.style.aspectRatio = '1';
                    }
                });
                
                // 画像コンテナのサイズを固定
                const clonedContainers = clonedDoc.querySelectorAll('.image-container');
                clonedContainers.forEach((container, index) => {
                    const originalContainer = elements.photoThemeGrid.querySelectorAll('.image-container')[index];
                    if (originalContainer) {
                        const originalRect = originalContainer.getBoundingClientRect();
                        container.style.width = originalRect.width + 'px';
                        container.style.height = originalRect.height + 'px';
                        container.style.position = 'relative';
                    }
                });
                
                // クローンされたドキュメントでは、既にクロップ済みの画像を使用するため
                // 追加のスタイル調整は不要
            }
        }).then(canvas => {
            // 元の背景色に戻す
            elements.photoThemeGrid.style.backgroundColor = originalBg;
            
            // 元の画像に戻す
            originalImageStyles.forEach(item => {
                item.element.src = item.src;
                item.element.style.cssText = item.style;
            });
            
            // 画像をBlobに変換
            canvas.toBlob(async (blob) => {
                const filename = `gridme-${new Date().getTime()}.png`;
                
                // モバイルデバイスでWeb Share APIが利用可能な場合
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
                    try {
                        const file = new File([blob], filename, { type: 'image/png' });
                        await navigator.share({
                            files: [file],
                            title: 'GridMe フォトグリッド',
                            text: 'GridMeで作成したフォトグリッド'
                        });
                        showToast('画像を共有しました', 'success');
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            console.error('共有エラー:', err);
                            // 共有に失敗した場合は通常のダウンロードにフォールバック
                            fallbackDownload(blob, filename);
                        }
                    }
                } else {
                    // Web Share APIが利用できない場合は通常のダウンロード
                    fallbackDownload(blob, filename);
                }
            }, 'image/png');
        }).catch(err => {
            // 元の背景色に戻す
            elements.photoThemeGrid.style.backgroundColor = originalBg;
            
            // エラー時も元の画像に戻す
            if (originalImageStyles && originalImageStyles.length > 0) {
                originalImageStyles.forEach(item => {
                    item.element.src = item.src;
                    item.element.style.cssText = item.style;
                });
            }
            
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
                // 画像を圧縮してから保存
                compressImage(file, (compressedDataUrl) => {
                    state.uploadedImages[index] = compressedDataUrl;
                    updatePhotoDisplay(index);
                    closeUploadModal();
                    showToast('画像をアップロードしました', 'success');
                    updateSubtitleText();
                });
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
        debugLog('INIT', 'Starting application initialization');
        
        // Log browser information
        debugLog('BROWSER_INFO', 'Browser details', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            windowSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screenSize: {
                width: screen.width,
                height: screen.height
            }
        });
        
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