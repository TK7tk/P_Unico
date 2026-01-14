# Claude Code 完全ガイド
## プロジェクト構成・ヘッドレスモード・MCP・SDK

**作成日**: 2026-01-13
**対象者**: 文系ビジネスマン〜エンジニアまで

---

# 第1部：全体アーキテクチャ

## 1. Claude Codeの3層構造

Claude Codeは「**対話層**」「**自動化層**」「**拡張層**」の3層で構成されています。

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Claude Code アーキテクチャ                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  【第1層：対話層】ユーザーとの直接対話                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CLI (ターミナル)  ←→  CLAUDE.md (プロジェクトルール)         │   │
│  │       ↓                     ↓                              │   │
│  │  Commands (手動)      Skills (自動)    Subagents (並列)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                     │
│  【第2層：自動化層】非対話型・プログラマブル                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Headless Mode         Agent SDK           Hooks            │   │
│  │  (CI/CD向け)          (Python/TS)         (ライフサイクル)   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                     │
│  【第3層：拡張層】外部連携・パッケージ化                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │    MCP Servers            Plugins           GitHub Actions   │   │
│  │  (外部ツール連携)       (機能パッケージ)     (ワークフロー)    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. 構成要素の分類マトリクス

| 要素 | 呼び出し方 | 実行タイミング | 主な用途 | 会社で例えると |
|-----|----------|--------------|---------|--------------|
| **CLAUDE.md** | 自動読込 | セッション開始時 | プロジェクトルール定義 | 業務マニュアル |
| **settings.json** | 自動適用 | 常時 | 権限・設定管理 | 権限規定 |
| **Commands** | `/command` | ユーザー指示時 | 定型作業の自動化 | 「この書類を作って」 |
| **Skills** | 自動 | 会話内容に応じて | 専門知識の提供 | 必要時に参照する専門書 |
| **Subagents** | Task tool | Claudeが判断 | 並列・重い作業 | 別部署への依頼 |
| **Hooks** | 自動 | ライフサイクルイベント | 決定論的処理 | 自動チェックシステム |
| **Plugins** | インストール | 機能単位 | 機能パッケージ | 外部委託パッケージ |
| **MCP** | 設定後自動 | ツール呼び出し時 | 外部システム連携 | 取引先API |

---

## 3. 設定ファイルの階層と継承

```
┌─────────────────────────────────────────────────────────────────────┐
│  【設定の優先順位】下位が上位を上書き                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ~/.claude/CLAUDE.md              ← グローバル（全プロジェクト）  │
│       ↓ 継承                                                       │
│  2. ./CLAUDE.md                      ← プロジェクト（チーム共有）    │
│       ↓ 継承                                                       │
│  3. ./frontend/CLAUDE.md             ← サブディレクトリ              │
│       ↓ 上書き                                                     │
│  4. ./CLAUDE.local.md                ← 個人設定（Git除外）          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  【settings.json の階層】                                           │
│                                                                     │
│  ~/.claude/settings.json             ← ユーザー設定                 │
│       ↓                                                            │
│  .claude/settings.json               ← プロジェクト設定（チーム共有）│
│       ↓                                                            │
│  .claude/settings.local.json         ← 個人設定（Git除外）          │
│                                                                     │
│  ※ managed-settings.json は企業ポリシーとして上書き不可             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**権限チェック順序**: `deny` → `allow` → `ask`（denyが最優先）

---

## 4. Scripts と各構成要素の関係

Scriptsは Claude Code の各構成要素と**横断的に連携**する重要な要素です。

### Scripts の役割マップ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Scripts と Claude Code の関係図                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐                                                          │
│   │   scripts/  │ ←── プロジェクトのスクリプト格納フォルダ                   │
│   └──────┬──────┘                                                          │
│          │                                                                  │
│   ┌──────┴──────────────────────────────────────────────────────┐          │
│   │                                                              │          │
│   ▼                    ▼                    ▼                   ▼          │
│ ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐         │
│ │   Hooks    │   │   Skills   │   │  Commands  │   │  Headless  │         │
│ │ (自動実行) │   │ (バンドル) │   │ (動的挿入) │   │ (CI/CD)    │         │
│ └────────────┘   └────────────┘   └────────────┘   └────────────┘         │
│       │                │                │                │                 │
│       ▼                ▼                ▼                ▼                 │
│  PreToolUse       scripts/         $(!command)      claude -p             │
│  PostToolUse      フォルダ内の      でシェル出力を   でスクリプト           │
│  等で呼び出し     Python/Bash       プロンプトに     から呼び出し           │
│                                    埋め込み                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scripts の4つの利用パターン

| パターン | 連携先 | 実行タイミング | 用途例 |
|---------|-------|--------------|-------|
| **Hook Scripts** | Hooks | ライフサイクルイベント | Lint、テスト、セキュリティチェック |
| **Skill Scripts** | Skills | 必要時に呼び出し | データ処理、API呼び出し、変換処理 |
| **Command Scripts** | Commands | `$(!...)` で動的実行 | 環境情報取得、ファイル一覧生成 |
| **CI/CD Scripts** | Headless | 外部から起動 | 自動レビュー、マイグレーション |

---

### パターン1: Hook Scripts（決定論的処理）

Hooksから呼び出されるスクリプト。Claude Codeの動作を**確実に制御**する。

```
┌─────────────────────────────────────────────────────┐
│  Hook Scripts の流れ                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Claude Code                                        │
│      │                                              │
│      ▼ PreToolUse: Bash(git commit:*)               │
│  ┌───────────────────────────────┐                  │
│  │  ./scripts/pre-commit.sh     │                  │
│  │  ・Lint実行                   │                  │
│  │  ・テスト実行                 │                  │
│  │  ・exit 0 (許可) or 2 (拒否)  │                  │
│  └───────────────────────────────┘                  │
│      │                                              │
│      ▼ 結果に応じて続行 or ブロック                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**設定例（settings.json）:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "command": "./scripts/hooks/pre-commit.sh"
      },
      {
        "matcher": "Write(**/*.ts)",
        "command": "./scripts/hooks/lint-ts.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash(npm install:*)",
        "command": "./scripts/hooks/post-install.sh"
      }
    ],
    "Stop": [
      {
        "command": "./scripts/hooks/session-summary.sh"
      }
    ]
  }
}
```

**スクリプト例（scripts/hooks/pre-commit.sh）:**

```bash
#!/bin/bash
# 標準入力からJSON形式でセッション情報を受け取る

# Lint チェック
npm run lint --silent
if [ $? -ne 0 ]; then
    echo "❌ Lint failed. Please fix errors before committing." >&2
    exit 2  # ブロック
fi

# 型チェック
npm run type-check --silent
if [ $? -ne 0 ]; then
    echo "❌ Type check failed." >&2
    exit 2  # ブロック
fi

# テスト
npm run test --silent
if [ $? -ne 0 ]; then
    echo "❌ Tests failed." >&2
    exit 2  # ブロック
fi

echo "✅ All checks passed."
exit 0  # 許可
```

---

### パターン2: Skill Scripts（専門処理のバンドル）

Skillsに同梱するスクリプト。専門知識と一緒に**実行可能なツール**を提供。

```
┌─────────────────────────────────────────────────────┐
│  Skill Scripts の構造                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  .claude/skills/data-analysis/                      │
│  ├── SKILL.md           ← スキル定義（プロンプト）   │
│  ├── scripts/           ← 実行可能スクリプト        │
│  │   ├── analyze.py     ← データ分析処理           │
│  │   ├── visualize.py   ← グラフ生成               │
│  │   └── export.sh      ← エクスポート処理          │
│  ├── references/        ← 参照ドキュメント          │
│  │   └── analysis-guide.md                         │
│  └── assets/            ← テンプレート等            │
│      └── report-template.html                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**SKILL.md 例:**

```markdown
---
name: data-analysis
description: データ分析と可視化を行う
triggers:
  - データ分析
  - CSV
  - グラフ
  - 統計
---

# データ分析スキル

このスキルはデータ分析タスクで自動的に適用されます。

## 利用可能なスクリプト

以下のスクリプトを使用してデータ処理を行います：

- `scripts/analyze.py` - 統計分析を実行
- `scripts/visualize.py` - グラフを生成
- `scripts/export.sh` - 結果をエクスポート

## 使用例

```bash
python scripts/analyze.py --input data.csv --output report.json
python scripts/visualize.py --data report.json --chart bar
```
```

---

### パターン3: Command Scripts（動的コンテンツ）

Commandsのプロンプト内で `$(!command)` を使い、**シェル出力を動的に挿入**。

```
┌─────────────────────────────────────────────────────┐
│  Command Scripts の動的挿入                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  .claude/commands/status.md                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ # プロジェクト状況                           │   │
│  │                                             │   │
│  │ ## Git状態                                  │   │
│  │ $(! git status --short)      ← 動的実行     │   │
│  │                                             │   │
│  │ ## 最近のコミット                            │   │
│  │ $(! git log --oneline -5)    ← 動的実行     │   │
│  │                                             │   │
│  │ ## 環境情報                                  │   │
│  │ $(! ./scripts/env-info.sh)   ← スクリプト   │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│           │                                        │
│           ▼ /project:status 実行時                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ # プロジェクト状況                           │   │
│  │                                             │   │
│  │ ## Git状態                                  │   │
│  │ M  src/index.ts              ← 結果が挿入   │   │
│  │ A  src/new-file.ts                          │   │
│  │                                             │   │
│  │ ## 最近のコミット                            │   │
│  │ abc1234 Fix bug                             │   │
│  │ def5678 Add feature                         │   │
│  │ ...                                         │   │
│  │                                             │   │
│  │ ## 環境情報                                  │   │
│  │ Node: v20.10.0                              │   │
│  │ npm: 10.2.0                                 │   │
│  │ ...                                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Command 例（.claude/commands/deploy-check.md）:**

```markdown
---
name: deploy-check
description: デプロイ前のチェックを実行
---

# デプロイ前チェック

## 現在のブランチ
$(! git branch --show-current)

## 未コミットの変更
$(! git status --porcelain)

## 依存関係の脆弱性
$(! npm audit --json | jq '.metadata.vulnerabilities')

## ビルドテスト
$(! npm run build 2>&1 | tail -10)

## 環境変数チェック
$(! ./scripts/check-env.sh)

上記の情報を確認して、デプロイ可能か判断してください。
```

---

### パターン4: CI/CD Scripts（Headless連携）

CI/CDパイプラインから Claude Code を呼び出すスクリプト。

```
┌─────────────────────────────────────────────────────┐
│  CI/CD Scripts の連携                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  GitHub Actions / Jenkins / etc.                    │
│           │                                         │
│           ▼                                         │
│  ┌───────────────────────────────┐                  │
│  │  ./scripts/ci/review.sh      │                  │
│  │                              │                  │
│  │  claude -p "PRをレビュー" \   │                  │
│  │    --allowedTools Read,Grep  │                  │
│  │    --output-format json      │                  │
│  └───────────────────────────────┘                  │
│           │                                         │
│           ▼                                         │
│  ┌───────────────────────────────┐                  │
│  │  review-result.json          │ → PRコメント投稿  │
│  └───────────────────────────────┘                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**スクリプト例（scripts/ci/review.sh）:**

```bash
#!/bin/bash
# PRレビュー自動化スクリプト

PR_NUMBER=$1

# PR差分を取得してClaude Codeでレビュー
gh pr diff "$PR_NUMBER" | claude -p "
このPRの変更をレビューしてください。
以下の観点でチェック：
1. セキュリティ脆弱性
2. パフォーマンス問題
3. コーディング規約違反
4. テスト不足

JSON形式で出力してください。
" \
  --allowedTools Read,Grep,Glob \
  --output-format json \
  > /tmp/review-result.json

# 結果をPRにコメント
cat /tmp/review-result.json | jq -r '.summary' | \
  gh pr comment "$PR_NUMBER" --body-file -
```

**GitHub Actions連携（.github/workflows/claude-review.yml）:**

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Claude Review
        run: ./scripts/ci/review.sh ${{ github.event.pull_request.number }}
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### 推奨フォルダ構成（Scripts含む）

```
your-project/
├── .claude/
│   ├── settings.json
│   ├── commands/
│   │   └── deploy-check.md        ← $(!...) でスクリプト呼び出し
│   ├── skills/
│   │   └── data-analysis/
│   │       ├── SKILL.md
│   │       └── scripts/           ← スキル専用スクリプト
│   │           ├── analyze.py
│   │           └── visualize.py
│   └── agents/
├── scripts/                        ← プロジェクト共通スクリプト
│   ├── hooks/                      ← Hooks用スクリプト
│   │   ├── pre-commit.sh
│   │   ├── lint-check.sh
│   │   └── post-install.sh
│   ├── ci/                         ← CI/CD用スクリプト
│   │   ├── review.sh
│   │   ├── security-scan.sh
│   │   └── deploy.sh
│   └── utils/                      ← ユーティリティスクリプト
│       ├── env-info.sh
│       └── check-dependencies.sh
├── CLAUDE.md
└── src/
```

---

### Scripts 利用時の注意事項

| 観点 | 注意点 |
|-----|-------|
| **セキュリティ** | Hooksスクリプトは現在の環境の認証情報で実行される。悪意あるコードに注意 |
| **実行権限** | スクリプトに実行権限を付与: `chmod +x scripts/*.sh` |
| **パス** | 相対パスは`.claude/`やプロジェクトルートからの相対パス |
| **エラーハンドリング** | Hookスクリプトの終了コード: 0=許可, 2=ブロック, その他=エラー |
| **入出力** | HooksはJSONを標準入力で受け取り、標準エラーにメッセージを出力 |

---

# 第2部：対話層の詳細

## 5. CLAUDE.md の設計指針

### 推奨構成（100〜200行以内）

```markdown
# プロジェクト概要
[1-2文でプロジェクトを説明]

## 技術スタック
- フレームワーク: [例: Next.js 14]
- 言語: [例: TypeScript]
- DB: [例: PostgreSQL]

## 開発コマンド
npm run dev    # 開発サーバー
npm run build  # ビルド
npm run test   # テスト

## アーキテクチャ
[フォルダ構造と責務を簡潔に]

## コーディング規約
[プロジェクト固有のルールのみ]

## 参照ドキュメント
詳細は @docs/api.md を参照
```

### アンチパターン

❌ 一般的なベストプラクティスの列挙（Claudeは知っている）
❌ 全ファイルの詳細説明（探索できる）
❌ 200行を超える長文（コンテキストを圧迫）

---

## 6. settings.json 権限設定

### 基本構造

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep",
      "Bash(npm:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(git commit:*)",
      "Bash(docker:*)"
    ],
    "deny": [
      "Read(**/.env)",
      "Read(**/.env.*)",
      "Read(**/*.pem)",
      "Read(**/*.key)",
      "Bash(sudo:*)",
      "Bash(rm -rf:*)",
      "Bash(curl:*)",
      "Bash(wget:*)"
    ]
  },
  "additionalDirectories": [
    "/path/to/shared/libs"
  ]
}
```

### パターンマッチング構文

| パターン | 意味 | 例 |
|---------|------|-----|
| `Tool` | ツール全体を許可/拒否 | `Read` |
| `Tool(exact)` | 完全一致 | `Bash(npm run lint)` |
| `Tool(prefix:*)` | 前方一致 | `Bash(npm run:*)` |
| `Tool(**/pattern)` | gitignore形式 | `Read(**/.env)` |

---

## 7. Commands・Skills・Subagents の使い分け

### 判断フローチャート

```
開始
  │
  ├─ ユーザーが明示的に実行したい？
  │    ├─ YES → Commands（/コマンド名）
  │    └─ NO ↓
  │
  ├─ 専門知識の適用が必要？
  │    ├─ YES → Skills（自動発動）
  │    └─ NO ↓
  │
  ├─ 重い処理 or 並列実行が必要？
  │    ├─ YES → Subagents（Task tool）
  │    └─ NO → 通常の会話で対応
```

### ファイル配置

```
.claude/
├── commands/           ← /project:コマンド名 で呼び出し
│   ├── deploy.md
│   └── test-all.md
├── skills/             ← 自動発動
│   └── api-design/
│       └── SKILL.md
└── agents/             ← Task tool経由
    ├── code-reviewer.md
    └── security-checker.md
```

### Command テンプレート

```markdown
---
name: fix-issue
description: GitHub Issueを修正する
---

# Issue修正プロセス

引数: $ARGUMENTS (Issue番号)

1. Issue #$ARGUMENTS の内容を確認
2. 関連コードを特定
3. 修正を実装
4. テストを実行
5. コミット作成
```

### Skill テンプレート

```markdown
---
name: react-patterns
description: Reactのベストプラクティス
triggers:
  - React
  - コンポーネント
  - hooks
---

# React開発ガイドライン

## コンポーネント設計
- 1コンポーネント1責任
- Props型は必ず定義
...
```

### Subagent テンプレート

```markdown
---
name: security-checker
description: セキュリティ脆弱性をチェック
tools:
  - Read
  - Grep
  - Glob
model: sonnet
---

セキュリティエンジニアとして以下をチェック：
1. SQLインジェクション
2. XSS
3. 認証・認可の問題
4. 機密情報の露出
```

---

# 第3部：自動化層（Headless Mode・SDK・Hooks）

## 8. Headless Mode

### 概要

Headless Modeは**非対話型**でClaude Codeを実行する方式です。CI/CD、プリコミットフック、バッチ処理に最適。

### 基本コマンド

```bash
# 基本形式
claude -p "プロンプト" [オプション]

# JSONストリーム出力（CI向け）
claude -p "コードレビューを実行" --output-format stream-json

# 許可ツールを制限
claude -p "セキュリティレビュー" \
  --allowedTools Read,Grep,Glob \
  --max-turns 5

# システムプロンプト追加
claude -p "PRをレビュー" \
  --append-system-prompt "セキュリティ観点で厳しくレビュー"

# セッション継続
claude --continue                    # 最新セッション
claude --resume <session-id>         # 特定セッション
```

### 主要オプション一覧

| オプション | 説明 |
|-----------|------|
| `-p "prompt"` | ヘッドレスモード有効化 + プロンプト指定 |
| `--output-format json` | JSON出力 |
| `--output-format stream-json` | ストリーミングJSON |
| `--allowedTools Tool1,Tool2` | 許可ツール制限 |
| `--max-turns N` | 最大ターン数 |
| `--append-system-prompt` | システムプロンプト追加 |
| `--continue` | 最新セッション継続 |
| `--resume <id>` | 特定セッション継続 |
| `--verbose` | デバッグ出力 |

### CI/CD パターン

```bash
# PRレビュー（GitHub Actions）
gh pr diff "$PR_NUMBER" | claude -p \
  "このPRの変更をレビュー。セキュリティとパフォーマンスに注目。" \
  --output-format json > review.json

# 大量ファイル処理（ファンアウトパターン）
for file in $(find src -name "*.ts"); do
  claude -p "Migrate $file from v1 to v2 API" \
    --allowedTools Read,Edit \
    --max-turns 3
done
```

---

## 9. Agent SDK（Python/TypeScript）

### 概要

Agent SDKは、Claude Codeと**同じ機能**をプログラムから利用するためのライブラリです。

```
┌─────────────────────────────────────────────────────────────────────┐
│  Claude Code CLI  ──────────────→  ターミナルでの対話               │
│       ↓ 同じ機能                                                   │
│  Agent SDK        ──────────────→  Python/TypeScript アプリ        │
└─────────────────────────────────────────────────────────────────────┘
```

### Python SDK

```bash
pip install claude-agent-sdk
```

```python
from claude_agent_sdk import ClaudeSDKClient

# クライアント初期化
client = ClaudeSDKClient(
    api_key="your-key",
    allowed_tools=["Read", "Write", "Bash"]
)

# クエリ実行（ストリーミング）
async for message in client.query("このコードをリファクタリングして"):
    print(message)
```

### TypeScript SDK

```bash
npm install @anthropic-ai/claude-agent-sdk
```

```typescript
import { ClaudeAgent } from '@anthropic-ai/claude-agent-sdk';

const agent = new ClaudeAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  allowedTools: ['Read', 'Write', 'Bash']
});

// クエリ実行
for await (const message of agent.query("テストを追加して")) {
  console.log(message);
}
```

### SDKの主要機能

| 機能 | 説明 |
|-----|------|
| `query()` | メインのエージェントループ |
| `allowed_tools` | 使用可能ツールの制限 |
| `session_id` | セッション管理・継続 |
| `model` | 使用モデル指定 |
| `max_turns` | 最大ターン数 |
| `system_prompt` | カスタムシステムプロンプト |

---

## 10. Hooks（ライフサイクルフック）

### 概要

Hooksは、Claude Codeの**特定のタイミング**で自動実行されるシェルコマンドです。

### フックイベント一覧

| イベント | タイミング | 用途例 |
|---------|----------|-------|
| `PreToolUse` | ツール実行前 | 実行可否の判断 |
| `PostToolUse` | ツール実行後 | 結果の検証・ログ |
| `UserPromptSubmit` | ユーザー入力時 | 入力の前処理 |
| `PermissionRequest` | 権限要求時 | カスタム承認ロジック |
| `Stop` | エージェント終了時 | クリーンアップ |
| `SubagentStop` | サブエージェント終了時 | 結果の集約 |
| `SessionEnd` | セッション終了時 | レポート生成 |

### 設定例（settings.json）

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "command": "./scripts/pre-commit-check.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "npm run lint --fix"
      }
    ],
    "Stop": [
      {
        "command": "./scripts/generate-summary.sh"
      }
    ]
  }
}
```

### 終了コードの意味

| 終了コード | 意味 |
|-----------|------|
| `0` | 成功・許可 |
| `2` | ブロック（PreToolUseのみ） |
| その他 | エラー（ユーザーに表示） |

### 実用例：Gitコミット前チェック

```bash
#!/bin/bash
# scripts/pre-commit-check.sh

# Lint実行
npm run lint
if [ $? -ne 0 ]; then
  echo "Lint failed. Commit blocked." >&2
  exit 2  # ブロック
fi

# テスト実行
npm run test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit blocked." >&2
  exit 2  # ブロック
fi

exit 0  # 許可
```

---

# 第4部：拡張層（MCP・Plugins）

## 11. MCP（Model Context Protocol）

### 概要

MCPは、Claude Codeを**外部ツール・データソース**に接続するオープン標準プロトコルです。

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MCP アーキテクチャ                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Claude Code  ←→  MCP Protocol  ←→  MCP Server  ←→  外部サービス  │
│                                                                     │
│   例：                                                              │
│   ・GitHub MCP → Issue/PR管理                                       │
│   ・Notion MCP → ドキュメント操作                                    │
│   ・Sentry MCP → エラー監視                                         │
│   ・PostgreSQL MCP → データベースクエリ                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 設定ファイルの配置

| ファイル | スコープ | Git管理 |
|---------|--------|---------|
| `.mcp.json` | プロジェクト | ○ |
| `.claude/settings.local.json` | プロジェクト（個人） | × |
| `~/.claude/settings.local.json` | ユーザー | × |

### CLI コマンド

```bash
# サーバー追加
claude mcp add <name> --scope user
claude mcp add --transport http notion https://mcp.notion.com/mcp

# サーバー一覧
claude mcp list

# サーバー削除
claude mcp remove <name>

# サーバーテスト
claude mcp get <name>
```

### 設定形式（.mcp.json）

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "notion": {
      "transport": "http",
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

### トランスポートタイプ

| タイプ | 用途 | 例 |
|-------|------|-----|
| `stdio` | ローカルプロセス | npx起動のサーバー |
| `http` | リモートサーバー | クラウドサービス |
| `sse` | Server-Sent Events | リアルタイム更新 |

### 人気のMCPサーバー

| サーバー | 用途 |
|---------|------|
| GitHub | Issue/PR管理、コードレビュー |
| Notion | ドキュメント操作 |
| Sentry | エラー監視・分析 |
| PostgreSQL | データベースクエリ |
| Figma | デザイン連携 |
| Context7 | リアルタイムドキュメント |
| Sequential Thinking | 複雑なタスク分解 |

### セキュリティ注意事項

⚠️ **MCPサーバーはAnthropicが検証していません**
- 信頼できるソースのみ使用
- 外部コンテンツを取得するサーバーはプロンプトインジェクションリスクあり
- 機密情報を扱う場合は特に注意

---

## 12. Plugins

### 概要

Pluginsは、Commands・Skills・Subagents・Hooks・MCPを**パッケージ化**して共有する仕組みです。2025年10月にパブリックベータ開始。

```
┌─────────────────────────────────────────────────────────────────────┐
│  Plugin = Commands + Skills + Agents + Hooks + MCP のパッケージ      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  my-plugin/                                                         │
│  ├── commands/       ← スラッシュコマンド                            │
│  ├── skills/         ← 専門知識                                     │
│  ├── agents/         ← サブエージェント                              │
│  ├── hooks/          ← ライフサイクルフック                          │
│  ├── mcp/            ← MCPサーバー設定                               │
│  └── plugin.json     ← プラグインメタデータ                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### インストール方法

```bash
# CLI からインストール
/plugin add <plugin-name>

# 有効化/無効化
/plugin enable <plugin-name>
/plugin disable <plugin-name>

# 一覧表示
/plugin list
```

### コミュニティレジストリ

- **公式**: `/plugin` コマンドで検索
- **コミュニティ**: [claude-plugins.dev](https://claude-plugins.dev/)

### 人気のプラグイン

| プラグイン | 用途 |
|-----------|------|
| Feature Development | 機能開発ワークフロー |
| PR Review | 自動コードレビュー |
| Backend API Design | API設計支援 |
| Security Audit | セキュリティ監査 |

---

# 第5部：実践ガイド

## 13. 推奨プロジェクト構成

```
your-project/
├── .claude/                        # Claude Code設定
│   ├── settings.json              # [Git管理] チーム権限設定
│   ├── settings.local.json        # [Git除外] 個人設定
│   ├── commands/                  # [Git管理] チームコマンド
│   │   ├── deploy.md
│   │   └── test-all.md
│   ├── skills/                    # [Git管理] チームスキル
│   │   └── api-design/
│   │       └── SKILL.md
│   └── agents/                    # [Git管理] チームエージェント
│       └── code-reviewer.md
├── .mcp.json                      # [Git管理] MCP設定
├── CLAUDE.md                      # [Git管理] プロジェクトルール
├── CLAUDE.local.md                # [Git除外] 個人ルール
├── .gitignore                     # Git除外設定
├── .github/
│   └── workflows/
│       └── claude-review.yml      # GitHub Actions連携
└── src/
```

### 必須 .gitignore

```gitignore
# Claude Code 個人設定
.claude/settings.local.json
CLAUDE.local.md

# 機密情報
.env
.env.*
*.pem
*.key
credentials.json
```

---

## 14. GitHub Actions 連携

### PR自動レビュー

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Claude Code Review
        run: |
          gh pr diff ${{ github.event.pull_request.number }} | \
          claude -p "このPRをレビューしてください" \
            --output-format json \
            --allowedTools Read,Grep,Glob \
            > review.json
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Post Review Comment
        run: |
          # review.jsonからコメントを生成してPRに投稿
          cat review.json | jq -r '.review' | \
          gh pr comment ${{ github.event.pull_request.number }} --body-file -
```

### セキュリティスキャン

```yaml
name: Security Scan

on:
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Security Analysis
        run: |
          claude -p "セキュリティ脆弱性をスキャン" \
            --allowedTools Read,Grep,Glob \
            --append-system-prompt "OWASP Top 10に基づいてチェック" \
            --output-format json > security-report.json
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## 15. セキュリティベストプラクティス

### 権限の最小化原則

```
┌─────────────────────────────────────────────────────────────────────┐
│  権限設定のベストプラクティス                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  【deny（必須）】                                                    │
│  ✗ .env ファイル読み取り    → Read(**/.env), Read(**/.env.*)       │
│  ✗ 秘密鍵ファイル           → Read(**/*.pem), Read(**/*.key)       │
│  ✗ sudo 実行               → Bash(sudo:*)                          │
│  ✗ 危険な削除               → Bash(rm -rf:*)                       │
│  ✗ 外部通信                 → Bash(curl:*), Bash(wget:*)           │
│                                                                     │
│  【ask（推奨）】                                                    │
│  △ git push                → Bash(git push:*)                      │
│  △ git commit              → Bash(git commit:*)                    │
│  △ docker 操作             → Bash(docker:*)                        │
│  △ npm publish             → Bash(npm publish:*)                   │
│                                                                     │
│  【allow（安全）】                                                   │
│  ○ ファイル読み書き         → Read, Write, Edit                     │
│  ○ 検索                    → Glob, Grep                            │
│  ○ 参照系git               → Bash(git status:*), Bash(git diff:*)  │
│  ○ 開発コマンド             → Bash(npm run:*), Bash(pnpm:*)        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### CI/CD での権限制限

```bash
# 読み取り専用モード（レビュー用）
claude -p "コードレビュー" \
  --allowedTools Read,Grep,Glob

# 書き込み許可（マイグレーション用）
claude -p "v2 APIにマイグレーション" \
  --allowedTools Read,Write,Edit,Bash

# 本番昇格は慎重に
# ✓ 数ヶ月の安定運用後に書き込み権限を付与
# ✓ 段階的に権限を拡大
```

---

## 16. トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|-----|------|-------|
| 権限エラーが出る | settings.json の設定ミス | denyルールを確認 |
| MCPサーバー接続失敗 | 環境変数未設定 | `.env` に API キー設定 |
| Subagentが動かない | ツール制限 | `tools:` で必要なツールを許可 |
| コンテキスト超過 | CLAUDE.md が長すぎ | 100-200行に圧縮 |
| Hookが実行されない | matcher パターンミス | 正確なパターンを確認 |

### デバッグモード

```bash
# 詳細ログ出力
claude -p "タスク" --verbose

# セッション情報確認
claude /sessions

# 設定確認
claude /settings
```

---

## 参考リンク

### 公式ドキュメント
- [Claude Code Docs](https://code.claude.com/docs)
- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [MCP公式](https://modelcontextprotocol.io/)

### Headless Mode / SDK
- [Headless Mode 公式](https://code.claude.com/docs/en/headless)
- [Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Agent SDK Python](https://github.com/anthropics/claude-agent-sdk-python)
- [Agent SDK TypeScript](https://github.com/anthropics/claude-agent-sdk-typescript)

### MCP
- [MCP 公式ドキュメント](https://code.claude.com/docs/en/mcp)
- [MCP Server Setup Guide](https://mcpcat.io/guides/adding-an-mcp-server-to-claude-code/)
- [Context7 MCP](https://github.com/upstash/context7)

### Hooks / Plugins / Scripts
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Plugins 公式ブログ](https://claude.com/blog/claude-code-plugins)
- [Claude Plugins Registry](https://claude-plugins.dev/)
- [Claude Code and Bash Scripts](https://stevekinney.com/courses/ai-development/claude-code-and-bash-scripts)
- [Hooks Workflow Automation](https://www.gend.co/blog/configure-claude-code-hooks-automation)

### ベストプラクティス
- [Claude Code Best Practices (Anthropic)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Security Best Practices](https://www.backslash.security/blog/claude-code-security-best-practices)
- [Permissions Guide](https://www.eesel.ai/blog/claude-code-permissions)

---

*作成日: 2026-01-13 | 最終更新: 2026-01-13*
