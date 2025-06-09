/**
 * GridMe アプリケーション JavaScript
 * 
 * インタラクティブな機能を実装
 */

// グローバル状態管理
const state = {
    theme: localStorage.getItem('theme') || 'light',
    scrolled: false,
    mobileMenuOpen: false
};

// DOM要素の取得
const elements = {
    navbar: document.querySelector('.navbar'),
    navToggle: document.querySelector('.nav-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    themeToggle: document.querySelector('.theme-toggle'),
    navLinks: document.querySelectorAll('.nav-link'),
    demoTabs: document.querySelectorAll('.demo-tab'),
    demoPanels: document.querySelectorAll('.demo-panel'),
    showToastBtn: document.getElementById('show-toast'),
    getStartedBtn: document.getElementById('get-started'),
    toastContainer: document.getElementById('toast-container')
};

// テーマの初期化
function initTheme() {
    if (state.theme === 'dark' || 
        (!state.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark-theme');
        updateThemeIcon(true);
    }
}

// テーマ切り替え
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    state.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    updateThemeIcon(isDark);
}

// テーマアイコン更新
function updateThemeIcon(isDark) {
    const sunIcon = elements.themeToggle.querySelector('.icon-sun');
    const moonIcon = elements.themeToggle.querySelector('.icon-moon');
    
    if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// モバイルメニュー切り替え
function toggleMobileMenu() {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    elements.navMenu.classList.toggle('active');
    
    // ハンバーガーアニメーション
    const spans = elements.navToggle.querySelectorAll('span');
    if (state.mobileMenuOpen) {
        spans[0].style.transform = 'rotate(45deg) translateY(6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-6px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
}

// スクロール処理
function handleScroll() {
    const scrolled = window.scrollY > 50;
    
    if (scrolled !== state.scrolled) {
        state.scrolled = scrolled;
        elements.navbar.style.background = scrolled ? 
            'rgba(255, 255, 255, 0.95)' : 
            'rgba(255, 255, 255, 0.8)';
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches || state.theme === 'dark') {
            elements.navbar.style.background = scrolled ? 
                'rgba(9, 9, 11, 0.95)' : 
                'rgba(9, 9, 11, 0.8)';
        }
    }
    
    // アクティブセクションの更新
    updateActiveSection();
}

// アクティブセクション更新
function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// スムーズスクロール
function smoothScroll(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // モバイルメニューを閉じる
        if (state.mobileMenuOpen) {
            toggleMobileMenu();
        }
    }
}

// デモタブ切り替え
function switchDemoTab(e) {
    const targetDemo = e.currentTarget.getAttribute('data-demo');
    
    // タブの更新
    elements.demoTabs.forEach(tab => tab.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // パネルの更新
    elements.demoPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `demo-${targetDemo}`) {
            panel.classList.add('active');
        }
    });
}

// トースト通知表示
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `${icon}<span>${message}</span>`;
    
    elements.toastContainer.appendChild(toast);
    
    // アニメーション
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自動削除
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// トーストアイコン取得
function getToastIcon(type) {
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="var(--success)"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="var(--error)"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="var(--info)"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>'
    };
    return icons[type] || icons.info;
}

// プログレスバーアニメーション
function animateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 80) {
                clearInterval(interval);
            } else {
                width += 2;
                progressBar.style.width = width + '%';
            }
        }, 30);
    }
}

// インタラクティブカードエフェクト
function addCardEffects() {
    const cards = document.querySelectorAll('.card-interactive, .feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// CSS カスタムプロパティ for dark theme
function addDarkThemeStyles() {
    const style = document.createElement('style');
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
    `;
    document.head.appendChild(style);
}

// イベントリスナーの設定
function setupEventListeners() {
    // テーマ切り替え
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // モバイルメニュー
    elements.navToggle?.addEventListener('click', toggleMobileMenu);
    
    // スムーズスクロール
    elements.navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    // デモタブ
    elements.demoTabs.forEach(tab => {
        tab.addEventListener('click', switchDemoTab);
    });
    
    // トースト表示
    elements.showToastBtn?.addEventListener('click', () => {
        showToast('保存しました！', 'success');
    });
    
    // スタートガイド
    elements.getStartedBtn?.addEventListener('click', () => {
        showToast('ドキュメントページに移動します...', 'info');
        setTimeout(() => {
            window.location.href = 'examples/demo.html';
        }, 1000);
    });
    
    // スクロールイベント
    window.addEventListener('scroll', handleScroll);
    
    // リサイズイベント
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && state.mobileMenuOpen) {
            toggleMobileMenu();
        }
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    addDarkThemeStyles();
    initTheme();
    setupEventListeners();
    addCardEffects();
    animateProgressBar();
    handleScroll();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 要素のアニメーション監視
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .showcase-item, .section-title');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});