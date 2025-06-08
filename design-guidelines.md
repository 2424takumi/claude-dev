# GridMe デザインガイドライン

## 🎨 デザインフィロソフィー

### コアコンセプト: "シンプル × エキサイティング"
GridMeは、Z世代のデジタルネイティブに向けた、視覚的にクリーンでありながらも、使うたびにワクワクする体験を提供するデザインを目指します。

### デザイン原則

#### 1. **Authenticity（真正性）**
- 誇張しない、素直なデザイン
- ユーザーの本音と向き合う
- 透明性のあるインターフェース

#### 2. **Fluidity（流動性）**
- スムーズなトランジション
- 自然な動きのマイクロインタラクション
- レスポンシブで適応的なレイアウト

#### 3. **Playfulness（遊び心）**
- 予想外の楽しい要素
- インタラクティブなフィードバック
- エモーショナルなつながり

#### 4. **Minimalism Plus（ミニマリズム・プラス）**
- 必要最小限の要素
- 意味のあるアクセント
- ネガティブスペースの活用

## 🎨 カラーパレット

### プライマリカラー
```css
--primary-gradient-start: #667EEA; /* Indigo 500 */
--primary-gradient-end: #764BA2;   /* Purple 600 */
--primary-solid: #6366F1;          /* Indigo 500 - メイン */
--primary-light: #A5B4FC;          /* Indigo 300 */
--primary-dark: #4338CA;           /* Indigo 700 */
```

### セカンダリカラー
```css
--secondary-cyan: #06B6D4;         /* Cyan 500 */
--secondary-emerald: #10B981;      /* Emerald 500 */
--secondary-pink: #EC4899;         /* Pink 500 */
```

### ニュートラルカラー
```css
--neutral-50: #FAFAFA;
--neutral-100: #F4F4F5;
--neutral-200: #E4E4E7;
--neutral-300: #D4D4D8;
--neutral-400: #A1A1AA;
--neutral-500: #71717A;
--neutral-600: #52525B;
--neutral-700: #3F3F46;
--neutral-800: #27272A;
--neutral-900: #18181B;
--neutral-950: #09090B;
```

### アクセントカラー
```css
--accent-neon-purple: #BF40BF;
--accent-neon-green: #39FF14;
--accent-coral: #FF6B6B;
--accent-yellow: #FFD93D;
```

### セマンティックカラー
```css
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

## 📝 タイポグラフィ

### フォントファミリー
```css
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-japanese: 'Noto Sans JP', sans-serif;
```

### フォントサイズ
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */
```

### フォントウェイト
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### 行間（Line Height）
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## 📐 スペーシングシステム

### ベーススペーシング
```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### グリッドシステム
- **コンテナ最大幅**: 1280px
- **カラム数**: 12
- **ガター幅**: 24px (デスクトップ), 16px (モバイル)
- **ブレイクポイント**:
  - `xs`: 0px
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## 🎯 コンポーネントパターン

### ボタン
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  color: white;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: 12px;
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  border: 2px solid var(--primary-solid);
  color: var(--primary-solid);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: 12px;
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: var(--primary-solid);
  color: white;
  transform: scale(1.05);
}
```

### カード
```css
.card {
  background: white;
  border-radius: 16px;
  padding: var(--spacing-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: var(--spacing-6);
}
```

### インプットフィールド
```css
.input {
  background: var(--neutral-50);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-solid);
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
```

## ✨ インタラクション & アニメーション

### トランジション
```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
--transition-slower: 0.5s ease;
```

### アニメーションプリセット
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### マイクロインタラクション
- **ホバー効果**: 軽い拡大、影の追加、色の変化
- **クリックフィードバック**: 押し込み効果、リップル効果
- **ローディング**: パルスアニメーション、プログレスバー
- **成功/エラー**: バウンス効果、シェイク効果

## 🌟 特別な要素

### グラデーションメッシュ背景
```css
.gradient-mesh {
  background: 
    radial-gradient(circle at 20% 50%, var(--accent-neon-purple) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, var(--secondary-cyan) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, var(--secondary-pink) 0%, transparent 50%);
  filter: blur(40px);
  opacity: 0.4;
}
```

### グロウ効果
```css
.glow {
  box-shadow: 
    0 0 20px rgba(99, 102, 241, 0.5),
    0 0 40px rgba(99, 102, 241, 0.3),
    0 0 60px rgba(99, 102, 241, 0.1);
}
```

### ネオモーフィズム（オプション）
```css
.neumorphic {
  background: var(--neutral-100);
  border-radius: 16px;
  box-shadow: 
    20px 20px 60px rgba(0, 0, 0, 0.1),
    -20px -20px 60px rgba(255, 255, 255, 0.7);
}
```

## 📱 レスポンシブデザイン

### モバイルファースト
- タッチターゲット最小サイズ: 44px × 44px
- フォントサイズ最小: 14px
- 適切な余白とスペーシング
- スワイプジェスチャーのサポート

### ダークモード対応
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--neutral-950);
    --bg-secondary: var(--neutral-900);
    --text-primary: var(--neutral-50);
    --text-secondary: var(--neutral-400);
  }
}
```

## 🎯 使用例とベストプラクティス

### Do's ✅
- グラデーションは控えめに使用
- アニメーションは目的を持って使用
- 一貫性のあるスペーシングを維持
- アクセシビリティを考慮（WCAG 2.1 AA準拠）
- パフォーマンスを意識（60fps維持）

### Don'ts ❌
- 過度なアニメーション
- 読みにくいコントラスト比
- 不規則なスペーシング
- 突然の画面遷移
- 重いグラフィック効果の多用

## 🚀 実装ガイド

### CSS変数の使用
すべてのスタイリングでCSS変数を使用し、一貫性とメンテナンス性を確保します。

### コンポーネントライブラリ
- React/Vue/Angularなどのフレームワークに対応
- Storybookでのドキュメント化推奨
- デザイントークンの活用

### パフォーマンス最適化
- Critical CSSの分離
- 画像の遅延読み込み
- アニメーションのGPU最適化
- フォントのプリロード

---

このガイドラインは、GridMeのデザインシステムの基礎となります。定期的に見直し、ユーザーフィードバックに基づいて更新していくことを推奨します。