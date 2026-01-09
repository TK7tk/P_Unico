#!/bin/bash

# P_Unico自動Git同期スクリプト
# 変更があれば自動的にコミット&プッシュする

cd /mnt/c/Users/西田貴彦/Documents/Cursor/P_Unico || exit 1

# Gitの変更があるか確認
if [[ -n $(git status --porcelain) ]]; then
    # 変更がある場合
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 変更を検出しました"

    # 全ての変更をステージング
    git add .

    # タイムスタンプ付きでコミット
    git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"

    # プッシュ
    git push origin main

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] プッシュ完了"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 変更なし"
fi
