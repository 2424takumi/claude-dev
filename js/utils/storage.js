/**
 * ローカルストレージ管理モジュール
 * 
 * 統一されたデータの保存/読み込みを提供
 */

export class StorageManager {
    constructor(prefix = 'gridme') {
        this.prefix = prefix;
        this.cache = new Map();
    }

    // キーにプレフィックスを追加
    getKey(key) {
        return `${this.prefix}-${key}`;
    }

    // データを保存
    set(key, value, options = {}) {
        const fullKey = this.getKey(key);
        const data = {
            value,
            timestamp: new Date().toISOString(),
            expires: options.expires || null
        };

        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(fullKey, serialized);
            this.cache.set(fullKey, data);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    // データを取得
    get(key, defaultValue = null) {
        const fullKey = this.getKey(key);

        // キャッシュから取得
        if (this.cache.has(fullKey)) {
            const cached = this.cache.get(fullKey);
            if (!this.isExpired(cached)) {
                return cached.value;
            }
        }

        // ローカルストレージから取得
        try {
            const stored = localStorage.getItem(fullKey);
            if (!stored) return defaultValue;

            const data = JSON.parse(stored);
            
            // 期限切れチェック
            if (this.isExpired(data)) {
                this.remove(key);
                return defaultValue;
            }

            // キャッシュに保存
            this.cache.set(fullKey, data);
            return data.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    // データを削除
    remove(key) {
        const fullKey = this.getKey(key);
        localStorage.removeItem(fullKey);
        this.cache.delete(fullKey);
    }

    // 複数のデータを一括保存
    setMultiple(items) {
        const results = {};
        for (const [key, value] of Object.entries(items)) {
            results[key] = this.set(key, value);
        }
        return results;
    }

    // 複数のデータを一括取得
    getMultiple(keys, defaults = {}) {
        const results = {};
        for (const key of keys) {
            results[key] = this.get(key, defaults[key] || null);
        }
        return results;
    }

    // プレフィックスに一致する全てのキーを取得
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix + '-')) {
                keys.push(key.substring(this.prefix.length + 1));
            }
        }
        return keys;
    }

    // プレフィックスに一致する全てのデータを削除
    clear() {
        const keys = this.getAllKeys();
        keys.forEach(key => this.remove(key));
        this.cache.clear();
    }

    // データが期限切れかチェック
    isExpired(data) {
        if (!data.expires) return false;
        return new Date(data.expires) < new Date();
    }

    // ストレージの使用量を取得（概算）
    getSize() {
        let size = 0;
        const keys = this.getAllKeys();
        keys.forEach(key => {
            const fullKey = this.getKey(key);
            const value = localStorage.getItem(fullKey);
            if (value) {
                size += value.length + fullKey.length;
            }
        });
        return size;
    }

    // データのエクスポート
    export() {
        const data = {};
        const keys = this.getAllKeys();
        keys.forEach(key => {
            data[key] = this.get(key);
        });
        return data;
    }

    // データのインポート
    import(data, overwrite = true) {
        for (const [key, value] of Object.entries(data)) {
            if (overwrite || !this.get(key)) {
                this.set(key, value);
            }
        }
    }
}

// 便利な静的メソッド
export class Storage {
    static instance = new StorageManager();

    static get(key, defaultValue) {
        return this.instance.get(key, defaultValue);
    }

    static set(key, value, options) {
        return this.instance.set(key, value, options);
    }

    static remove(key) {
        return this.instance.remove(key);
    }

    static clear() {
        return this.instance.clear();
    }
}

// デフォルトインスタンスをエクスポート
export const storage = new StorageManager();