/**
 * ユーティリティモジュールのエクスポート
 * 
 * 全ての共通モジュールを一箇所からインポート可能
 */

export { toast, ToastManager } from './toast.js';
export { theme } from './theme.js';
export { ThemeManager } from './theme.js';
export { modal, ModalManager } from './modal.js';
export { storage, StorageManager, Storage } from './storage.js';
export { share, ShareManager } from './share.js';
export { shareStorage, ShareStorage } from './share-storage.js';
export { createGrid, GridRenderer } from './grid.js';

// デフォルトインスタンスをまとめてエクスポート
export const utils = {
    toast: toast,
    theme: theme,
    modal: modal,
    storage: storage,
    share: share
};