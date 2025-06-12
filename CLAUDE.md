# CLAUDE.md - GridMe開発ガイドライン for AI Assistants

このドキュメントは、AI開発アシスタント（特にClaude）がGridMeプロジェクトで効率的かつ一貫性のある開発を行うためのガイドラインです。

## 🎯 プロジェクト概要

GridMeは、Z世代向けのインタラクティブなテーマグリッド作成・共有Webアプリケーションです。「シンプルだけどワクワクする」体験の提供を目指しています。

### 主要な特徴
- 2×2または3×3のテーマグリッド作成
- ワンクリック共有機能
- 画像エクスポート機能
- ダーク/ライトテーマ対応
- モバイルファーストデザイン

## 🛠 開発環境セットアップ

新しい開発セッションを開始する際は、以下のコマンドを実行してください：

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 📋 コード品質チェック

コードを変更した後は、必ず以下のチェックを実行してください：

```bash
# ESLintでコード品質をチェック
npm run lint

# Prettierでフォーマットをチェック
npm run format:check

# または両方を一度に実行
npm run check
```

エラーがある場合は修正してください：

```bash
# ESLintエラーの自動修正
npm run lint:fix

# コードの自動フォーマット
npm run format
```

## 🏗 アーキテクチャとファイル構造

### ディレクトリ構造の理解

```
├── js/                      # JavaScriptファイル
│   ├── app.js              # メインアプリケーション（オリジナル版）
│   ├── app-refactored.js   # リファクタリング版（推奨）
│   ├── shared-grid.js      # 共有グリッド表示（オリジナル版）
│   ├── shared-grid-refactored.js  # リファクタリング版（推奨）
│   └── utils/              # ユーティリティモジュール
│       ├── grid.js         # グリッド操作
│       ├── modal.js        # モーダル管理
│       ├── share.js        # 共有機能
│       ├── storage.js      # ローカルストレージ
│       ├── theme.js        # テーマ切り替え
│       └── toast.js        # 通知表示
├── styles/                  # CSSファイル
│   ├── design-tokens.css   # デザイントークン（変更不可）
│   ├── components.css      # UIコンポーネント
│   ├── app.css            # アプリケーション固有
│   └── shared.css         # 共有ページ用
└── assets/                 # 画像・ロゴファイル
```

### 重要な原則

1. **リファクタリング版を優先**: 新機能は`*-refactored.js`ファイルに実装
2. **モジュール化**: 機能ごとに`utils/`内のモジュールを使用
3. **デザイントークンの遵守**: `design-tokens.css`の変数を必ず使用

## 🎨 デザインシステム

### カラー使用ガイドライン

```css
/* プライマリカラーはグラデーションを基本とする */
background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));

/* アクセントカラーは控えめに使用 */
color: var(--accent-neon-purple);  /* ホバー時やフォーカス時のみ */

/* セマンティックカラーを適切に使用 */
.success { color: var(--success); }
.error { color: var(--error); }
```

### コンポーネント作成時の注意

1. 既存のコンポーネントクラスを確認（`components.css`）
2. 新規コンポーネントは既存の命名規則に従う
3. グラスモーフィズム効果の使用を検討
4. アニメーションは`transition`プロパティで統一

## 💻 コーディング規約

### JavaScript

```javascript
// ✅ 良い例：ES6+の機能を活用
const createGrid = (size) => {
  const themes = Array(size * size).fill('');
  return themes;
};

// ❌ 悪い例：古い書き方
function createGrid(size) {
  var themes = [];
  for (var i = 0; i < size * size; i++) {
    themes.push('');
  }
  return themes;
}
```

### 非同期処理

```javascript
// ✅ 推奨：async/awaitを使用
const shareGrid = async () => {
  try {
    const url = await generateShareUrl();
    await navigator.clipboard.writeText(url);
    showToast('URLをコピーしました！');
  } catch (error) {
    showToast('エラーが発生しました', 'error');
  }
};
```

### イベントリスナー

```javascript
// ✅ 推奨：デリゲーションを活用
document.querySelector('.grid-container').addEventListener('click', (e) => {
  if (e.target.matches('.grid-item')) {
    handleGridItemClick(e.target);
  }
});
```

## 🚀 新機能実装ガイドライン

### 1. 事前確認

- [ ] 既存の類似機能を確認
- [ ] `utils/`内の再利用可能なモジュールを確認
- [ ] デザインシステムとの整合性を確認

### 2. 実装

- [ ] リファクタリング版のファイルに実装
- [ ] 既存のユーティリティモジュールを活用
- [ ] エラーハンドリングを適切に実装
- [ ] モバイル対応を考慮

### 3. テスト

- [ ] 主要ブラウザでの動作確認（Chrome, Firefox, Safari）
- [ ] モバイルデバイスでの動作確認
- [ ] ダークモード/ライトモードでの表示確認
- [ ] エッジケースの考慮

### 4. コード品質

- [ ] `npm run check`でエラーがないことを確認
- [ ] 不要なconsole.logを削除
- [ ] 適切なコメントを追加（複雑な処理のみ）

## 🔧 よくある開発タスク

### グリッドサイズの追加（例：4×4）

```javascript
// 1. utils/grid.js に定数を追加
export const GRID_SIZES = {
  SMALL: 2,
  MEDIUM: 3,
  LARGE: 4  // 新規追加
};

// 2. UIにボタンを追加
<button class="size-btn" data-size="4">4×4</button>

// 3. スタイルを調整
.grid-4x4 {
  grid-template-columns: repeat(4, 1fr);
}
```

### 新しいテーマ提案の追加

```javascript
// utils/theme.js のTHEME_SUGGESTIONSに追加
export const THEME_SUGGESTIONS = [
  // 既存のテーマ...
  '2024年の目標',
  '推しキャラ',
  // カテゴリを意識して追加
];
```

### トースト通知のカスタマイズ

```javascript
// utils/toast.js の showToast を使用
import { showToast } from './utils/toast.js';

// 成功メッセージ
showToast('保存しました！', 'success');

// エラーメッセージ
showToast('エラーが発生しました', 'error');

// カスタム表示時間
showToast('処理中...', 'info', 5000);
```

## 📝 コミットメッセージ規約

```
feat: 新機能の追加
fix: バグ修正
refactor: コードのリファクタリング
style: スタイルの変更
docs: ドキュメントの更新
chore: ビルドプロセスや補助ツールの変更
```

例：
```
feat: 4×4グリッドサイズのサポートを追加
fix: モバイルでの共有ボタンの表示を修正
refactor: グリッド作成ロジックをutils/grid.jsに移動
```

## 🎯 パフォーマンス最適化

### 画像の取り扱い

```javascript
// ✅ 推奨：適切なフォーマットとサイズ
<img src="logo.webp" alt="GridMe" loading="lazy" width="200" height="50">

// ❌ 避ける：大きな画像をそのまま使用
<img src="logo-original.png" alt="GridMe">
```

### アニメーション

```css
/* ✅ 推奨：transformを使用 */
.card:hover {
  transform: translateY(-4px);
}

/* ❌ 避ける：レイアウトに影響する属性 */
.card:hover {
  margin-top: -4px;
}
```

## 🔍 デバッグのヒント

### よくある問題と解決方法

1. **共有URLが生成されない**
   - LocalStorageにデータが保存されているか確認
   - URLSearchParamsが正しく生成されているか確認

2. **スタイルが適用されない**
   - CSS変数が正しく読み込まれているか確認
   - design-tokens.cssが最初に読み込まれているか確認

3. **モバイルで動作しない**
   - タッチイベントが適切に処理されているか確認
   - viewport metaタグが設定されているか確認

## 🚨 セキュリティ考慮事項

1. **ユーザー入力のサニタイゼーション**
   ```javascript
   // テキスト入力時は必ずエスケープ
   const sanitizeInput = (input) => {
     const div = document.createElement('div');
     div.textContent = input;
     return div.innerHTML;
   };
   ```

2. **URLパラメータの検証**
   ```javascript
   // 共有URLからデータを取得する際の検証
   const validateGridData = (data) => {
     return data && 
            Array.isArray(data.themes) && 
            data.themes.length <= 9;
   };
   ```

## 📚 参考リソース

- [プロジェクトREADME](./README.md) - プロジェクトの概要と基本的な使い方
- [デザインガイドライン](./design-guidelines.md) - 詳細なデザイン仕様
- [コンポーネントデモ](./examples/demo.html) - UIコンポーネントの実例

## 💡 開発のベストプラクティス

1. **ユーザーファースト**: 常にユーザー体験を最優先に考える
2. **モバイルファースト**: モバイルでの使いやすさを基準に設計
3. **アクセシビリティ**: キーボード操作、スクリーンリーダー対応を考慮
4. **プログレッシブエンハンスメント**: 基本機能は全環境で動作させる
5. **パフォーマンス**: 初回読み込み時間とインタラクションの応答性を重視

## 🤝 コラボレーションのヒント

- 既存のコードスタイルを尊重する
- 大きな変更の前にIssueで議論する
- コードレビューのフィードバックを積極的に取り入れる
- ドキュメントを最新の状態に保つ

---

このガイドラインは、GridMeプロジェクトの開発効率と品質を向上させるために作成されました。プロジェクトの成長に合わせて、定期的に更新してください。

最終更新日: 2025年6月12日