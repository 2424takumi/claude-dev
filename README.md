# GridMe - インタラクティブ・テーマグリッド作成アプリ

![GridMe](https://img.shields.io/badge/GridMe-Theme%20Grid%20Creator-8B5CF6?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-success?style=flat-square)
![License](https://img.shields.io/badge/license-Private-red?style=flat-square)

## 🎯 プロジェクト概要

GridMeは、テーマベースのインタラクティブなグリッドを作成・共有できるWebアプリケーションです。Z世代向けのモダンで「シンプルだけどワクワクする」デザインを採用し、相手の印象を画像で表現し、グリッドを共有して楽しむためのWEBサービスです。

### 🌟 GridMeの意義

- **創造性の促進**: ユーザーが自由にテーマを設定し、独自のグリッドを作成
- **シンプルな共有**: URLひとつで簡単に友達や仲間とグリッドを共有
- **視覚的な整理**: アイデアや写真、コンセプトを視覚的に整理

## 🚀 主要機能

### 実装済み機能

1. **動的グリッド作成** 🎨
   - 2×2、3×3のグリッドサイズ選択
   - 各セクションにカスタムテーマ/トピックを設定（最大30文字）
   - ローカルストレージへの自動保存

2. **スマート共有システム** 🔗
   - ワンクリックでシェア可能なURLを生成
   - Web Share APIとクリップボードコピーのフォールバック対応
   - 全セクション入力時のみ共有ボタンが有効化

3. **共有グリッドビュー** 👀
   - 専用の共有ページでグリッドを閲覧
   - グリッドを画像として保存（html2canvas使用）
   - レスポンシブデザインで全デバイス対応

4. **モダンUI/UX** ✨
   - ダーク/ライトテーマの切り替え
   - グラスモーフィズムエフェクト
   - スムーズなアニメーションとトランジション
   - トースト通知によるフィードバック

### 今後の実装予定機能

- 📸 **画像アップロード機能**: 各グリッドセクションに画像を追加
- 🎨 **カスタムカラーテーマ**: ユーザー独自のカラースキーム作成
- 👥 **コラボレーション機能**: リアルタイム共同編集
- 📊 **テンプレートライブラリ**: 事前定義されたグリッドテンプレート
- 🔐 **ユーザーアカウント**: グリッドの保存と管理
- 📱 **モバイルアプリ**: iOS/Android対応

## 🛠 技術スタック

- **フロントエンド**: Vanilla JavaScript, HTML5, CSS3
- **スタイリング**: カスタムCSSデザインシステム
- **ライブラリ**: html2canvas（画像エクスポート用）
- **フォント**: Inter, Noto Sans JP
- **ストレージ**: LocalStorage API

## 📁 プロジェクト構成

```
GridMe/
├── index.html              # メインアプリケーション
├── shared.html            # 共有グリッドビューページ
├── js/
│   ├── app.js            # メインアプリケーションロジック
│   ├── photo-grid.js     # グリッド作成・管理
│   └── shared-grid.js    # 共有グリッド表示
├── styles/
│   ├── design-tokens.css # CSS変数定義
│   ├── components.css    # UIコンポーネント
│   ├── app.css          # アプリケーション固有スタイル
│   └── shared.css       # 共有ページスタイル
├── examples/
│   └── demo.html        # デザインシステムデモ
├── design-guidelines.md  # 詳細なデザインガイドライン
└── README.md            # このファイル
```

## 🎨 デザインシステム

Z世代向けのモダンで「シンプルだけどワクワクする」デザインシステムを採用しています。

### コアコンセプト
- **Authenticity（真正性）**: 誇張しない、素直なデザイン
- **Fluidity（流動性）**: スムーズなトランジション
- **Playfulness（遊び心）**: 予想外の楽しい要素
- **Minimalism Plus**: 必要最小限 + 意味のあるアクセント

### デザインの特徴
- 🎨 **グラデーション**: インディゴからパープルへの美しいグラデーション
- 💡 **アクセントカラー**: ネオンカラーで遊び心をプラス
- 🌓 **ダークモード対応**: 自動的に切り替わるカラースキーム
- 📱 **レスポンシブ**: すべてのデバイスで最適な表示

## 🚀 クイックスタート

### 1. リポジトリをクローン

```bash
git clone https://github.com/2424takumi/claude-dev.git
cd claude-dev
```

### 2. ローカルサーバーで起動

```bash
# Python 3を使用する場合
python -m http.server 8000

# Node.jsを使用する場合
npx http-server
```

### 3. ブラウザでアクセス

```
http://localhost:8000
```

## 💻 使い方

### 基本的な使用フロー

1. **グリッドサイズを選択**
   - 2×2または3×3のグリッドを選択

2. **テーマを入力**
   - 各グリッドセクションにテーマやトピックを入力（最大30文字）
   - 例：「夏の思い出」「お気に入りの場所」「今年の目標」など

3. **グリッドを共有**
   - すべてのセクションを入力すると共有ボタンが有効化
   - クリックして共有URLを生成

4. **受信者がグリッドを閲覧**
   - 共有されたURLを開く
   - グリッドを画像として保存可能

### 活用例

- 📚 **教育**: 学習テーマの整理、グループワークのアイデア出し
- 🎉 **イベント**: パーティーゲーム、アイスブレイク活動
- 💼 **ビジネス**: ブレインストーミング、プロジェクト計画
- 🎨 **クリエイティブ**: ムードボード作成、インスピレーション整理

## 🔧 開発者向け情報

### デザインシステムの使用

#### CSSファイルをインポート

```html
<!-- デザイントークン -->
<link rel="stylesheet" href="styles/design-tokens.css">
<!-- コンポーネントスタイル -->
<link rel="stylesheet" href="styles/components.css">
```

#### コンポーネントの使用例

```html
<!-- プライマリボタン -->
<button class="btn-primary">はじめる</button>

<!-- カード -->
<div class="card">
  <h3>タイトル</h3>
  <p>コンテンツ</p>
</div>

<!-- トグルスイッチ -->
<label class="switch">
  <input type="checkbox">
  <span class="switch-slider"></span>
</label>
```

### カスタマイズ

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

## 🎯 今後のロードマップ

### Phase 1（短期目標）
- ✅ 基本的なグリッド作成機能
- ✅ URL共有システム
- ✅ 画像エクスポート機能
- ⏳ 画像アップロード機能
- ⏳ カスタムカラーテーマ

### Phase 2（中期目標）
- 🔲 ユーザーアカウントシステム
- 🔲 グリッドのクラウド保存
- 🔲 テンプレートライブラリ
- 🔲 リアルタイムコラボレーション

### Phase 3（長期目標）
- 🔲 モバイルアプリ開発
- 🔲 API提供
- 🔲 エンタープライズ版
- 🔲 AIによるテーマ提案

## 🤝 貢献方法

GridMeはまだ開発初期段階です。以下の方法で貢献いただけます：

1. **バグ報告**: Issueを作成してバグを報告
2. **機能提案**: 新機能のアイデアを共有
3. **コード貢献**: Pull Requestを送信
4. **ドキュメント改善**: READMEやガイドラインの改善

### 開発環境のセットアップ

```bash
# リポジトリをフォーク & クローン
git clone https://github.com/[your-username]/claude-dev.git
cd claude-dev

# 新しいブランチを作成
git checkout -b feature/your-feature-name

# 変更を加えてコミット
git add .
git commit -m "feat: add your feature"

# プッシュしてPRを作成
git push origin feature/your-feature-name
```

## 📝 詳細ドキュメント

- [デザインガイドライン](design-guidelines.md) - 包括的なデザインシステムドキュメント
- [コンポーネントデモ](examples/demo.html) - 全UIコンポーネントの実例

## 🌐 ブラウザサポート

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- モバイルブラウザ (iOS Safari, Chrome for Android)


## 📞 お問い合わせ

- **Issues**: [GitHub Issues](https://github.com/2424takumi/claude-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/2424takumi/claude-dev/discussions)

## 🙏 謝辞

- フォント提供: Google Fonts
- アイコン: Heroicons
- インスピレーション: Z世代のクリエイティビティ

## 📄 ライセンス

このプロジェクトは、GridMeプロジェクト専用のプライベートライセンスです。

---

<div align="center">
  <p>Made with ❤️ by GridMe Team</p>
  <p>「シンプルだけどワクワクする」体験を提供します</p>
</div>
