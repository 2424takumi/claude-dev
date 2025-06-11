/**
 * Google AdSense 統合
 */

(function() {
    'use strict';

    // AdSense設定
    const ADSENSE_CONFIG = {
        clientId: 'ca-pub-XXXXXXXXXX', // 実際のPublisher IDに置き換えてください
        adSlot: 'XXXXXXXXXX', // 実際のAd Unit IDに置き換えてください
        adFormat: 'auto',
        fullWidthResponsive: true
    };

    /**
     * AdSenseバナーを作成
     */
    function createAdBanner() {
        // 広告コンテナを作成
        const adContainer = document.createElement('div');
        adContainer.className = 'adsense-container';
        adContainer.innerHTML = `
            <div class="adsense-wrapper">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="${ADSENSE_CONFIG.clientId}"
                     data-ad-slot="${ADSENSE_CONFIG.adSlot}"
                     data-ad-format="${ADSENSE_CONFIG.adFormat}"
                     data-full-width-responsive="${ADSENSE_CONFIG.fullWidthResponsive}"></ins>
            </div>
        `;

        return adContainer;
    }

    /**
     * AdSenseスクリプトを読み込む
     */
    function loadAdSenseScript() {
        // 既にスクリプトが読み込まれている場合はスキップ
        if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CONFIG.clientId;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    }

    /**
     * 広告を初期化
     */
    function initializeAds() {
        // body要素の最後に広告を挿入（フッターの後）
        const body = document.body;
        if (!body) {
            console.warn('Body element not found');
            return;
        }

        // 広告バナーを作成して挿入
        const adBanner = createAdBanner();
        body.appendChild(adBanner);

        // AdSenseスクリプトを読み込む
        loadAdSenseScript();

        // 広告をプッシュ（AdSenseが読み込まれた後）
        window.addEventListener('load', function() {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('AdSense initialization error:', e);
            }
        });
    }

    // DOMが読み込まれたら広告を初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAds);
    } else {
        initializeAds();
    }
})();