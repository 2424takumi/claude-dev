# Google AdSense セットアップガイド

## 概要
このアプリケーションにGoogle AdSenseの広告バナーを実装しました。画面下部に固定表示されるバナー形式で表示されます。

## セットアップ手順

### 1. Google AdSenseアカウントの準備
1. [Google AdSense](https://www.google.com/adsense/)にアクセスしてアカウントを作成
2. サイトの審査を通過させる
3. 広告ユニットを作成

### 2. 設定の更新
`js/adsense.js`ファイルを開き、以下の値を実際の値に置き換えてください：

```javascript
const ADSENSE_CONFIG = {
    clientId: 'ca-pub-XXXXXXXXXX', // あなたのPublisher IDに置き換え
    adSlot: 'XXXXXXXXXX', // あなたのAd Unit IDに置き換え
    adFormat: 'auto',
    fullWidthResponsive: true
};
```

### 3. 実装の詳細

#### 追加されたファイル
- `js/adsense.js` - AdSense統合のメインJavaScriptファイル

#### 変更されたファイル
- `index.html` - AdSenseスクリプトの読み込みを追加
- `shared.html` - AdSenseスクリプトの読み込みを追加
- `styles/app.css` - AdSenseバナーのスタイルを追加

#### スタイルの特徴
- 画面下部に固定表示（`position: fixed`）
- レスポンシブ対応
- フッターとの重なりを防ぐため、フッターに下部マージンを追加
- 影付きで見やすく表示

### 4. テスト方法
1. ローカルサーバーでアプリケーションを起動
2. ブラウザの開発者ツールでコンソールを確認
3. AdSenseのエラーメッセージがないか確認
4. 広告が正しく表示されることを確認

### 5. 注意事項
- AdSenseのポリシーを必ず遵守してください
- 自分で広告をクリックしないでください
- 広告の配置がユーザー体験を損なわないよう注意してください
- モバイルデバイスでも適切に表示されることを確認してください

### 6. トラブルシューティング
- 広告が表示されない場合は、AdSenseアカウントが有効化されているか確認
- コンソールエラーを確認し、Publisher IDとAd Unit IDが正しいか確認
- サイトがAdSenseの審査を通過しているか確認