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
        gridThemes: [],

        saveTimeout: null
        currentTheme: '',
        gridImages: new Array(9).fill(null),
        selectedCell: null,
        gridTexts: new Array(9).fill(null),
        gridComplete: false,
        shareId: null
    };
    
    // DOM要素
    const elements = {
        themeGrid: document.getElementById('theme-grid'),
        mainShareBtn: document.getElementById('main-share-btn'),
        shareBtn: document.getElementById('share-btn'),

        gridSizeSelect: document.getElementById('grid-size'),
        downloadBtn: document.getElementById('download-btn'),
        saveBtn: document.getElementById('save-btn'),
        uploadModal: document.getElementById('upload-modal'),
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input'),
        modalClose: document.querySelector('.app-modal-close')
    };
    
    // グリッドの初期化
    function initializeGrid() {
        const size = state.gridSize;
        const totalCells = size * size;
        
        // グリッドテーマ配列の初期化
        state.gridThemes = new Array(totalCells).fill('');
        
        // グリッドHTMLの生成
        elements.themeGrid.innerHTML = '';
        elements.themeGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        elements.themeGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        for (let i = 0; i < totalCells; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-theme-item';
            gridItem.dataset.index = i;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'theme-input';
            input.placeholder = 'テーマを入力';
            input.maxLength = 50;
            input.dataset.index = i;
            
            input.addEventListener('input', (e) => handleThemeInput(e));
            
            gridItem.appendChild(input);
            elements.themeGrid.appendChild(gridItem);
        }
        
        // 初期状態でボタンを無効化
        checkAllThemesCompleted();
    }
    
    // テーマ入力ハンドラー
    function handleThemeInput(e) {
        const index = parseInt(e.target.dataset.index);
        state.gridThemes[index] = e.target.value;
        
        // 全てのテーマが入力されているかチェック
        checkAllThemesCompleted();
    }
    
    // 全てのテーマが入力されているかチェック
    function checkAllThemesCompleted() {
        const totalCells = state.gridSize * state.gridSize;
        const filledThemes = state.gridThemes.filter(theme => theme && theme.trim() !== '');
        

        // 全てのセルにテーマが入力されているか
        const allThemesFilled = filledThemes.length === totalCells;
        
        // 共有ボタンの有効/無効を制御
        if (elements.mainShareBtn) {
            elements.mainShareBtn.disabled = !allThemesFilled;
            if (allThemesFilled) {
                elements.mainShareBtn.classList.remove('btn-disabled');
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
        const totalCells = state.gridSize * state.gridSize;
        
        // テーマの単語とベース単語を組み合わせてラベルを生成
        for (let i = 0; i < totalCells; i++) {
            if (Math.random() < 0.3) { // 30%の確率でテキストを配置
                const wordIndex = Math.floor(Math.random() * words.length);
                const baseIndex = Math.floor(Math.random() * baseWords.length);
                labels.push(`${words[wordIndex] || theme}の${baseWords[baseIndex]}`);
            } else {
                elements.mainShareBtn.classList.add('btn-disabled');
            }
        }
        

        if (elements.shareBtn) {
            elements.shareBtn.disabled = !allThemesFilled;
            if (allThemesFilled) {
                elements.shareBtn.classList.remove('btn-disabled');

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
        
        state.gridImages = new Array(state.gridSize * state.gridSize).fill(null);
        state.gridTexts = new Array(state.gridSize * state.gridSize).fill(null);
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
        const newImages = new Array(state.gridSize * state.gridSize).fill(null);
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
                elements.shareBtn.classList.add('btn-disabled');
            }
        }
        
        return allThemesFilled;
    }
    
    // グリッドサイズ変更
    function handleGridSizeChange(e) {
        const newSize = parseInt(e.target.value);
        state.gridSize = newSize;
        // 画像とテキスト配列をリサイズ
        state.gridImages = new Array(newSize * newSize).fill(null);
        state.gridTexts = new Array(newSize * newSize).fill(null);
        initializeGrid();
        showToast(`グリッドサイズを${newSize}x${newSize}に変更しました`, 'success');
    }
    
    // 共有機能
    async function shareGrid() {
        const totalCells = state.gridSize * state.gridSize;
        const filledThemes = state.gridThemes.filter(theme => theme && theme.trim() !== '');
        
        if (filledThemes.length !== totalCells) {
            showToast(`全ての${totalCells}個のテーマを入力してください`, 'warning');
            return;
        }
        
        // 共有用のURLパラメータを生成
        const shareData = {
            size: state.gridSize,
            themes: state.gridThemes
        };
        
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
    
    // 保存データの読み込み
    function loadSavedGrid() {
        const savedData = localStorage.getItem('gridme-themes');

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
        const totalCells = state.gridSize * state.gridSize;
        for (let i = 0; i < totalCells; i++) {
            if (state.gridTexts[i] && !state.gridImages[i]) {
                isComplete = false;
                break;
            }
        }
        
        state.gridComplete = isComplete;
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                state.gridSize = data.size || 3;
                state.gridThemes = data.themes || [];
                
                // グリッドサイズセレクトを更新

                if (elements.gridSizeSelect) {
                    elements.gridSizeSelect.value = state.gridSize;
                }

                elements.gridSizeSelect.value = state.gridSize;
                const decodedData = JSON.parse(decodeURIComponent(atob(fullGridParam)));
                state.currentTheme = decodedData.theme || '';
                state.gridImages = decodedData.images || new Array(state.gridSize * state.gridSize).fill(null);
                state.gridTexts = decodedData.texts || new Array(state.gridSize * state.gridSize).fill(null);
                state.shareId = decodedData.timestamp;
                state.gridComplete = true;
                
                // グリッドを再初期化
                initializeGrid();
                
                // 保存されたテーマを入力
                state.gridThemes.forEach((theme, index) => {
                    const input = elements.themeGrid.querySelector(`input[data-index="${index}"]`);
                    if (input) {
                        input.value = theme;
                    }
                });

            } catch (err) {
                console.error('保存データの読み込みエラー:', err);
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
                    const totalCells = state.gridSize * state.gridSize;
                    for (let i = 0; i < totalCells && textIndex < decodedData.texts.length; i++) {
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
                    state.gridImages = data.images || new Array(state.gridSize * state.gridSize).fill(null);
                    state.gridTexts = data.texts || new Array(state.gridSize * state.gridSize).fill(null);
                    
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
    
    // データの保存
    function saveGrid() {
        const gridData = {
            size: state.gridSize,
            themes: state.gridThemes,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('gridme-themes', JSON.stringify(gridData));
        showToast('グリッドを保存しました', 'success');
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
        
        // 自動保存（入力時）
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('theme-input')) {
                // デバウンス処理
                clearTimeout(state.saveTimeout);
                state.saveTimeout = setTimeout(() => {
                    saveGrid();
                }, 1000);
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
        loadSavedGrid();
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();