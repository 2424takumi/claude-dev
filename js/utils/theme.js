/**
 * テーマ管理モジュール
 * 
 * ダーク/ライトモードの切り替えを管理
 */

export class ThemeManager {
    constructor() {
        this.themeKey = 'theme';
        this.darkClass = 'dark-theme';
        this.currentTheme = null;
        this.toggleButton = null;
        this.init();
    }

    init() {
        // 保存されているテーマを取得
        this.currentTheme = localStorage.getItem(this.themeKey) || 'light';
        
        // システムのカラースキームを検出
        if (!localStorage.getItem(this.themeKey)) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
        
        // テーマを適用
        this.applyTheme();
        
        // ダークテーマスタイルを追加
        this.addDarkThemeStyles();
    }

    setToggleButton(button) {
        this.toggleButton = button;
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggle());
            this.updateButtonIcon();
        }
    }

    applyTheme() {
        if (this.currentTheme === 'dark') {
            document.documentElement.classList.add(this.darkClass);
        } else {
            document.documentElement.classList.remove(this.darkClass);
        }
        this.updateButtonIcon();
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(this.themeKey, this.currentTheme);
        this.applyTheme();
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.currentTheme = theme;
            localStorage.setItem(this.themeKey, theme);
            this.applyTheme();
        }
    }

    getTheme() {
        return this.currentTheme;
    }

    isDark() {
        return this.currentTheme === 'dark';
    }

    updateButtonIcon() {
        if (!this.toggleButton) return;
        
        const sunIcon = this.toggleButton.querySelector('.icon-sun');
        const moonIcon = this.toggleButton.querySelector('.icon-moon');
        
        if (sunIcon && moonIcon) {
            if (this.isDark()) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }

    addDarkThemeStyles() {
        if (document.getElementById('dark-theme-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'dark-theme-styles';
        style.textContent = `
            .dark-theme {
                --bg-primary: var(--neutral-950);
                --bg-secondary: var(--neutral-900);
                --bg-tertiary: var(--neutral-800);
                --text-primary: var(--neutral-50);
                --text-secondary: var(--neutral-400);
                --text-tertiary: var(--neutral-500);
                --border-primary: var(--neutral-700);
                --border-secondary: var(--neutral-800);
                --card-bg: var(--neutral-900);
                --card-border: var(--neutral-800);
            }
            
            .dark-theme .navbar {
                background: rgba(9, 9, 11, 0.8);
            }
            
            .dark-theme .card-glass {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            /* テーマ別スタイル（ダークモード） */
            .dark-theme .grid-theme-item.theme-default {
                background-color: #1a1a1a;
            }
            
            .dark-theme .grid-theme-item.theme-warm {
                background-color: #2d1810;
            }
            
            .dark-theme .grid-theme-item.theme-cool {
                background-color: #101828;
            }
            
            .dark-theme .grid-theme-item.theme-nature {
                background-color: #0a1f0a;
            }
            
            .dark-theme .grid-theme-item.theme-elegant {
                background-color: #1f0a2d;
            }
            
            .dark-theme .grid-theme-item.theme-modern {
                background-color: #0f0f0f;
            }
            
            .dark-theme .photo-theme-item.theme-default {
                background-color: #1a1a1a;
            }
            
            .dark-theme .photo-theme-item.theme-warm {
                background-color: #2d1810;
            }
            
            .dark-theme .photo-theme-item.theme-cool {
                background-color: #101828;
            }
            
            .dark-theme .photo-theme-item.theme-nature {
                background-color: #0a1f0a;
            }
            
            .dark-theme .photo-theme-item.theme-elegant {
                background-color: #1f0a2d;
            }
            
            .dark-theme .photo-theme-item.theme-modern {
                background-color: #0f0f0f;
            }
        `;
        document.head.appendChild(style);
    }

    // スクロール時のナビゲーションバー背景更新
    updateNavbarBackground(navbar, scrolled) {
        if (!navbar) return;
        
        if (this.isDark()) {
            navbar.style.background = scrolled ? 
                'rgba(9, 9, 11, 0.95)' : 
                'rgba(9, 9, 11, 0.8)';
        } else {
            navbar.style.background = scrolled ? 
                'rgba(255, 255, 255, 0.95)' : 
                'rgba(255, 255, 255, 0.8)';
        }
    }
}

// デフォルトインスタンスをエクスポート
export const theme = new ThemeManager();