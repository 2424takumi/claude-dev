#!/bin/bash

# 自動同期スクリプト
# GitHubの変更を定期的にチェックして自動的にプルします

echo "🔄 GitHubとの自動同期を開始します..."
echo "Ctrl+C で停止できます"

# ブラウザでプレビューを開く
open index.html

while true; do
    # リモートの変更をフェッチ
    git fetch origin
    
    # ローカルとリモートの差分をチェック
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ $LOCAL != $REMOTE ]; then
        echo "📥 新しい変更を検出しました。更新中..."
        git pull origin main
        echo "✅ 更新完了！ブラウザをリロードしてください。"
        
        # macOSの場合、通知を表示
        osascript -e 'display notification "GitHubから新しい変更を取得しました" with title "GridMe 更新"'
    fi
    
    # 10秒待機
    sleep 10
done