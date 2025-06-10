/**
 * GridMe テーマグリッドアプリケーション
 * 
 * 動的サイズのテーマグリッドでテーマを管理するインタラクティブなアプリケーション
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 3, // デフォルトを3x3に設定
        gridSections: [], // グリッドセクションを格納
        saveTimeout: null,
        currentFocusedInput: null, // 現在フォーカスされている入力フィールド
        gridBgColor: '#FF8B25' // グリッド背景色のデフォルト値
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
        shareModalClose: null,
        copyUrlBtn: document.getElementById('copy-url-btn'),
        shareTwitterBtn: document.getElementById('share-twitter-btn'),
        shareFacebookBtn: document.getElementById('share-facebook-btn'),
        shareLineBtn: document.getElementById('share-line-btn'),
        shareInstagramBtn: document.getElementById('share-instagram-btn'),
        shareUrlInput: document.getElementById('share-url-input'),
        gridBgColorInput: document.getElementById('grid-bg-color-input')
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
            const section = new GridSection(i, row, col);
            // ランダムテーマを初期値として設定
            section.title = getRandomTheme();
            state.gridSections.push(section);
        }
        
        // グリッドHTMLの生成
        renderGrid();
        
        // 背景色を適用
        applyGridBackgroundColor();
        
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
        
        // フォトグリッドのタイトルも更新
        updatePhotoGridTitle(index, value);
        
        // 全てのセクションが完了しているかチェック
        checkAllSectionsCompleted();
        
        // 自動保存
        autoSave();
    }
    
    // フォトグリッドのタイトルを更新
    function updatePhotoGridTitle(index, title) {
        const photoGrid = document.getElementById('photo-theme-grid');
        if (!photoGrid) return;
        
        const photoItem = photoGrid.querySelector(`[data-index="${index}"]`);
        if (!photoItem) return;
        
        // タイトル表示を更新
        const titleDiv = photoItem.querySelector('.shared-section-title');
        if (titleDiv) {
            titleDiv.textContent = title || `テーマ ${index + 1}`;
        }
        
        // フリップカードの裏面のテキストも更新
        const themeText = photoItem.querySelector('.theme-text');
        if (themeText) {
            themeText.textContent = title || `テーマ ${index + 1}`;
        }
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
        if (state.gridSections.some(section => section.title)) {
            // 元の値を保存
            const originalSize = state.gridSize;
            
            // カスタム確認モーダルを表示
            showGridSizeConfirmModal(() => {
                // 確認された場合
                state.gridSize = newSize;
                initializeGrid();
                updatePhotoGrid();
                showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
            }, () => {
                // キャンセルされた場合
                e.target.value = originalSize;
            });
            
            return;
        }
        
        state.gridSize = newSize;
        initializeGrid();
        updatePhotoGrid();
        showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
    }
    
    // 共有機能
    function shareGrid() {
        if (!checkAllSectionsCompleted()) {
            showToast('全てのセクションにテーマを入力してください', 'warning');
            return;
        }
        
        // 共有URLを生成
        const shareUrl = generateShareUrl();
        
        // URLをモーダルに表示
        if (elements.shareUrlInput) {
            elements.shareUrlInput.value = shareUrl;
        }
        
        // モーダルを表示
        showModal();
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
        
        // UTF-8文字列をBase64エンコード
        const jsonString = JSON.stringify(shareData);
        const utf8Bytes = encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
            function(match, p1) {
                return String.fromCharCode('0x' + p1);
            });
        const encodedData = btoa(utf8Bytes);
        return `${window.location.origin}${window.location.pathname.replace('index.html', '')}shared.html?data=${encodedData}`;
    }
    
    // モーダルを表示
    function showModal() {
        if (elements.shareModal) {
            elements.shareModal.classList.add('active');
        }
    }
    
    // モーダルを閉じる
    function closeModal() {
        if (elements.shareModal) {
            elements.shareModal.classList.remove('active');
        }
    }
    
    // URLをコピー
    async function copyShareUrl() {
        const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
        
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
        const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
        const text = encodeURIComponent('GridMe!!私ってどんな感じ？');
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
    
    // Facebookで共有
    function shareOnFacebook() {
        const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
    
    // LINEで共有
    function shareOnLine() {
        const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
        const text = encodeURIComponent('GridMe!!私ってどんな感じ？');
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        window.open(lineUrl, '_blank', 'width=600,height=400');
    }
    
    // Instagram Storiesで共有
    function shareOnInstagram() {
        // Instagram Stories sharing works differently - we need to prepare the grid as an image
        // and provide instructions since Instagram doesn't support direct web sharing to stories
        prepareGridForInstagramStories();
    }
    
    // Instagram Stories用にグリッドを準備
    function prepareGridForInstagramStories() {
        // Check if html2canvas is loaded
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
        const gridContainer = elements.themeGrid;
        
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
        title.textContent = 'GridMe テーマグリッド';
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
        footer.innerHTML = 'Created with GridMe<br><span style="font-size: 24px; opacity: 0.8;">Share your themes!</span>';
        
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
    
    // グリッド背景色を適用
    function applyGridBackgroundColor() {
        if (elements.themeGrid) {
            elements.themeGrid.style.backgroundColor = state.gridBgColor;
        }
        // フォトグリッドにも背景色を適用
        const photoThemeGrid = document.getElementById('photo-theme-grid');
        if (photoThemeGrid) {
            photoThemeGrid.style.backgroundColor = state.gridBgColor;
        }
    }
    
    // 背景色変更ハンドラー
    function handleBgColorChange(e) {
        state.gridBgColor = e.target.value;
        applyGridBackgroundColor();
        autoSave();
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
            bgColor: state.gridBgColor,
            uploadedImages: state.uploadedImages || {},
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
                state.gridSize = data.size || 3;
                
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
                
                // 背景色を復元
                if (data.bgColor) {
                    state.gridBgColor = data.bgColor;
                    if (elements.gridBgColorInput) {
                        elements.gridBgColorInput.value = state.gridBgColor;
                    }
                }
                
                // アップロードされた画像を復元
                if (data.uploadedImages) {
                    state.uploadedImages = data.uploadedImages;
                }
                
                // グリッドを再描画
                renderGrid();
                applyGridBackgroundColor();
                checkAllSectionsCompleted();
                
                // フォトグリッドも初期化（画像を含む）
                initializePhotoGrid();
                if (state.uploadedImages) {
                    Object.keys(state.uploadedImages).forEach(index => {
                        updatePhotoDisplay(parseInt(index));
                    });
                }
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
        
        // モーダル関連
        if (elements.shareModal) {
            // モーダルの閉じるボタンを取得
            elements.shareModalClose = elements.shareModal.querySelector('.app-modal-close');
            
            // モーダルを閉じる
            if (elements.shareModalClose) {
                elements.shareModalClose.addEventListener('click', closeModal);
            }
            
            // モーダル背景クリックで閉じる
            elements.shareModal.addEventListener('click', (e) => {
                if (e.target === elements.shareModal) {
                    closeModal();
                }
            });
        }
        
        // 共有オプションボタン
        if (elements.copyUrlBtn) {
            elements.copyUrlBtn.addEventListener('click', copyShareUrl);
        }
        if (elements.shareTwitterBtn) {
            elements.shareTwitterBtn.addEventListener('click', shareOnTwitter);
        }
        if (elements.shareFacebookBtn) {
            elements.shareFacebookBtn.addEventListener('click', shareOnFacebook);
        }
        if (elements.shareLineBtn) {
            elements.shareLineBtn.addEventListener('click', shareOnLine);
        }
        if (elements.shareInstagramBtn) {
            elements.shareInstagramBtn.addEventListener('click', shareOnInstagram);
        }
        
        // 背景色変更
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.addEventListener('input', handleBgColorChange);
        }
        
        // アップロードモーダルのイベント設定
        const uploadModal = document.getElementById('upload-modal');
        if (uploadModal) {
            // 閉じるボタン
            const uploadModalClose = uploadModal.querySelector('.app-modal-close');
            if (uploadModalClose) {
                uploadModalClose.addEventListener('click', () => {
                    uploadModal.classList.remove('active');
                });
            }
            
            // 背景クリックで閉じる
            uploadModal.addEventListener('click', (e) => {
                if (e.target === uploadModal) {
                    uploadModal.classList.remove('active');
                }
            });
            
            // アップロードエリアのクリック
            const uploadArea = document.getElementById('upload-area');
            const fileInput = document.getElementById('file-input');
            if (uploadArea && fileInput) {
                uploadArea.addEventListener('click', () => {
                    fileInput.click();
                });
                
                // ドラッグ&ドロップのサポート
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
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0 && files[0].type.startsWith('image/')) {
                        const targetIndex = uploadArea.dataset.targetIndex;
                        if (targetIndex !== undefined) {
                            fileInput.files = files;
                            handlePhotoFileSelect({ target: { files } }, parseInt(targetIndex));
                        }
                    }
                });
            }
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
    
    // グリッドサイズ変更確認モーダルを表示
    function showGridSizeConfirmModal(onConfirm, onCancel) {
        // モーダルHTMLを作成
        const modalHtml = `
            <div id="grid-size-confirm-modal" class="app-modal">
                <div class="app-modal-content">
                    <div class="app-modal-header">
                        <h3 class="app-modal-title">確認</h3>
                        <button class="app-modal-close">×</button>
                    </div>
                    <div class="app-modal-body">
                        <p>グリッドサイズを変更すると、現在の内容が失われます。続行しますか？</p>
                    </div>
                    <div class="app-modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">キャンセル</button>
                        <button class="btn btn-primary" data-action="confirm">変更する</button>
                    </div>
                </div>
            </div>
        `;
        
        // 一時的なモーダルを作成
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        const modal = tempDiv.firstElementChild;
        document.body.appendChild(modal);
        
        // モーダルを表示
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // モーダルを閉じる関数
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        // 閉じるボタン
        modal.querySelector('.app-modal-close').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });
        
        // 背景クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                if (onCancel) onCancel();
            }
        });
        
        // キャンセルボタン
        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });
        
        // 確認ボタン
        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });
    }
    
    // フォトグリッドの初期化
    function initializePhotoGrid() {
        const photoThemeGrid = document.getElementById('photo-theme-grid');
        if (!photoThemeGrid) return;
        
        // 現在のグリッドサイズとセクションを使用
        const size = state.gridSize;
        const sections = state.gridSections;
        
        // グリッドスタイルの設定
        photoThemeGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        photoThemeGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        // 各セクションに対してフォトグリッドアイテムを作成
        sections.forEach((section, index) => {
            const photoItem = createPhotoGridItem(section, index);
            photoThemeGrid.appendChild(photoItem);
        });
        
        // 背景色を適用
        const bgColor = document.getElementById('grid-bg-color').value;
        photoThemeGrid.style.backgroundColor = bgColor;
    }
    
    // フォトグリッドアイテムの作成
    function createPhotoGridItem(section, index) {
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
    
    // 写真エリアのクリックハンドラー
    function handlePhotoAreaClick(e, index) {
        const photoArea = e.currentTarget;
        
        // 画像がアップロードされている場合はフリップ
        if (state.uploadedImages && state.uploadedImages[index]) {
            photoArea.classList.toggle('flipped');
        } else {
            // 画像がない場合はアップロードモーダルを開く
            openPhotoUploadModal(index);
        }
    }
    
    // フォトアップロードモーダルを開く
    function openPhotoUploadModal(index) {
        const modal = document.getElementById('upload-modal');
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        // 現在のインデックスを保存
        uploadArea.dataset.targetIndex = index;
        
        // モーダルを表示
        modal.classList.add('active');
        
        // ファイル選択イベント
        fileInput.onchange = (e) => handlePhotoFileSelect(e, index);
    }
    
    // フォトファイル選択処理
    function handlePhotoFileSelect(e, index) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // uploadedImagesが未定義の場合は初期化
                if (!state.uploadedImages) {
                    state.uploadedImages = {};
                }
                
                // 画像を保存
                state.uploadedImages[index] = e.target.result;
                
                // 画像を表示
                updatePhotoDisplay(index);
                
                // モーダルを閉じる
                const modal = document.getElementById('upload-modal');
                modal.classList.remove('active');
                
                showToast('画像をアップロードしました', 'success');
                
                // 画像を保存
                autoSave();
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
        
        // has-imageクラスを追加
        photoArea.classList.add('has-image');
    }
    
    // フォトグリッドの更新（グリッドサイズ変更時）
    function updatePhotoGrid() {
        const photoThemeGrid = document.getElementById('photo-theme-grid');
        if (!photoThemeGrid) return;
        
        // グリッドをクリアして再初期化
        photoThemeGrid.innerHTML = '';
        initializePhotoGrid();
    }

    // 初期化
    function init() {
        initializeGrid();
        setupEventListeners();
        loadSavedGrid();
        initializeThemeSuggestions();
        applyGridBackgroundColor();
        initializePhotoGrid();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();