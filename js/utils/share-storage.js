/**
 * 共有データストレージモジュール
 * 
 * IndexedDBを使用して共有データを一時的に保存し、
 * 短いIDで参照できるようにする
 */

export class ShareStorage {
    constructor() {
        this.dbName = 'GridMeShareDB';
        this.storeName = 'shares';
        this.dbVersion = 1;
        this.db = null;
        this.expirationTime = 7 * 24 * 60 * 60 * 1000; // 7日間
    }

    // データベースを初期化
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB open error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // ストアが存在しない場合は作成
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // ランダムなIDを生成
    generateId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    // データを保存
    async save(data) {
        if (!this.db) {
            await this.init();
        }

        // 期限切れデータをクリーンアップ
        await this.cleanup();

        const id = this.generateId();
        const timestamp = Date.now();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const shareData = {
                id,
                data,
                timestamp,
                expiresAt: timestamp + this.expirationTime
            };

            const request = store.add(shareData);

            request.onsuccess = () => {
                resolve(id);
            };

            request.onerror = () => {
                console.error('Save error:', request.error);
                reject(request.error);
            };
        });
    }

    // データを取得
    async get(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result;
                
                if (!result) {
                    resolve(null);
                    return;
                }

                // 期限切れチェック
                if (result.expiresAt < Date.now()) {
                    // 期限切れデータを削除
                    this.delete(id);
                    resolve(null);
                    return;
                }

                resolve(result.data);
            };

            request.onerror = () => {
                console.error('Get error:', request.error);
                reject(request.error);
            };
        });
    }

    // データを削除
    async delete(id) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error('Delete error:', request.error);
                reject(request.error);
            };
        });
    }

    // 期限切れデータをクリーンアップ
    async cleanup() {
        if (!this.db) {
            await this.init();
        }

        const now = Date.now();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const request = index.openCursor();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    if (cursor.value.expiresAt < now) {
                        store.delete(cursor.value.id);
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };

            request.onerror = () => {
                console.error('Cleanup error:', request.error);
                reject(request.error);
            };
        });
    }

    // localStorageフォールバック（IndexedDBが使えない場合）
    async saveToLocalStorage(data) {
        const id = this.generateId();
        const timestamp = Date.now();
        
        const shareData = {
            data,
            timestamp,
            expiresAt: timestamp + this.expirationTime
        };

        try {
            localStorage.setItem(`gridme_share_${id}`, JSON.stringify(shareData));
            
            // 古いデータをクリーンアップ
            this.cleanupLocalStorage();
            
            return id;
        } catch (error) {
            console.error('LocalStorage save error:', error);
            throw error;
        }
    }

    // localStorageから取得
    getFromLocalStorage(id) {
        try {
            const item = localStorage.getItem(`gridme_share_${id}`);
            if (!item) return null;

            const shareData = JSON.parse(item);
            
            // 期限切れチェック
            if (shareData.expiresAt < Date.now()) {
                localStorage.removeItem(`gridme_share_${id}`);
                return null;
            }

            return shareData.data;
        } catch (error) {
            console.error('LocalStorage get error:', error);
            return null;
        }
    }

    // localStorageをクリーンアップ
    cleanupLocalStorage() {
        const now = Date.now();
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('gridme_share_')) {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const shareData = JSON.parse(item);
                        if (shareData.expiresAt < now) {
                            keysToRemove.push(key);
                        }
                    }
                } catch (error) {
                    // パースエラーの場合は削除
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}

// デフォルトインスタンスをエクスポート
export const shareStorage = new ShareStorage();