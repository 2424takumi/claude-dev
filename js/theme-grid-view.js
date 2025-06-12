/**
 * GridMe Theme Grid View
 * 
 * 共有されたグリッドを閲覧するページの機能
 */

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 3,
        gridSections: [],
        gridBgColor: '#FF8B25',
        nickname: '',
        images: {}, // 画像データを保存
        creatorNickname: '' // 画像を追加した人のニックネーム
    };
    
    // DOM要素
    const elements = {
        viewThemeGrid: document.getElementById('view-theme-grid'),
        downloadBtn: document.getElementById('download-grid-btn'),
        createNewBtn: document.getElementById('create-new-btn')
    };
    
    // URLパラメータからデータを取得
    async function getSharedData() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 新しい短縮URLの場合
        const shareId = urlParams.get('id');
        if (shareId) {
            try {
                // shareモジュールを使用してデータを取得
                const { share } = await import('./utils/share.js');
                const data = await share.getShareData(urlParams);
                
                if (!data) {
                    showToast('共有データが見つかりません', 'error');
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 2000);
                    return null;
                }
                
                return data;
            } catch (err) {
                console.error('データの取得エラー:', err);
                showToast('共有データの読み込みに失敗しました', 'error');
                return null;
            }
        }
        
        // 従来のエンコードされたデータの場合
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
    async function initializeGrid() {
        const sharedData = await getSharedData();
        if (!sharedData) return;
        
        state.gridSize = sharedData.size || 3;
        state.gridSections = sharedData.sections || [];
        state.gridBgColor = sharedData.bgColor || '#FF8B25';
        state.nickname = sharedData.nickname || '';
        state.images = sharedData.images || {};
        state.creatorNickname = sharedData.creatorNickname || '';
        
        // タイトルを更新
        const titleElement = document.querySelector('.theme-grid-title');
        if (titleElement) {
            if (state.creatorNickname && state.nickname) {
                // 画像を追加した人と元の作成者の両方がいる場合
                titleElement.textContent = `${state.creatorNickname}が${state.nickname}をGridしました！`;
            } else if (state.nickname) {
                // 元の作成者のみの場合（従来の形式）
                titleElement.textContent = `${state.nickname} のGrid`;
            }
        }
        
        // グリッドHTMLの生成
        elements.viewThemeGrid.innerHTML = '';
        elements.viewThemeGrid.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
        elements.viewThemeGrid.style.gridTemplateRows = `repeat(${state.gridSize}, 1fr)`;
        
        // 背景色を設定
        elements.viewThemeGrid.style.backgroundColor = state.gridBgColor;
        
        state.gridSections.forEach((section, index) => {
            const gridItem = createFlipCard(section, index);
            elements.viewThemeGrid.appendChild(gridItem);
        });
    }
    
    // フリップカードの作成
    function createFlipCard(section, index) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-theme-item';
        
        const flipCard = document.createElement('div');
        flipCard.className = 'flip-card';
        flipCard.dataset.index = index;
        
        // カードの表面（画像）
        const cardFront = document.createElement('div');
        cardFront.className = 'flip-card-front';
        
        if (state.images[index]) {
            const img = document.createElement('img');
            img.src = state.images[index];
            img.alt = section.title || `画像 ${index + 1}`;
            img.onerror = function() {
                flipCard.classList.add('error');
            };
            cardFront.appendChild(img);
        } else {
            // 画像がない場合のプレースホルダー
            cardFront.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
            `;
        }
        
        // カードの裏面（テーマテキスト）
        const cardBack = document.createElement('div');
        cardBack.className = 'flip-card-back';
        
        const themeText = document.createElement('div');
        themeText.className = 'theme-display-text';
        themeText.textContent = section.title || `テーマ ${index + 1}`;
        cardBack.appendChild(themeText);
        
        flipCard.appendChild(cardFront);
        flipCard.appendChild(cardBack);
        gridItem.appendChild(flipCard);
        
        // クリックイベントの設定
        flipCard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        
        return gridItem;
    }
    
    // グリッドをキャンバスに描画
    function drawGridToCanvas() {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const gridElement = elements.viewThemeGrid;
            
            // グリッドのサイズを取得
            const gridRect = gridElement.getBoundingClientRect();
            const scale = 2; // 高解像度のためのスケール
            
            canvas.width = gridRect.width * scale;
            canvas.height = gridRect.height * scale;
            ctx.scale(scale, scale);
            
            // 背景色を描画
            ctx.fillStyle = state.gridBgColor;
            ctx.fillRect(0, 0, gridRect.width, gridRect.height);
            
            // 各グリッドアイテムを描画
            const gridItems = gridElement.querySelectorAll('.grid-theme-item');
            const itemSize = gridRect.width / state.gridSize;
            let loadedImages = 0;
            const totalImages = gridItems.length;
            
            gridItems.forEach((item, index) => {
                const row = Math.floor(index / state.gridSize);
                const col = index % state.gridSize;
                const x = col * itemSize;
                const y = row * itemSize;
                
                // 画像がある場合は描画
                const img = item.querySelector('img');
                if (img && img.complete && img.naturalHeight !== 0) {
                    ctx.drawImage(img, x, y, itemSize, itemSize);
                } else {
                    // 画像がない場合はテーマテキストを描画
                    const theme = state.gridSections[index];
                    if (theme && theme.title) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(x, y, itemSize, itemSize);
                        
                        ctx.fillStyle = '#333';
                        ctx.font = 'bold 16px "Noto Sans JP", sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        // テキストを折り返して描画
                        const maxWidth = itemSize * 0.8;
                        const lineHeight = 24;
                        const words = theme.title.split('');
                        let line = '';
                        let lines = [];
                        
                        for (let n = 0; n < words.length; n++) {
                            const testLine = line + words[n];
                            const metrics = ctx.measureText(testLine);
                            if (metrics.width > maxWidth && n > 0) {
                                lines.push(line);
                                line = words[n];
                            } else {
                                line = testLine;
                            }
                        }
                        lines.push(line);
                        
                        const startY = y + itemSize / 2 - (lines.length - 1) * lineHeight / 2;
                        lines.forEach((line, i) => {
                            ctx.fillText(line, x + itemSize / 2, startY + i * lineHeight);
                        });
                    }
                }
                
                // 枠線を描画
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, itemSize, itemSize);
                
                loadedImages++;
                if (loadedImages === totalImages) {
                    resolve(canvas);
                }
            });
            
            // 画像がない場合もresolve
            if (totalImages === 0) {
                resolve(canvas);
            }
        });
    }
    
    // 画像をダウンロード
    async function downloadGrid() {
        try {
            showToast('画像を生成中...', 'info');
            
            const canvas = await drawGridToCanvas();
            
            // ダウンロード
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            link.download = `gridme_${state.nickname || 'grid'}_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            showToast('画像をダウンロードしました', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast('ダウンロードに失敗しました', 'error');
        }
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        // ダウンロードボタン
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', downloadGrid);
        }
        
        // 新規作成ボタン
        if (elements.createNewBtn) {
            elements.createNewBtn.addEventListener('click', () => {
                window.location.href = './index.html';
            });
        }
    }
    
    // 初期化
    async function init() {
        await initializeGrid();
        setupEventListeners();
    }
    
    // DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();