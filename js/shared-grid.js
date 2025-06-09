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
        gridSections: []
    };
    
    // DOM要素
    const elements = {
        photoThemeGrid: document.getElementById('photo-theme-grid'),
        downloadBtn: document.getElementById('download-grid-btn')
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
        
        // 要素の組み立て
        sectionContainer.appendChild(titleDiv);
        sectionContainer.appendChild(photoArea);
        gridItem.appendChild(sectionContainer);
        
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