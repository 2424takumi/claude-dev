/**
 * 画像エクスポート高画質化モジュール
 * 
 * 高品質な画像エクスポート機能を提供
 */

// エクスポート品質設定
export const EXPORT_QUALITY = {
    LOW: {
        name: '標準画質',
        scale: 1,
        format: 'image/jpeg',
        quality: 0.8
    },
    MEDIUM: {
        name: '高画質',
        scale: 2,
        format: 'image/jpeg',
        quality: 0.9
    },
    HIGH: {
        name: '最高画質',
        scale: 3,
        format: 'image/jpeg',
        quality: 0.95
    },
    LOSSLESS: {
        name: 'ロスレス (PNG)',
        scale: 2,
        format: 'image/png',
        quality: 1
    }
};

// デバイスピクセル比を考慮したスケール計算
export function getOptimalScale(baseScale = 2) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    // 高解像度ディスプレイでは自動的にスケールアップ
    return Math.max(baseScale, Math.min(devicePixelRatio * 1.5, 4));
}

// WebPサポートのチェック
export function supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
}

// 高品質画像エクスポート関数
export async function exportHighQualityImage(element, options = {}) {
    const {
        quality = EXPORT_QUALITY.HIGH,
        filename = `gridme-${new Date().getTime()}`,
        backgroundColor = null,
        autoDownload = true
    } = options;

    if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas library is required for export');
    }

    try {
        // デバイスに最適なスケールを計算
        const optimalScale = getOptimalScale(quality.scale);
        
        // html2canvasオプション
        const canvasOptions = {
            backgroundColor,
            scale: optimalScale,
            useCORS: true,
            allowTaint: true,
            logging: false,
            imageTimeout: 0,
            // より高品質なレンダリング設定
            letterRendering: true,
            foreignObjectRendering: true,
            onclone: (clonedDoc) => {
                // クローンされたドキュメントで画像のスタイルを確実に適用
                const clonedImages = clonedDoc.querySelectorAll('.uploaded-image');
                clonedImages.forEach(img => {
                    img.style.objectFit = 'cover';
                    img.style.objectPosition = 'center';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.position = 'absolute';
                    img.style.top = '0';
                    img.style.left = '0';
                    // 画像の読み込みを確実にする
                    img.style.imageRendering = 'high-quality';
                });
                
                // フォントのアンチエイリアシングを改善
                const clonedTexts = clonedDoc.querySelectorAll('*');
                clonedTexts.forEach(el => {
                    el.style.textRendering = 'optimizeLegibility';
                    el.style.webkitFontSmoothing = 'antialiased';
                    el.style.mozOsxFontSmoothing = 'grayscale';
                });
            }
        };

        const canvas = await html2canvas(element, canvasOptions);
        
        // WebP対応の場合はWebPを優先
        let format = quality.format;
        let extension = format.split('/')[1];
        
        if (supportsWebP() && format !== 'image/png') {
            format = 'image/webp';
            extension = 'webp';
        }

        return new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob'));
                    return;
                }

                const url = URL.createObjectURL(blob);
                
                if (autoDownload) {
                    // Web Share APIをサポートしているかチェック（モバイルでの写真アルバム保存）
                    const fullFilename = `${filename}.${extension}`;
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fullFilename, { type: format })] })) {
                        // Web Share APIを使用して写真を共有（モバイルでは写真アルバムに保存可能）
                        const file = new File([blob], fullFilename, { type: format });
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'GridMe',
                                text: 'GridMeで作成した画像'
                            });
                        } catch (err) {
                            // ユーザーがキャンセルした場合は何もしない
                            if (err.name !== 'AbortError') {
                                throw err;
                            }
                        }
                    } else {
                        // Web Share APIがサポートされていない場合は従来のダウンロード
                        const link = document.createElement('a');
                        link.download = fullFilename;
                        link.href = url;
                        link.click();
                    }
                    
                    // リソースをクリーンアップ
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                }
                
                resolve({
                    blob,
                    url,
                    format,
                    size: blob.size,
                    width: canvas.width,
                    height: canvas.height
                });
            }, format, quality.quality);
        });
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
}

// 複数フォーマットでのエクスポート
export async function exportMultipleFormats(element, options = {}) {
    const formats = [
        { format: 'image/jpeg', quality: 0.95, extension: 'jpg' },
        { format: 'image/png', quality: 1, extension: 'png' },
        { format: 'image/webp', quality: 0.95, extension: 'webp' }
    ];
    
    const results = [];
    
    for (const formatConfig of formats) {
        // WebPサポートチェック
        if (formatConfig.format === 'image/webp' && !supportsWebP()) {
            continue;
        }
        
        try {
            const result = await exportHighQualityImage(element, {
                ...options,
                quality: {
                    ...EXPORT_QUALITY.HIGH,
                    format: formatConfig.format,
                    quality: formatConfig.quality
                },
                autoDownload: false
            });
            
            results.push({
                ...result,
                extension: formatConfig.extension
            });
        } catch (error) {
            console.error(`Failed to export ${formatConfig.format}:`, error);
        }
    }
    
    return results;
}

// 画質比較用のプレビュー生成
export async function generateQualityPreview(element, qualities = Object.values(EXPORT_QUALITY)) {
    const previews = [];
    
    for (const quality of qualities) {
        try {
            const result = await exportHighQualityImage(element, {
                quality,
                autoDownload: false
            });
            
            previews.push({
                name: quality.name,
                url: result.url,
                size: result.size,
                format: result.format,
                quality
            });
        } catch (error) {
            console.error(`Failed to generate preview for ${quality.name}:`, error);
        }
    }
    
    return previews;
}