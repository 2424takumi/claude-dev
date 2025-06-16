/**
 * ユーティリティモジュールのエクスポート
 * 
 * 全ての共通モジュールを一箇所からインポート可能
 */

// 各モジュールからインポート
import { toast, ToastManager } from './toast.js';
import { theme, ThemeManager } from './theme.js';
import { modal, ModalManager } from './modal.js';
import { storage, StorageManager, Storage } from './storage.js';
import { share, ShareManager } from './share.js';
import { shareStorage, ShareStorage } from './share-storage.js';
import { createGrid, GridRenderer } from './grid.js';
import { 
    exportHighQualityImage, 
    exportMultipleFormats, 
    generateQualityPreview,
    EXPORT_QUALITY,
    getOptimalScale,
    supportsWebP 
} from './image-export.js';

// 再エクスポート
export { 
    toast, 
    ToastManager,
    theme,
    ThemeManager,
    modal,
    ModalManager,
    storage,
    StorageManager,
    Storage,
    share,
    ShareManager,
    shareStorage,
    ShareStorage,
    createGrid,
    GridRenderer,
    exportHighQualityImage,
    exportMultipleFormats,
    generateQualityPreview,
    EXPORT_QUALITY,
    getOptimalScale,
    supportsWebP
};

// デフォルトインスタンスをまとめてエクスポート
export const utils = {
    toast,
    theme,
    modal,
    storage,
    share
};