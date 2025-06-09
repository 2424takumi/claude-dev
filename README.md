# GridMe デザインシステム

Z世代向けのモダンで「シンプルだけどワクワクする」デザインシステムです。

## 🚀 クイックスタート

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build
```

### CDNから使用する場合

```html
<!-- デザイントークン -->
<link rel="stylesheet" href="https://unpkg.com/gridme-design-system/dist/css/design-tokens.css">
<!-- コンポーネントスタイル -->
<link rel="stylesheet" href="https://unpkg.com/gridme-design-system/dist/css/components.css">
<!-- フォントの読み込み -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 基本的な使い方

```html
<button class="btn-primary">はじめる</button>
```

## 🛠 開発環境

### 利用可能なスクリプト

```bash
# 開発サーバー（ホットリロード対応）
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview

# コードの品質チェック
npm run lint         # ESLintとStylelintを実行
npm run format       # Prettierでフォーマット
npm run type-check   # TypeScriptの型チェック

# Storybook（コンポーネントカタログ）
npm run storybook
npm run build-storybook
```

## 📁 ファイル構成

```
├── design-guidelines.md    # 包括的なデザインガイドライン
├── styles/
│   ├── design-tokens.css  # CSS変数定義
│   └── components.css     # コンポーネントスタイル
├── examples/
│   └── demo.html         # デモページ
└── README.md            # このファイル
```

## 🎨 デザインの特徴

### コアコンセプト
- **Authenticity（真正性）**: 誇張しない、素直なデザイン
- **Fluidity（流動性）**: スムーズなトランジション
- **Playfulness（遊び心）**: 予想外の楽しい要素
- **Minimalism Plus**: 必要最小限 + 意味のあるアクセント

### カラーシステム
- **グラデーション**: インディゴからパープルへの美しいグラデーション
- **アクセントカラー**: ネオンカラーで遊び心をプラス
- **ダークモード対応**: 自動的に切り替わるカラースキーム

## 🛠 使用方法

### ボタン
```html
<!-- プライマリボタン -->
<button class="btn-primary">クリック</button>

<!-- ゴーストボタン -->
<button class="btn-ghost">詳細</button>

<!-- アイコンボタン -->
<button class="btn-icon">
  <svg>...</svg>
</button>
```

### カード
```html
<!-- ベースカード -->
<div class="card">
  <h3>タイトル</h3>
  <p>コンテンツ</p>
</div>

<!-- グラスモーフィズム -->
<div class="card-glass">
  <h3>透明感のあるカード</h3>
</div>
```

### フォーム要素
```html
<!-- テキスト入力 -->
<input type="text" class="input" placeholder="入力してください">

<!-- スイッチ -->
<label class="switch">
  <input type="checkbox">
  <span class="switch-slider"></span>
</label>
```

## 🎯 デザイン原則

1. **モバイルファースト**: すべてのデバイスで美しく表示
2. **アクセシビリティ**: WCAG 2.1 AA準拠を目指す
3. **パフォーマンス**: 60fpsのスムーズなアニメーション
4. **拡張性**: CSS変数による簡単なカスタマイズ

## 🔧 カスタマイズ

CSS変数を上書きすることで、簡単にカスタマイズできます：

```css
:root {
  /* カラーの変更 */
  --primary-solid: #8B5CF6;
  
  /* スペーシングの調整 */
  --spacing-unit: 4px;
  
  /* フォントの変更 */
  --font-body: 'Your Font', sans-serif;
}
```

## 📝 詳細ドキュメント

より詳しい情報は [design-guidelines.md](design-guidelines.md) をご覧ください。

## 🌐 ブラウザサポート

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 🔧 環境要件

- Node.js 18.0.0以上
- npm 8.0.0以上

## 📄 ライセンス

このデザインシステムは、GridMeプロジェクト専用です。