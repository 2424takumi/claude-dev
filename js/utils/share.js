/**
 * ソーシャル共有モジュール
 * 
 * 統一されたソーシャルメディア共有機能を提供
 */

import { shareStorage } from './share-storage.js';

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
            // UTF-8文字列をBase64エンコード
            const jsonString = JSON.stringify(data);
            const utf8Bytes = encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g,
                function(match, p1) {
                    return String.fromCharCode('0x' + p1);
                });
            return btoa(utf8Bytes);
        } catch (error) {
            console.error('Share data encode error:', error);
            return null;
        }
    }

    // 共有データのデコード
    decodeShareData(encodedData) {
        try {
            // Base64デコード後、UTF-8として解釈
            const decodedBase64 = atob(encodedData);
            // UTF-8バイト列を文字列に変換
            const decodedString = decodeURIComponent(decodedBase64.split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(decodedString);
        } catch (error) {
            console.error('Share data decode error:', error);
            return null;
        }
    }

    // 共有URLの生成（従来の方法）
    generateShareUrl(baseUrl, data) {
        const encodedData = this.encodeShareData(data);
        if (!encodedData) return null;

        const url = new URL(baseUrl);
        url.searchParams.set('data', encodedData);
        return url.toString();
    }

    // 短縮共有URLの生成（新しい方法）
    async generateShortShareUrl(baseUrl, data) {
        try {
            // データサイズをチェック
            const jsonString = JSON.stringify(data);
            const dataSize = new Blob([jsonString]).size;
            
            // 画像データが含まれているか、データサイズが大きい場合は短縮URLを使用
            const hasImages = data.images && Object.keys(data.images).length > 0;
            const isLargeData = dataSize > 1000; // 1KB以上
            
            if (hasImages || isLargeData) {
                // IndexedDBまたはlocalStorageに保存
                let shareId;
                try {
                    shareId = await shareStorage.save(data);
                } catch (error) {
                    // IndexedDBが使えない場合はlocalStorageを試す
                    console.warn('IndexedDB save failed, trying localStorage:', error);
                    shareId = await shareStorage.saveToLocalStorage(data);
                }
                
                const url = new URL(baseUrl);
                url.searchParams.set('id', shareId);
                return url.toString();
            } else {
                // データが小さい場合は従来の方法を使用
                return this.generateShareUrl(baseUrl, data);
            }
        } catch (error) {
            console.error('Short URL generation error:', error);
            // エラーの場合は従来の方法にフォールバック
            return this.generateShareUrl(baseUrl, data);
        }
    }

    // 共有データの取得（IDまたはエンコードされたデータから）
    async getShareData(urlParams) {
        // 短縮URLの場合
        const shareId = urlParams.get('id');
        if (shareId) {
            try {
                // IndexedDBから取得を試みる
                let data = await shareStorage.get(shareId);
                
                // IndexedDBで見つからない場合はlocalStorageを試す
                if (!data) {
                    data = shareStorage.getFromLocalStorage(shareId);
                }
                
                return data;
            } catch (error) {
                console.error('Failed to get share data:', error);
                return null;
            }
        }
        
        // 従来のエンコードされたデータの場合
        const encodedData = urlParams.get('data');
        if (encodedData) {
            return this.decodeShareData(encodedData);
        }
        
        return null;
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