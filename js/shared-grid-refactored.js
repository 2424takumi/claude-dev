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
        gridBgColor: '#FF8B25' // デフォルトは黒
    };
    
    // StorageManagerのインスタンスを作成
    const storage = new StorageManager();
    
    // DOM要素
    const elements = {
        photoThemeGrid: document.getElementById('photo-theme-grid'),
        downloadBtn: document.getElementById('download-grid-btn'),
        gridBgColorInput: document.getElementById('grid-bg-color'),
        themeToggle: document.querySelector('.theme-toggle'),
        shareInstagramBtn: document.getElementById('share-instagram-stories-btn')
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
    
    // グリッドレンダラーの初期化
    const gridRenderer = new GridRenderer('photo-theme-grid', {
        itemClass: 'grid-theme-item',
        renderItem: (gridItem, section, index) => {
            // セクションコンテナ
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'grid-section-container';
            
            // 既に画像がアップロードされている場合
            if (state.uploadedImages[index]) {
                // has-imageクラスを追加
                gridItem.classList.add('has-image');
                
                // 画像を表示（正方形にクロップ）
                const img = document.createElement('img');
                img.className = 'uploaded-image';
                img.src = state.uploadedImages[index];
                img.alt = `アップロードされた画像 ${index + 1}`;
                sectionContainer.appendChild(img);
                
                // メニューボタンとプラスボタンは表示しない
            } else {
                // テーマテキストを表示
                const themeText = document.createElement('div');
                themeText.className = 'grid-theme-text';
                themeText.textContent = section.title || `テーマ ${index + 1}`;
                sectionContainer.appendChild(themeText);
                
                // プラスアイコン
                const addButton = document.createElement('button');
                addButton.className = 'grid-add-button';
                addButton.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                `;
                addButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openUploadModal(index);
                });
                sectionContainer.appendChild(addButton);
            }
            
            // テーマクラスを適用（存在する場合）
            if (section.theme) {
                gridItem.classList.add(`theme-${section.theme}`);
            }
            
            gridItem.appendChild(sectionContainer);
            
            // クリックイベントの設定
            if (!state.uploadedImages[index]) {
                gridItem.addEventListener('click', () => openUploadModal(index));
            }
        }
    });
    
    // グリッドの初期化
    function initializeGrid() {
        const sharedData = getSharedData();
        if (!sharedData) return;
        
        state.gridSize = sharedData.size || 2;
        state.gridSections = sharedData.sections || [];
        state.gridBgColor = sharedData.bgColor || '#FF8B25';
        

        // ニックネームがある場合、タイトルとサブタイトルを更新
        if (sharedData.nickname) {
            updatePageTitles(sharedData.nickname);

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
    
    // 編集メニューを開く
    function openEditMenu(index, section) {
        // 編集メニューモーダルのHTMLを作成
        const menuModalHtml = `
            <div id="edit-menu-modal" class="app-modal">
                <div class="app-modal-content card-glass" style="max-width: 400px;">
                    <div class="app-modal-header">
                        <h3>メニュー</h3>
                        <button class="btn-icon app-modal-close" aria-label="閉じる">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="app-modal-body">
                        <div class="edit-menu-options">
                            <button class="edit-menu-option" data-action="change-theme">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                テーマテキストを変更
                            </button>
                            <button class="edit-menu-option" data-action="change-image">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                画像を変更
                            </button>
                            <button class="edit-menu-option edit-menu-delete" data-action="delete-image">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                                画像を削除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('edit-menu-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // モーダルをDOMに追加
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = menuModalHtml;
        const menuModal = tempDiv.firstElementChild;
        document.body.appendChild(menuModal);
        
        // モーダルを登録
        const menuModalInstance = modal.register('edit-menu-modal', {
            onClose: () => {
                menuModal.remove();
            }
        });
        
        // メニューオプションのイベントハンドラー
        setTimeout(() => {
            const options = menuModal.querySelectorAll('.edit-menu-option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const action = option.dataset.action;
                    modal.close('edit-menu-modal');
                    switch (action) {
                        case 'change-theme':
                            openThemeEditModal(index, section);
                            break;
                        case 'change-image':
                            openUploadModal(index);
                            break;
                        case 'delete-image':
                            deleteImage(index);
                            break;
                    }
                });
            });
        }, 100);
        
        // モーダルを表示
        modal.open('edit-menu-modal');
    }
    
    // テーマ編集モーダルを開く
    function openThemeEditModal(index, section) {
        // テーマ編集モーダルのHTMLを作成
        const editModalHtml = `
            <div id="theme-edit-modal" class="app-modal">
                <div class="app-modal-content card-glass" style="max-width: 400px;">
                    <div class="app-modal-header">
                        <h3>テーマテキストを編集</h3>
                        <button class="btn-icon app-modal-close" aria-label="閉じる">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="app-modal-body">
                        <div class="theme-edit-form">
                            <input type="text" id="theme-edit-input" class="input" 
                                   value="${section.title || ''}" 
                                   placeholder="新しいテーマを入力" 
                                   maxlength="30">
                        </div>
                        <div style="display: flex; gap: var(--spacing-2); margin-top: var(--spacing-4); justify-content: flex-end;">
                            <button class="btn-secondary" data-action="cancel">キャンセル</button>
                            <button class="btn-primary" data-action="save">保存</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('theme-edit-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // モーダルをDOMに追加
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editModalHtml;
        const editModal = tempDiv.firstElementChild;
        document.body.appendChild(editModal);
        
        // モーダルを登録
        modal.register('theme-edit-modal', {
            onClose: () => {
                editModal.remove();
            }
        });
        
        // ボタンイベント
        editModal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            modal.close('theme-edit-modal');
        });
        
        editModal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const input = document.getElementById('theme-edit-input');
            const newTitle = input.value.trim();
            if (newTitle) {
                state.gridSections[index].title = newTitle;
                gridRenderer.render(state.gridSections);
                saveImagesToStorage();
                toast.success('テーマを更新しました');
            }
            modal.close('theme-edit-modal');
        });
        
        // モーダルを表示
        modal.open('theme-edit-modal');
        
        // フォーカスを入力フィールドに設定
        setTimeout(() => {
            const input = document.getElementById('theme-edit-input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }
    
    // 画像を削除
    function deleteImage(index) {
        delete state.uploadedImages[index];
        saveImagesToStorage();
        gridRenderer.render(state.gridSections);
        toast.success('画像を削除しました');
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
        // グリッドを再レンダリング
        gridRenderer.render(state.gridSections);
    }
    
    // 画像とテーマデータをlocalStorageに保存
    function saveImagesToStorage() {
        const sharedData = getSharedData();
        if (sharedData && sharedData.id) {
            const storageKey = `shared_data_${sharedData.id}`;
            const dataToSave = {
                images: state.uploadedImages,
                sections: state.gridSections
            };
            storage.set(storageKey, dataToSave);
        }
    }
    
    // localStorageから画像とテーマデータを読み込み
    function loadImagesFromStorage() {
        const sharedData = getSharedData();
        if (sharedData && sharedData.id) {
            // 新しい形式のデータを確認
            const storageKey = `shared_data_${sharedData.id}`;
            const savedData = storage.get(storageKey);
            
            if (savedData && savedData.images) {
                state.uploadedImages = savedData.images;
                if (savedData.sections) {
                    state.gridSections = savedData.sections;
                }
            } else {
                // 古い形式のデータをチェック（後方互換性）
                const oldStorageKey = `shared_images_${sharedData.id}`;
                const savedImages = storage.get(oldStorageKey);
                if (savedImages) {
                    state.uploadedImages = savedImages;
                }
            }
            
            // グリッドを再レンダリング
            if (Object.keys(state.uploadedImages).length > 0) {
                gridRenderer.render(state.gridSections);
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
    
    // Instagram Storiesで共有
    async function shareInstagramStories() {
        try {
            // グリッドを画像として生成
            const filename = `gridme-stories-${new Date().getTime()}.png`;
            let dataUrl = await gridRenderer.exportAsImage(filename, false); // falseでダウンロードをスキップ
            
            if (!dataUrl && typeof html2canvas === 'undefined') {
                // html2canvasライブラリがない場合は動的に読み込む
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                
                // 再度画像生成を試行
                dataUrl = await gridRenderer.exportAsImage(filename, false);
            }
            
            if (dataUrl) {
                // ShareManagerを使用してInstagram Storiesで共有
                const result = share.shareOnInstagramStories(dataUrl);
                if (result.success) {
                    toast.success(result.message);
                }
            } else {
                toast.error('画像の生成に失敗しました');
            }
        } catch (error) {
            console.error('Instagram share error:', error);
            toast.error('Instagram共有中にエラーが発生しました');
        }
    }

    // イベントリスナーの設定
    function setupEventListeners() {
        // テーマ切り替え
        theme.setToggleButton(elements.themeToggle);
        
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', downloadGrid);
        }
        
        if (elements.shareInstagramBtn) {
            elements.shareInstagramBtn.addEventListener('click', shareInstagramStories);
        }
        
        // 背景色変更は無効化（共有データの色のみ使用）
        // if (elements.gridBgColorInput) {
        //     elements.gridBgColorInput.addEventListener('input', handleBgColorChange);
        // }
        
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