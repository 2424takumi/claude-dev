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
    async exportAsImage(filename = 'grid.png') {
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas library is required for export');
            return null;
        }

        try {
            const canvas = await html2canvas(this.container, {
                backgroundColor: null,
                scale: 2 // 高解像度
            });
            
            // ダウンロードリンクを作成
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Export error:', error);
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