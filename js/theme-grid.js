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
        '動物', 'キャラクター', '花', '季節', '天気',
        '食べ物', '飲み物', '色', 'お菓子', 'スポーツ',
        '趣味', 'ポケモン'
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
        shareLineBtn: document.getElementById('share-line-btn'),
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
        titleInput.rows = 1;
        
        // イベントリスナーの追加
        titleInput.addEventListener('input', (e) => {
            handleSectionUpdate(e);
            adjustTextareaHeight(e.target);
        });
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
        
        // 初期コンテンツがある場合は高さを調整
        if (section.title) {
            setTimeout(() => adjustTextareaHeight(titleInput), 0);
        }
        
        return gridItem;
    }
    
    // テキストエリアの高さを自動調整
    function adjustTextareaHeight(textarea) {
        // 一旦高さをリセット
        textarea.style.height = '2.2em';
        
        // スクロール高さを取得
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight);
        const padding = parseFloat(window.getComputedStyle(textarea).paddingTop) + 
                       parseFloat(window.getComputedStyle(textarea).paddingBottom);
        
        // 2行分の高さを計算（行の高さ × 2 + パディング）
        const twoLinesHeight = (lineHeight * 2) + padding;
        
        // 内容が1行を超える場合は2行分の高さに設定
        if (scrollHeight > textarea.offsetHeight) {
            textarea.style.height = Math.min(scrollHeight, twoLinesHeight) + 'px';
        }
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
    
    
    // LINEで共有
    function shareOnLine() {
        const shareUrl = elements.shareUrlInput?.value || generateShareUrl();
        const text = encodeURIComponent('GridMe!!私ってどんな感じ？');
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        window.open(lineUrl, '_blank', 'width=600,height=400');
    }
    
    
    // ダウンロード機能
    async function downloadGrid() {
        // html2canvasライブラリを使用してグリッドをキャプチャ
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = async () => {
                // 新しい高画質エクスポート機能をロード
                try {
                    const module = await import('./utils/image-export.js');
                    showQualityOptions(module);
                } catch (error) {
                    console.error('Failed to load image export module:', error);
                    // フォールバック: 従来の方法で実行
                    performDownload();
                }
            };
            document.head.appendChild(script);
        } else {
            // 新しい高画質エクスポート機能を使用
            try {
                const module = await import('./utils/image-export.js');
                showQualityOptions(module);
            } catch (error) {
                console.error('Failed to load image export module:', error);
                // フォールバック: 従来の方法で実行
                performDownload();
            }
        }
    }
    
    // 画質選択ダイアログを表示
    function showQualityOptions(exportModule) {
        const modal = document.createElement('div');
        modal.className = 'quality-modal';
        modal.innerHTML = `
            <div class="quality-modal-content">
                <h3>画質を選択してください</h3>
                <div class="quality-options">
                    <button class="quality-option" data-quality="LOW">
                        <span class="quality-name">標準画質</span>
                        <span class="quality-desc">ファイルサイズ小・SNS共有向け</span>
                    </button>
                    <button class="quality-option" data-quality="MEDIUM">
                        <span class="quality-name">高画質</span>
                        <span class="quality-desc">バランスの取れた画質</span>
                    </button>
                    <button class="quality-option" data-quality="HIGH">
                        <span class="quality-name">最高画質</span>
                        <span class="quality-desc">印刷・大画面表示向け</span>
                    </button>
                    <button class="quality-option" data-quality="LOSSLESS">
                        <span class="quality-name">ロスレス (PNG)</span>
                        <span class="quality-desc">劣化なし・編集用</span>
                    </button>
                </div>
                <button class="quality-cancel">キャンセル</button>
            </div>
        `;
        
        // スタイルを追加
        const style = document.createElement('style');
        style.textContent = `
            .quality-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            .quality-modal-content {
                background: var(--surface);
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                animation: slideUp 0.3s ease;
            }
            .quality-modal h3 {
                margin: 0 0 20px;
                color: var(--text-primary);
                text-align: center;
            }
            .quality-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 20px;
            }
            .quality-option {
                background: var(--surface-hover);
                border: 2px solid transparent;
                border-radius: 12px;
                padding: 16px;
                text-align: left;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .quality-option:hover {
                background: var(--primary-gradient-start);
                border-color: var(--primary);
                transform: translateY(-2px);
            }
            .quality-name {
                display: block;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 4px;
            }
            .quality-desc {
                display: block;
                font-size: 0.875rem;
                color: var(--text-secondary);
            }
            .quality-cancel {
                width: 100%;
                padding: 12px;
                background: transparent;
                border: 1px solid var(--text-secondary);
                border-radius: 8px;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .quality-cancel:hover {
                background: var(--surface-hover);
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // イベントハンドラーを設定
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('quality-cancel')) {
                modal.remove();
                style.remove();
            }
        });
        
        modal.querySelectorAll('.quality-option').forEach(btn => {
            btn.addEventListener('click', async () => {
                const qualityKey = btn.dataset.quality;
                const quality = exportModule.EXPORT_QUALITY[qualityKey];
                
                modal.remove();
                style.remove();
                
                // 高画質エクスポートを実行
                showToast('画像を生成中...', 'info');
                
                try {
                    // グリッドに背景色を一時的に設定
                    const originalBg = elements.themeGrid.style.backgroundColor;
                    elements.themeGrid.style.backgroundColor = state.gridBgColor;
                    
                    const result = await exportModule.exportHighQualityImage(elements.themeGrid, {
                        quality,
                        backgroundColor: state.gridBgColor,
                        autoDownload: true
                    });
                    
                    // 元の背景色に戻す
                    elements.themeGrid.style.backgroundColor = originalBg;
                    
                    const sizeInKB = Math.round(result.size / 1024);
                    showToast(`ダウンロード完了！(${sizeInKB}KB)`, 'success');
                } catch (error) {
                    console.error('Export error:', error);
                    showToast('ダウンロードに失敗しました', 'error');
                    // フォールバック: 従来の方法で実行
                    performDownload();
                }
            });
        });
        
        document.body.appendChild(modal);
    }
    
    // 実際のダウンロード処理（写真アルバムへの保存対応）
    async function performDownload() {
        // グリッドに背景色を一時的に設定
        const originalBg = elements.themeGrid.style.backgroundColor;
        elements.themeGrid.style.backgroundColor = state.gridBgColor;
        
        try {
            const canvas = await html2canvas(elements.themeGrid, {
                backgroundColor: state.gridBgColor,
                scale: 2, // 高解像度
                useCORS: true, // CORS画像のサポート
                allowTaint: true, // 外部画像の許可
                logging: false, // デバッグログを無効化
                imageTimeout: 0, // 画像タイムアウトを無効化
                onclone: (clonedDoc) => {
                    // クローンされたドキュメントで画像のスタイルを確実に適用
                    const clonedImages = clonedDoc.querySelectorAll('.uploaded-image');
                    clonedImages.forEach(img => {
                        img.style.objectFit = 'cover';
                        img.style.objectPosition = 'center';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.position = 'absolute';
                        img.style.top = '0';
                        img.style.left = '0';
                    });
                }
            });
            
            // 元の背景色に戻す
            elements.themeGrid.style.backgroundColor = originalBg;
            
            const filename = `gridme-${new Date().getTime()}.png`;
            
            // CanvasをBlobに変換
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Web Share APIをサポートしているかチェック（モバイルでの写真アルバム保存）
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
                // Web Share APIを使用して写真を共有（モバイルでは写真アルバムに保存可能）
                const file = new File([blob], filename, { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'GridMe',
                        text: 'GridMeで作成した画像'
                    });
                    showToast('画像を保存しました', 'success');
                } catch (err) {
                    // ユーザーがキャンセルした場合
                    if (err.name === 'AbortError') {
                        showToast('保存をキャンセルしました', 'info');
                    } else {
                        throw err;
                    }
                }
            } else {
                // Web Share APIがサポートされていない場合は従来のダウンロード
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = filename;
                link.href = url;
                link.click();
                
                // リソースをクリーンアップ
                setTimeout(() => URL.revokeObjectURL(url), 100);
                
                showToast('ダウンロードを開始しました', 'success');
            }
        } catch (err) {
            // 元の背景色に戻す
            elements.themeGrid.style.backgroundColor = originalBg;
            console.error('ダウンロードエラー:', err);
            showToast('ダウンロードに失敗しました', 'error');
        }
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
        if (elements.shareLineBtn) {
            elements.shareLineBtn.addEventListener('click', shareOnLine);
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
                // 高さも調整
                adjustTextareaHeight(state.currentFocusedInput);
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