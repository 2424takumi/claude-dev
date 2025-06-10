/**
 * モーダル管理モジュール
 * 
 * 統一されたモーダルの表示/非表示を管理
 */

export class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.init();
    }

    init() {
        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                const lastModal = Array.from(this.activeModals).pop();
                this.close(lastModal);
            }
        });
    }

    register(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) return null;

        const config = {
            closeOnBackdropClick: true,
            closeButtonSelector: '.app-modal-close',
            onOpen: null,
            onClose: null,
            ...options
        };

        // 閉じるボタンの設定
        const closeButton = modal.querySelector(config.closeButtonSelector);
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close(modalId));
        }

        // 背景クリックで閉じる設定
        if (config.closeOnBackdropClick) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(modalId);
                }
            });
        }

        // モーダル設定を保存
        modal._modalConfig = config;

        return {
            open: () => this.open(modalId),
            close: () => this.close(modalId),
            toggle: () => this.toggle(modalId)
        };
    }

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('active');
        this.activeModals.add(modalId);

        // コールバック実行
        if (modal._modalConfig?.onOpen) {
            modal._modalConfig.onOpen(modal);
        }

        // アクセシビリティ: フォーカスをモーダルに移動
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        this.activeModals.delete(modalId);

        // コールバック実行
        if (modal._modalConfig?.onClose) {
            modal._modalConfig.onClose(modal);
        }
    }

    toggle(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (modal.classList.contains('active')) {
            this.close(modalId);
        } else {
            this.open(modalId);
        }
    }

    closeAll() {
        this.activeModals.forEach(modalId => {
            this.close(modalId);
        });
    }

    isOpen(modalId) {
        return this.activeModals.has(modalId);
    }

    // 便利なメソッド：確認ダイアログ
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modalHtml = `
                <div id="confirm-modal" class="app-modal">
                    <div class="app-modal-content">
                        <div class="app-modal-header">
                            <h3 class="app-modal-title">${options.title || '確認'}</h3>
                            <button class="app-modal-close">×</button>
                        </div>
                        <div class="app-modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="app-modal-footer">
                            <button class="btn btn-secondary" data-action="cancel">キャンセル</button>
                            <button class="btn btn-primary" data-action="confirm">確認</button>
                        </div>
                    </div>
                </div>
            `;

            // 一時的なモーダルを作成
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = modalHtml;
            const modal = tempDiv.firstElementChild;
            document.body.appendChild(modal);

            // モーダルを登録
            this.register('confirm-modal', {
                onClose: () => {
                    modal.remove();
                }
            });

            // ボタンイベント
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.close('confirm-modal');
                resolve(false);
            });

            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                this.close('confirm-modal');
                resolve(true);
            });

            // モーダルを開く
            this.open('confirm-modal');
        });
    }
}

// デフォルトインスタンスをエクスポート
export const modal = new ModalManager();