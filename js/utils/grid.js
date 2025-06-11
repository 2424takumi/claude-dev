/**
 * グリッドレンダリングモジュール
 * 
 * 統一されたグリッド生成とレンダリング機能を提供
 */

export class GridRenderer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            defaultSize: 3,
            minSize: 2,
            maxSize: 10,
            itemClass: 'grid-item',
            enableAnimation: true,
            ...options
        };
        this.gridSize = this.options.defaultSize;
        this.items = [];
    }

    // グリッドサイズを設定
    setSize(size) {
        const newSize = Math.max(this.options.minSize, Math.min(this.options.maxSize, size));
        if (newSize !== this.gridSize) {
            this.gridSize = newSize;
            this.updateGridLayout();
            return true;
        }
        return false;
    }

    // グリッドレイアウトを更新
    updateGridLayout() {
        if (!this.container) return;
        
        this.container.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        
        // CSSカスタムプロパティも設定
        this.container.style.setProperty('--grid-size', this.gridSize);
    }

    // グリッドアイテムを作成
    createItem(data, index) {
        const item = document.createElement('div');
        item.className = this.options.itemClass;
        item.dataset.index = index;
        
        if (this.options.enableAnimation) {
            item.classList.add('grid-item-animated');
        }
        
        return item;
    }

    // グリッドをレンダリング
    render(items) {
        if (!this.container) return;
        
        // 既存のアイテムをクリア
        this.clear();
        
        // 新しいアイテムを作成
        this.items = items;
        const fragment = document.createDocumentFragment();
        
        items.forEach((itemData, index) => {
            const item = this.createItem(itemData, index);
            
            // カスタムレンダリング関数が提供されている場合
            if (this.options.renderItem) {
                this.options.renderItem(item, itemData, index);
            }
            
            fragment.appendChild(item);
        });
        
        this.container.appendChild(fragment);
        this.updateGridLayout();
        
        // アニメーションをトリガー
        if (this.options.enableAnimation) {
            this.animateItems();
        }
    }

    // グリッドをクリア
    clear() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.items = [];
    }

    // アイテムをアニメーション
    animateItems() {
        const items = this.container.querySelectorAll(`.${this.options.itemClass}`);
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 50}ms`;
        });
    }

    // 特定のアイテムを更新
    updateItem(index, data) {
        const item = this.container.querySelector(`[data-index="${index}"]`);
        if (item && this.options.renderItem) {
            // 既存の内容をクリア
            item.innerHTML = '';
            this.options.renderItem(item, data, index);
        }
    }

    // グリッドのエクスポート（画像として）
    async exportAsImage(filename = 'grid.png', autoDownload = true) {
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas library is required for export');
            return null;
        }

        try {
            const canvas = await html2canvas(this.container, {
                backgroundColor: null,
                scale: 2, // 高解像度
                useCORS: true, // CORS画像のサポート
                allowTaint: true, // 外部画像の許可
                logging: false, // デバッグログを無効化
                imageTimeout: 0, // 画像タイムアウトを無効化
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
                    });
                }
            });
            
            const dataUrl = canvas.toDataURL('image/png');
            
            // 自動ダウンロードが有効な場合のみダウンロード
            if (autoDownload) {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
            }
            
            return dataUrl;
        } catch (error) {
            console.error('Export error:', error);
            return null;
        }
    }

    // グリッドを写真として保存（写真アルバムへ）
    async saveAsPhoto(filename = 'grid.png') {
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas library is required for export');
            return null;
        }

        try {
            const canvas = await html2canvas(this.container, {
                backgroundColor: null,
                scale: 2, // 高解像度
                useCORS: true, // CORS画像のサポート
                allowTaint: true, // 外部画像の許可
                logging: false, // デバッグログを無効化
                imageTimeout: 0, // 画像タイムアウトを無効化
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
                    });
                }
            });
            
            // CanvasをBlobに変換
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Web Share APIをサポートしているかチェック
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
                // Web Share APIを使用して写真を共有（モバイルでは写真アルバムに保存可能）
                const file = new File([blob], filename, { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'GridMe',
                        text: 'GridMeで作成した画像'
                    });
                    return true;
                } catch (err) {
                    // ユーザーがキャンセルした場合
                    if (err.name === 'AbortError') {
                        return false;
                    }
                    throw err;
                }
            } else {
                // Web Share APIがサポートされていない場合は従来のダウンロード
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
                return true;
            }
        } catch (error) {
            console.error('Save as photo error:', error);
            return null;
        }
    }

    // グリッドデータを取得
    getGridData() {
        return {
            size: this.gridSize,
            items: this.items
        };
    }

    // グリッドデータを設定
    setGridData(data) {
        if (data.size) {
            this.setSize(data.size);
        }
        if (data.items) {
            this.render(data.items);
        }
    }

    // レスポンシブ対応
    enableResponsive(breakpoints) {
        const updateSize = () => {
            const width = window.innerWidth;
            let newSize = this.options.defaultSize;
            
            for (const [breakpoint, size] of Object.entries(breakpoints)) {
                if (width <= parseInt(breakpoint)) {
                    newSize = size;
                    break;
                }
            }
            
            this.setSize(newSize);
        };
        
        window.addEventListener('resize', updateSize);
        updateSize(); // 初期実行
    }

    // グリッドアイテムのシャッフル
    shuffle() {
        const shuffled = [...this.items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.render(shuffled);
    }

    // グリッドアイテムのフィルタリング
    filter(predicate) {
        const items = this.container.querySelectorAll(`.${this.options.itemClass}`);
        items.forEach((item, index) => {
            const shouldShow = predicate(this.items[index], index);
            item.style.display = shouldShow ? '' : 'none';
        });
    }

    // 全アイテムを表示
    showAll() {
        const items = this.container.querySelectorAll(`.${this.options.itemClass}`);
        items.forEach(item => {
            item.style.display = '';
        });
    }
}

// 便利なファクトリー関数
export function createGrid(containerId, options) {
    return new GridRenderer(containerId, options);
}

// デフォルトエクスポート
export default GridRenderer;