/**
 * ソーシャル共有モジュール
 * 
 * 統一されたソーシャルメディア共有機能を提供
 */

export class ShareManager {
    constructor() {
        this.defaultOptions = {
            windowWidth: 600,
            windowHeight: 400
        };
    }

    // URLをクリップボードにコピー
    async copyToClipboard(url, onSuccess, onError) {
        try {
            await navigator.clipboard.writeText(url);
            if (onSuccess) onSuccess();
            return true;
        } catch (error) {
            console.error('Clipboard copy error:', error);
            if (onError) onError(error);
            return false;
        }
    }

    // 共有ウィンドウを開く
    openShareWindow(url, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const left = (window.screen.width - config.windowWidth) / 2;
        const top = (window.screen.height - config.windowHeight) / 2;
        
        window.open(
            url,
            '_blank',
            `width=${config.windowWidth},height=${config.windowHeight},left=${left},top=${top}`
        );
    }

    // Twitter/X で共有
    shareOnTwitter(shareUrl, text = '', hashtags = []) {
        const params = new URLSearchParams({
            url: shareUrl,
            text: text
        });

        if (hashtags.length > 0) {
            params.append('hashtags', hashtags.join(','));
        }

        const twitterUrl = `https://twitter.com/intent/tweet?${params}`;
        this.openShareWindow(twitterUrl);
    }

    // Facebook で共有
    shareOnFacebook(shareUrl) {
        const params = new URLSearchParams({
            u: shareUrl
        });

        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?${params}`;
        this.openShareWindow(facebookUrl);
    }

    // LINE で共有
    shareOnLine(shareUrl, text = '') {
        const params = new URLSearchParams({
            url: shareUrl
        });

        if (text) {
            params.append('text', text);
        }

        const lineUrl = `https://social-plugins.line.me/lineit/share?${params}`;
        this.openShareWindow(lineUrl);
    }

    // LinkedIn で共有
    shareOnLinkedIn(shareUrl, title = '', summary = '') {
        const params = new URLSearchParams({
            url: shareUrl
        });

        if (title) params.append('title', title);
        if (summary) params.append('summary', summary);

        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?${params}`;
        this.openShareWindow(linkedInUrl);
    }

    // メールで共有
    shareByEmail(shareUrl, subject = '', body = '') {
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n' + shareUrl)}`;
        window.location.href = mailtoUrl;
    }

    // WhatsApp で共有
    shareOnWhatsApp(shareUrl, text = '') {
        const message = text ? `${text} ${shareUrl}` : shareUrl;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // 共有データのエンコード
    encodeShareData(data) {
        try {
            const jsonString = JSON.stringify(data);
            return btoa(unescape(encodeURIComponent(jsonString)));
        } catch (error) {
            console.error('Share data encode error:', error);
            return null;
        }
    }

    // 共有データのデコード
    decodeShareData(encodedData) {
        try {
            const jsonString = decodeURIComponent(escape(atob(encodedData)));
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Share data decode error:', error);
            return null;
        }
    }

    // 共有URLの生成
    generateShareUrl(baseUrl, data) {
        const encodedData = this.encodeShareData(data);
        if (!encodedData) return null;

        const url = new URL(baseUrl);
        url.searchParams.set('data', encodedData);
        return url.toString();
    }

    // Web Share API を使用した共有（モバイル対応）
    async nativeShare(shareData) {
        if (!navigator.share) {
            console.warn('Web Share API is not supported');
            return false;
        }

        try {
            await navigator.share(shareData);
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Native share error:', error);
            }
            return false;
        }
    }

    // 共有ボタンの自動設定
    setupShareButtons(config) {
        const {
            url,
            title = '',
            text = '',
            containerSelector = '.share-buttons'
        } = config;

        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Twitter ボタン
        const twitterBtn = container.querySelector('[data-share="twitter"]');
        if (twitterBtn) {
            twitterBtn.addEventListener('click', () => {
                this.shareOnTwitter(url, text);
            });
        }

        // Facebook ボタン
        const facebookBtn = container.querySelector('[data-share="facebook"]');
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => {
                this.shareOnFacebook(url);
            });
        }

        // LINE ボタン
        const lineBtn = container.querySelector('[data-share="line"]');
        if (lineBtn) {
            lineBtn.addEventListener('click', () => {
                this.shareOnLine(url, text);
            });
        }

        // コピーボタン
        const copyBtn = container.querySelector('[data-share="copy"]');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const success = await this.copyToClipboard(url);
                if (success && config.onCopySuccess) {
                    config.onCopySuccess();
                }
            });
        }

        // ネイティブ共有ボタン
        const nativeBtn = container.querySelector('[data-share="native"]');
        if (nativeBtn && navigator.share) {
            nativeBtn.style.display = 'inline-block';
            nativeBtn.addEventListener('click', () => {
                this.nativeShare({ url, title, text });
            });
        }
    }
}

// デフォルトインスタンスをエクスポート
export const share = new ShareManager();