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
        '季節', '天気', '食べ物', '飲み物',
        '色', 'ファッションスタイル', 'お菓子', 'スポーツ', '趣味',
        '自然現象', 'ブランド', '家電', 'ポケモン'
    ];
    
    // ランダムテーマを取得する関数
    function getRandomTheme() {
        return themeSuggestions[Math.floor(Math.random() * themeSuggestions.length)];
    }
    
    // ユニークなランダムテーマを取得する関数
    function getUniqueRandomThemes(count) {
        const shuffled = [...themeSuggestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
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
    
    // グリッドの初期化
    function initializeGrid() {
        const size = state.gridSize;
        const totalSections = size * size;
        
        // ユニークなテーマを取得
        const uniqueThemes = getUniqueRandomThemes(totalSections);
        
        // グリッドセクション配列の初期化
        state.gridSections = [];
        for (let i = 0; i < totalSections; i++) {
            const row = Math.floor(i / size);
            const col = i % size;
            const section = new GridSection(i, row, col);
            // ユニークなテーマを初期値として設定
            section.title = uniqueThemes[i] || '';
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
        
        // 要素の組み立て - テキストのみ追加
        gridItem.appendChild(titleInput);
        
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
        if (state.gridSections.some(section => section.title)) {
            // 元の値を保存
            const originalSize = state.gridSize;
            
            // カスタム確認モーダルを表示
            showGridSizeConfirmModal(() => {
                // 確認された場合
                state.gridSize = newSize;
                initializeGrid();
                showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
            }, () => {
                // キャンセルされた場合
                e.target.value = originalSize;
            });
            
            return;
        }
        
        state.gridSize = newSize;
        initializeGrid();
        showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
    }
    
    // 共有機能
    function shareGrid() {
        if (!checkAllSectionsCompleted()) {
            showToast('全てのセクションにテーマを入力してください', 'warning');
            return;
        }
        
        // ニックネームを取得または入力を求める
        let nickname = localStorage.getItem('gridme_nickname');
        
        if (!nickname) {
            // ニックネーム入力モーダルを表示
            showNicknameModal((enteredNickname) => {
                nickname = enteredNickname;
                localStorage.setItem('gridme_nickname', nickname);
                proceedWithShare(nickname);
            });
        } else {
            // 既存のニックネームを使用するか確認
            showNicknameConfirmModal(nickname, () => {
                // 既存のニックネームを使用
                proceedWithShare(nickname);
            }, () => {
                // 新しいニックネームを入力
                showNicknameModal((enteredNickname) => {
                    nickname = enteredNickname;
                    localStorage.setItem('gridme_nickname', nickname);
                    proceedWithShare(nickname);
                });
            });
        }
    }
    
    // 共有処理を実行
    function proceedWithShare(nickname) {
        // 共有URLを生成（ニックネームを含める）
        const shareUrl = generateShareUrl(nickname);
        
        // URLをモーダルに表示
        if (elements.shareUrlInput) {
            elements.shareUrlInput.value = shareUrl;
        }
        
        // モーダルを表示
        showModal();
    }
    
    // 共有URLを生成
    function generateShareUrl(nickname) {
        const shareData = {
            size: state.gridSize,
            sections: state.gridSections.map(section => ({
                title: section.title
            })),
            bgColor: state.gridBgColor,
            nickname: nickname || null
        };
        
        // UTF-8文字列をBase64エンコード
        const jsonString = JSON.stringify(shareData);
        const utf8Bytes = encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
            function(match, p1) {
                return String.fromCharCode('0x' + p1);
            });
        const encodedData = btoa(utf8Bytes);
        return `${window.location.origin}${window.location.pathname.replace('index.html', '')}shared.html?data=${encodeURIComponent(encodedData)}`;
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
    
    // 実際のダウンロード処理
    function performDownload() {
        // グリッドに背景色を一時的に設定
        const originalBg = elements.themeGrid.style.backgroundColor;
        elements.themeGrid.style.backgroundColor = state.gridBgColor;
        
        html2canvas(elements.themeGrid, {
            backgroundColor: state.gridBgColor,
            scale: 2 // 高解像度
        }).then(canvas => {
            // 元の背景色に戻す
            elements.themeGrid.style.backgroundColor = originalBg;
            
            // ブラウザのデフォルトダウンロードを使用（アルバム保存は自動的に処理される場合がある）
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `gridme-${new Date().getTime()}.png`;
                link.href = url;
                link.click();
                
                // リソースをクリーンアップ
                setTimeout(() => URL.revokeObjectURL(url), 100);
                
                showToast('ダウンロードを開始しました', 'success');
            }, 'image/png');
        }).catch(err => {
            // 元の背景色に戻す
            elements.themeGrid.style.backgroundColor = originalBg;
            console.error('ダウンロードエラー:', err);
            showToast('ダウンロードに失敗しました', 'error');
        });
    }
    
    // グリッド背景色を適用
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
        
        // ダウンロードボタン
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', downloadGrid);
        }
        
        // 背景色変更
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.addEventListener('input', handleBgColorChange);
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
    
    // ニックネーム入力モーダルを表示
    function showNicknameModal(onConfirm) {
        // モーダルHTMLを作成
        const modalHtml = `
            <div id="nickname-modal" class="app-modal">
                <div class="app-modal-content" style="max-width: 400px;">
                    <div class="app-modal-header">
                        <h3 class="app-modal-title">ニックネームを入力</h3>
                        <button class="app-modal-close">×</button>
                    </div>
                    <div class="app-modal-body">
                        <p style="margin-bottom: 16px;">共有グリッドで使用するニックネームを入力してください</p>
                        <input type="text" id="nickname-input" class="input" placeholder="例: たけし" style="width: 100%;">
                    </div>
                    <div class="app-modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">キャンセル</button>
                        <button class="btn btn-primary" data-action="confirm">決定</button>
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
            // 入力欄にフォーカス
            document.getElementById('nickname-input').focus();
        }, 10);
        
        // モーダルを閉じる関数
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        // 確認処理
        const handleConfirm = () => {
            const nicknameInput = document.getElementById('nickname-input');
            const nickname = nicknameInput.value.trim();
            
            if (!nickname) {
                showToast('ニックネームを入力してください', 'warning');
                return;
            }
            
            closeModal();
            if (onConfirm) onConfirm(nickname);
        };
        
        // 閉じるボタン
        modal.querySelector('.app-modal-close').addEventListener('click', closeModal);
        
        // 背景クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // キャンセルボタン
        modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);
        
        // 確認ボタン
        modal.querySelector('[data-action="confirm"]').addEventListener('click', handleConfirm);
        
        // Enterキーで確認
        document.getElementById('nickname-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            }
        });
    }
    
    // ニックネーム確認モーダルを表示
    function showNicknameConfirmModal(currentNickname, onUseExisting, onUseNew) {
        // モーダルHTMLを作成
        const modalHtml = `
            <div id="nickname-confirm-modal" class="app-modal">
                <div class="app-modal-content" style="max-width: 400px;">
                    <div class="app-modal-header">
                        <h3 class="app-modal-title">ニックネームの確認</h3>
                        <button class="app-modal-close">×</button>
                    </div>
                    <div class="app-modal-body">
                        <p>現在のニックネーム: <strong>${currentNickname}</strong></p>
                        <p style="margin-top: 12px;">このニックネームを使用しますか？</p>
                    </div>
                    <div class="app-modal-footer">
                        <button class="btn btn-secondary" data-action="new">新しいニックネーム</button>
                        <button class="btn btn-primary" data-action="use">このまま使用</button>
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
        modal.querySelector('.app-modal-close').addEventListener('click', closeModal);
        
        // 背景クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // 新しいニックネームボタン
        modal.querySelector('[data-action="new"]').addEventListener('click', () => {
            closeModal();
            if (onUseNew) onUseNew();
        });
        
        // このまま使用ボタン
        modal.querySelector('[data-action="use"]').addEventListener('click', () => {
            closeModal();
            if (onUseExisting) onUseExisting();
        });
    }
    
    

    // 初期化
    function init() {
        initializeGrid();
        setupEventListeners();
        loadSavedGrid();
        initializeThemeSuggestions();
        applyGridBackgroundColor();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();