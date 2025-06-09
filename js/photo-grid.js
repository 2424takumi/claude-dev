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
        selectedCell: null,
        gridTexts: new Array(81).fill(null),
        gridComplete: false,
        shareId: null
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
        modalClose: document.querySelector('.app-modal-close')
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
            
            // テキストまたは+記号を表示
            if (state.gridTexts[i]) {
                placeholder.textContent = state.gridTexts[i];
                placeholder.style.fontSize = '14px';
                placeholder.style.padding = '5px';
            } else {
                placeholder.textContent = '+';
            }
            
            gridItem.appendChild(placeholder);
            
            gridItem.addEventListener('click', () => handleCellClick(i));
            elements.photoGrid.appendChild(gridItem);
        }
    }
    
    // セルクリックハンドラー
    function handleCellClick(index) {
        // 共有されたグリッドの場合のみ写真アップロードを許可
        if (state.shareId && state.gridTexts[index] && !state.gridImages[index]) {
            state.selectedCell = index;
            elements.uploadModal.classList.add('active');
        } else if (!state.shareId) {
            // 通常モードでは常に写真アップロード可能
            state.selectedCell = index;
            elements.uploadModal.classList.add('active');
        }
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
        
        // テーマに基づいてグリッドにテキストを配置
        if (!state.shareId) {
            generateGridTexts(theme);
        }
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
    
    // グリッドテキストの生成
    function generateGridTexts(theme) {
        // テーマに基づいてテキストラベルを生成
        const labels = [];
        const words = theme.split(/\s+/);
        const baseWords = ['写真', '思い出', '瞬間', '景色', '風景', '美しさ', '魅力', '感動'];
        
        // テーマの単語とベース単語を組み合わせてラベルを生成
        for (let i = 0; i < 81; i++) {
            if (Math.random() < 0.3) { // 30%の確率でテキストを配置
                const wordIndex = Math.floor(Math.random() * words.length);
                const baseIndex = Math.floor(Math.random() * baseWords.length);
                labels.push(`${words[wordIndex] || theme}の${baseWords[baseIndex]}`);
            } else {
                labels.push(null);
            }
        }
        
        state.gridTexts = labels;
        updateGridDisplay();
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
        state.gridTexts = new Array(81).fill(null);
        state.gridComplete = false;
        state.shareId = null;
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
            const text = state.gridTexts[index];
            
            if (image) {
                item.classList.remove('empty');
                item.innerHTML = `<img src="${image}" alt="Grid image ${index + 1}">`;
            } else if (text) {
                item.classList.add('empty');
                const placeholder = document.createElement('div');
                placeholder.className = 'grid-placeholder';
                placeholder.textContent = text;
                placeholder.style.fontSize = '14px';
                placeholder.style.padding = '5px';
                placeholder.style.whiteSpace = 'normal';
                placeholder.style.lineHeight = '1.2';
                item.innerHTML = '';
                item.appendChild(placeholder);
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
                
                // 共有グリッドで全ての写真が追加されたかチェック
                if (state.shareId) {
                    checkGridCompletion();
                }
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
        
        // グリッドデータを準備
        const gridData = {
            theme: state.currentTheme,
            texts: state.gridTexts.filter(t => t !== null),
            timestamp: Date.now()
        };
        
        // Base64エンコード
        const encodedData = btoa(encodeURIComponent(JSON.stringify(gridData)));
        const shareUrl = `${window.location.origin}${window.location.pathname}?grid=${encodedData}`;
        
        const shareData = {
            title: `GridMe - ${state.currentTheme}`,
            text: `「${state.currentTheme}」のフォトグリッドを作成しました！`,
            url: shareUrl
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showToast('共有しました', 'success');
            } else {
                // フォールバック: URLをクリップボードにコピー
                await navigator.clipboard.writeText(shareUrl);
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
    
    // グリッド完成チェック
    function checkGridCompletion() {
        // テキストがあるセルが全て画像で埋まっているかチェック
        let isComplete = true;
        for (let i = 0; i < 81; i++) {
            if (state.gridTexts[i] && !state.gridImages[i]) {
                isComplete = false;
                break;
            }
        }
        
        state.gridComplete = isComplete;
        
        if (isComplete) {
            showToast('グリッドが完成しました！保存ボタンから保存してください。', 'success');
        }
    }
    
    // 保存機能
    function saveGrid() {
        const gridData = {
            theme: state.currentTheme,
            images: state.gridImages,
            texts: state.gridTexts,
            timestamp: new Date().toISOString(),
            shareId: state.shareId
        };
        
        // 完成したグリッドを保存
        if (state.gridComplete) {
            const savedGrids = JSON.parse(localStorage.getItem('gridme-saved-grids') || '[]');
            savedGrids.push(gridData);
            localStorage.setItem('gridme-saved-grids', JSON.stringify(savedGrids));
            
            // 共有URLを生成
            const shareUrl = generateShareableUrl(gridData);
            showToast('グリッドを保存しました', 'success');
            
            // 共有ダイアログを表示
            showShareDialog(shareUrl);
        } else {
            localStorage.setItem('gridme-current', JSON.stringify(gridData));
            showToast('グリッドを保存しました', 'success');
        }
    }
    
    // 保存データの読み込み
    function loadSavedGrid() {
        // URLパラメータをチェック
        const urlParams = new URLSearchParams(window.location.search);
        const gridParam = urlParams.get('grid');
        const fullGridParam = urlParams.get('fullgrid');
        
        if (fullGridParam) {
            // 完成したグリッドの読み込み
            try {
                const decodedData = JSON.parse(decodeURIComponent(atob(fullGridParam)));
                state.currentTheme = decodedData.theme || '';
                state.gridImages = decodedData.images || new Array(81).fill(null);
                state.gridTexts = decodedData.texts || new Array(81).fill(null);
                state.shareId = decodedData.timestamp;
                state.gridComplete = true;
                
                if (state.currentTheme) {
                    elements.themeInput.value = state.currentTheme;
                    elements.currentThemeDisplay.textContent = `フォトグリッド - ${state.currentTheme}`;
                    updateThemeColors();
                }
                
                showToast('共有されたグリッドを表示しています', 'info');
                updateGridDisplay();
            } catch (err) {
                console.error('共有データの読み込みエラー:', err);
                showToast('共有データの読み込みに失敗しました', 'error');
            }
        } else if (gridParam) {
            // 共有URLからの読み込み
            try {
                const decodedData = JSON.parse(decodeURIComponent(atob(gridParam)));
                state.currentTheme = decodedData.theme || '';
                state.shareId = decodedData.timestamp;
                
                // テキストを配置
                if (decodedData.texts && Array.isArray(decodedData.texts)) {
                    let textIndex = 0;
                    for (let i = 0; i < 81 && textIndex < decodedData.texts.length; i++) {
                        if (Math.random() < 0.3) { // 元の確率と同じくらいでテキストを配置
                            state.gridTexts[i] = decodedData.texts[textIndex];
                            textIndex++;
                        }
                    }
                }
                
                if (state.currentTheme) {
                    elements.themeInput.value = state.currentTheme;
                    elements.currentThemeDisplay.textContent = `フォトグリッド - ${state.currentTheme}`;
                    updateThemeColors();
                }
                
                // 共有モードであることを表示
                showToast('共有されたグリッドを読み込みました。各セルをタップして写真を追加してください。', 'info');
                
                updateGridDisplay();
            } catch (err) {
                console.error('共有データの読み込みエラー:', err);
                showToast('共有データの読み込みに失敗しました', 'error');
            }
        } else {
            // ローカル保存データの読み込み
            const savedData = localStorage.getItem('gridme-current');
            
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    state.currentTheme = data.theme || '';
                    state.gridImages = data.images || new Array(81).fill(null);
                    state.gridTexts = data.texts || new Array(81).fill(null);
                    
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
    
    // 共有可能なURLを生成
    function generateShareableUrl(gridData) {
        const shareData = {
            theme: gridData.theme,
            images: gridData.images,
            texts: gridData.texts,
            timestamp: gridData.timestamp
        };
        
        // Base64エンコード（画像付き）
        const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
        return `${window.location.origin}${window.location.pathname}?fullgrid=${encodedData}`;
    }
    
    // 共有ダイアログを表示
    function showShareDialog(shareUrl) {
        // シンプルなモーダルを作成
        const modal = document.createElement('div');
        modal.className = 'app-modal active';
        modal.innerHTML = `
            <div class="app-modal-content card-glass">
                <div class="app-modal-header">
                    <h3>グリッドを共有</h3>
                    <button class="btn-icon app-modal-close" onclick="this.closest('.app-modal').remove()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="app-modal-body">
                    <p>完成したグリッドの共有URLです：</p>
                    <div style="margin: 15px 0;">
                        <input type="text" value="${shareUrl}" class="input" readonly style="width: 100%;">
                    </div>
                    <button class="btn-primary" onclick="navigator.clipboard.writeText('${shareUrl}').then(() => showToast('URLをコピーしました', 'success'))">
                        URLをコピー
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
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