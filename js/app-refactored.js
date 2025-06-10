/**
 * GridMe アプリケーション JavaScript (リファクタリング版)
 * 
 * モジュール化されたユーティリティを使用
 */

import { toast, theme, modal } from './utils/index.js';

// グローバル状態管理
const state = {
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
    getStartedBtn: document.getElementById('get-started')
};

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
        theme.updateNavbarBackground(elements.navbar, scrolled);
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

// イベントリスナーの設定
function setupEventListeners() {
    // テーマ切り替え
    theme.setToggleButton(elements.themeToggle);
    
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
        toast.success('保存しました！');
    });
    
    // スタートガイド
    elements.getStartedBtn?.addEventListener('click', () => {
        toast.info('ドキュメントページに移動します...');
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
function setupAnimationObserver() {
    const animateElements = document.querySelectorAll('.feature-card, .showcase-item, .section-title');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    addCardEffects();
    animateProgressBar();
    handleScroll();
    setupAnimationObserver();
});