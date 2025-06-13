/**
 * GridMe Theme Grid View
 * 
 * 共有されたグリッドを閲覧するページの機能
 */

import { GridRenderer, toast } from './utils/index.js';

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
        createNewBtn: document.getElementById('create-new-btn'),
        shareModal: document.getElementById('share-modal'),
        shareModalClose: null,
        copyUrlBtn: document.getElementById('copy-url-btn'),
        shareTwitterBtn: document.getElementById('share-twitter-btn'),
        shareLineBtn: document.getElementById('share-line-btn'),
        shareUrlInput: document.getElementById('share-url-input'),
        downloadImageBtn: document.getElementById('download-image-btn')
    };
    
    // グリッドレンダラーの初期化
    const gridRenderer = new GridRenderer('view-theme-grid', {
        itemClass: 'grid-theme-item',
        renderItem: (gridItem, section, index) => {
            const flipCard = createFlipCard(section, index);
            gridItem.appendChild(flipCard);
        }
    });
    
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
                    toast.error('共有データが見つかりません');
                    setTimeout(() => {
                        window.location.href = './index.html';
                    }, 2000);
                    return null;
                }
                
                return data;
            } catch (err) {
                console.error('データの取得エラー:', err);
                toast.error('共有データの読み込みに失敗しました');
                return null;
            }
        }
        
        // 従来のエンコードされたデータの場合
        const encodedData = urlParams.get('data');
        if (!encodedData) {
            toast.error('共有データが見つかりません');
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
            toast.error('共有データの読み込みに失敗しました');
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
        
        // 背景色を設定
        elements.viewThemeGrid.style.backgroundColor = state.gridBgColor;
        
        // グリッドをレンダリング
        gridRenderer.setSize(state.gridSize);
        gridRenderer.render(state.gridSections);
    }
    
    // フリップカードの作成
    function createFlipCard(section, index) {
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
        
        // クリックイベントの設定
        flipCard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        
        return flipCard;
    }
    
    // 画像をダウンロード（写真アルバムへの保存）
    async function downloadGrid() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `gridme_${state.nickname || 'grid'}_${timestamp}.png`;
        
        // html2canvasが読み込まれているか確認
        if (typeof html2canvas === 'undefined') {
            // html2canvasライブラリを動的に読み込む
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = async () => {
                await performSaveToAlbum(filename);
            };
            document.head.appendChild(script);
        } else {
            await performSaveToAlbum(filename);
        }
    }
    
    // 実際の保存処理
    async function performSaveToAlbum(filename) {
        const result = await gridRenderer.saveAsPhoto(filename);
        
        if (result === true) {
            toast.success('画像を保存しました');
        } else if (result === false) {
            // ユーザーがキャンセルした場合
            toast.info('保存をキャンセルしました');
        } else {
            toast.error('保存に失敗しました');
        }
    }
    
    // 共有モーダルを表示
    function showShareModal() {
        if (!elements.shareModal) return;
        
        // 現在のURLを設定
        const currentUrl = window.location.href;
        if (elements.shareUrlInput) {
            elements.shareUrlInput.value = currentUrl;
        }
        
        elements.shareModal.classList.add('active');
    }
    
    // 共有モーダルを閉じる
    function closeShareModal() {
        if (elements.shareModal) {
            elements.shareModal.classList.remove('active');
        }
    }
    
    // URLをコピー
    async function copyShareUrl() {
        const shareUrl = elements.shareUrlInput?.value || window.location.href;
        
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('URLをコピーしました');
        } catch (err) {
            console.error('コピーエラー:', err);
            toast.error('URLのコピーに失敗しました');
        }
    }
    
    // Twitterで共有
    function shareOnTwitter() {
        const shareUrl = elements.shareUrlInput?.value || window.location.href;
        const nickname = state.nickname ? `${state.nickname}の` : '';
        const text = encodeURIComponent(`${nickname}GridMe!!どんな感じ？`);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
    
    // LINEで共有
    function shareOnLine() {
        const shareUrl = elements.shareUrlInput?.value || window.location.href;
        const nickname = state.nickname ? `${state.nickname}の` : '';
        const text = encodeURIComponent(`${nickname}GridMe!!どんな感じ？`);
        const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${text}`;
        window.open(lineUrl, '_blank', 'width=600,height=400');
    }
    
    // イベントリスナーの設定
    function setupEventListeners() {
        // ダウンロードボタン（共有モーダルを表示）
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', showShareModal);
        }
        
        // 新規作成ボタン
        if (elements.createNewBtn) {
            elements.createNewBtn.addEventListener('click', () => {
                window.location.href = './index.html';
            });
        }
        
        // モーダル関連
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
        
        // 共有オプションボタン
        if (elements.downloadImageBtn) {
            elements.downloadImageBtn.addEventListener('click', () => {
                closeShareModal();
                downloadGrid();
            });
        }
        if (elements.copyUrlBtn) {
            elements.copyUrlBtn.addEventListener('click', copyShareUrl);
        }
        if (elements.shareTwitterBtn) {
            elements.shareTwitterBtn.addEventListener('click', shareOnTwitter);
        }
        if (elements.shareLineBtn) {
            elements.shareLineBtn.addEventListener('click', shareOnLine);
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