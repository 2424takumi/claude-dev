/**
 * GridMe 共有グリッドページ (リファクタリング版)
 * 
 * モジュール化されたユーティリティを使用
 */

import { toast, modal, share, GridRenderer, StorageManager, theme } from './utils/index.js';

(function() {
    'use strict';
    
    // 状態管理
    const state = {
        gridSize: 2,
        gridSections: [],
        uploadedImages: {},
        gridBgColor: '#000000' // デフォルトは黒
    };
    
    // StorageManagerのインスタンスを作成
    const storage = new StorageManager();
    
    // DOM要素
    const elements = {
        photoThemeGrid: document.getElementById('photo-theme-grid'),
        downloadBtn: document.getElementById('download-grid-btn'),
        gridBgColorInput: document.getElementById('grid-bg-color')
    };
    
    // 共有データを保存する変数
    let sharedDataCache = null;
    
    // URLパラメータからデータを取得
    function getSharedData() {
        // キャッシュがあればそれを返す
        if (sharedDataCache) {
            return sharedDataCache;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        
        if (!encodedData) {
            toast.error('共有データが見つかりません');
            setTimeout(() => {
                window.location.href = './index.html';
            }, 2000);
            return null;
        }
        
        const decodedData = share.decodeShareData(encodedData);
        if (!decodedData) {
            toast.error('共有データの読み込みに失敗しました');
            return null;
        }
        
        // IDがない場合は生成
        if (!decodedData.id) {
            decodedData.id = `grid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // キャッシュに保存
        sharedDataCache = decodedData;
        
        return decodedData;
    }
    
    // グリッドレンダラーの初期化
    const gridRenderer = new GridRenderer('photo-theme-grid', {
        itemClass: 'photo-theme-item',
        renderItem: (gridItem, section, index) => {
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
            
            // カードの表面
            const flipCardFront = document.createElement('div');
            flipCardFront.className = 'flip-card-front';
            
            // 既に画像がアップロードされている場合
            if (state.uploadedImages[index]) {
                const img = document.createElement('img');
                img.className = 'uploaded-image';
                img.src = state.uploadedImages[index];
                img.alt = `アップロードされた画像 ${index + 1}`;
                flipCardFront.appendChild(img);
            } else {
                // プラスアイコン
                const addPhotoIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                addPhotoIcon.className = 'add-photo-icon';
                addPhotoIcon.setAttribute('viewBox', '0 0 24 24');
                addPhotoIcon.setAttribute('fill', 'none');
                addPhotoIcon.setAttribute('stroke', 'currentColor');
                addPhotoIcon.setAttribute('stroke-width', '2');
                addPhotoIcon.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
                flipCardFront.appendChild(addPhotoIcon);
            }
            
            // カードの裏面
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
        }
    });
    
    // グリッドの初期化
    function initializeGrid() {
        const sharedData = getSharedData();
        if (!sharedData) return;
        
        state.gridSize = sharedData.size || 2;
        state.gridSections = sharedData.sections || [];
        state.gridBgColor = sharedData.bgColor || '#000000';
        
        // 背景色入力を更新
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.value = state.gridBgColor;
        }
        
        // グリッドをレンダリング
        gridRenderer.setSize(state.gridSize);
        gridRenderer.render(state.gridSections);
        

        // 背景色を適用
        applyGridBackgroundColor();
        // 保存された画像を読み込み
        loadImagesFromStorage();
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
    
    // アップロードモーダルの設定
    const uploadModal = modal.register('upload-modal', {
        onOpen: (modalElement) => {
            const uploadArea = modalElement.querySelector('#upload-area');
            const fileInput = modalElement.querySelector('#file-input');
            const targetIndex = uploadArea.dataset.targetIndex;
            
            // ファイル選択イベント
            fileInput.onchange = (e) => handleFileSelect(e, parseInt(targetIndex));
        }
    });
    
    // アップロードモーダルを開く
    function openUploadModal(index) {
        const uploadArea = document.getElementById('upload-area');
        
        // 現在のインデックスを保存
        uploadArea.dataset.targetIndex = index;
        
        // モーダルを表示
        uploadModal.open();
    }
    
    // ファイル選択処理
    function handleFileSelect(e, index) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // 画像を保存
                state.uploadedImages[index] = e.target.result;
                
                // localStorageに保存
                saveImagesToStorage();
                
                // 画像を表示
                updatePhotoDisplay(index);
                
                // モーダルを閉じる
                uploadModal.close();
                
                toast.success('画像をアップロードしました');
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
    
    // 画像をlocalStorageに保存
    function saveImagesToStorage() {
        const sharedData = getSharedData();
        if (sharedData && sharedData.id) {
            const storageKey = `shared_images_${sharedData.id}`;
            storage.set(storageKey, state.uploadedImages);
        }
    }
    
    // localStorageから画像を読み込み
    function loadImagesFromStorage() {
        const sharedData = getSharedData();
        if (sharedData && sharedData.id) {
            const storageKey = `shared_images_${sharedData.id}`;
            const savedImages = storage.get(storageKey);
            if (savedImages) {
                state.uploadedImages = savedImages;
                // 保存された画像を表示
                Object.keys(savedImages).forEach(index => {
                    updatePhotoDisplay(parseInt(index));
                });
            }
        }
    }
    
    // ダウンロード機能
    async function downloadGrid() {
        const filename = `gridme-${new Date().getTime()}.png`;
        const dataUrl = await gridRenderer.exportAsImage(filename);
        
        if (dataUrl) {
            toast.success('ダウンロードを開始しました');
        } else {
            // html2canvasライブラリがない場合は動的に読み込む
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = async () => {
                const dataUrl = await gridRenderer.exportAsImage(filename);
                if (dataUrl) {
                    toast.success('ダウンロードを開始しました');
                } else {
                    toast.error('ダウンロードに失敗しました');
                }
            };
            document.head.appendChild(script);
        }
    }
    
    // ドラッグ＆ドロップの設定
    function setupDragAndDrop() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        if (!uploadArea) return;
        
        // アップロードエリアのクリック
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // ドラッグオーバー
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        // ドラッグリーブ
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        // ドロップ
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const index = parseInt(uploadArea.dataset.targetIndex);
            const file = e.dataTransfer.files[0];
            
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    state.uploadedImages[index] = e.target.result;
                    saveImagesToStorage();
                    updatePhotoDisplay(index);
                    uploadModal.close();
                    toast.success('画像をアップロードしました');
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', downloadGrid);
        }
        
        // 背景色変更
        if (elements.gridBgColorInput) {
            elements.gridBgColorInput.addEventListener('input', handleBgColorChange);
        }
        
        setupDragAndDrop();
    }
    
    // 背景色を適用
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
        
        // テーマ切り替えボタンの設定
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            theme.setToggleButton(themeToggle);
        }
    }
    
    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();