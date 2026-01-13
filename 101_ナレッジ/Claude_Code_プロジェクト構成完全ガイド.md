# Claude Code プロジェクト構成 完全ガイド
## GitHub管理を前提とした設計

**作成日**: 2026-01-12
**対象者**: 文系ビジネスマン〜エンジニアまで

---

# 第1部：全体像を理解する

## 1. Claude Codeを「会社」に例えると

Claude Codeの構成を理解するために、**会社組織**に例えて説明します。

| Claude Code の概念 | 会社に例えると | 役割 |
|-------------------|--------------|------|
| **グローバル設定** (`~/.claude/`) | 本社のルール | 全社員・全部署に適用される規則 |
| **プロジェクト設定** (`.claude/`) | 部署のルール | その部署だけに適用される規則 |
| **CLAUDE.md** | 業務マニュアル | 「どう仕事をするか」の指針 |
| **settings.json** | 権限規定 | 「何ができて、何ができないか」 |
| **Commands** | 定型業務の手順書 | 「この書類を出して」と言われたらやること |
| **Skills** | 専門知識データベース | 必要な時に自動で参照される知識 |
| **Subagents** | 派遣される専門家 | 特定の仕事を任せる独立したスタッフ |
| **Plugins** | 外部委託パッケージ | 専門機能をまとめた外部サービス |

---

## 2. 構成要素の親子関係と独立関係

### 親子関係（階層構造）を持つもの

```
┌─────────────────────────────────────────────────────────────┐
│  【階層構造】上位が下位に影響を与える                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ~/.claude/CLAUDE.md        ← 全プロジェクトに適用（本社方針）  │
│       ↓ 継承                                                │
│  ./CLAUDE.md                ← プロジェクトに適用（部署方針）    │
│       ↓ 継承                                                │
│  ./frontend/CLAUDE.md       ← サブディレクトリに適用（課の方針）│
│       ↓ 上書き                                               │
│  ./CLAUDE.local.md          ← 個人設定（個人の好み）           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  settings.json も同様の階層構造                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ~/.claude/settings.json     ← 全プロジェクト共通設定         │
│       ↓                                                     │
│  .claude/settings.json       ← プロジェクト設定（チーム共有）  │
│       ↓                                                     │
│  .claude/settings.local.json ← 個人設定（Git非管理）          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 独立関係を持つもの

```
┌─────────────────────────────────────────────────────────────┐
│  【独立構造】それぞれが独立して機能する                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │ Commands  │  │  Skills   │  │ Subagents │               │
│  │ (手動)    │  │ (自動)    │  │ (独立)    │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        │              │              │                      │
│        └──────────────┴──────────────┘                      │
│                       ↓                                     │
│              【連携可能】                                    │
│        Subagentsは Skills や Commands を                    │
│        利用することができる                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Plugins = 上記すべてをパッケージ化したもの                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  my-plugin/                                                 │
│  ├── commands/    ← Commands を含む                         │
│  ├── skills/      ← Skills を含む                           │
│  ├── agents/      ← Subagents を含む                        │
│  └── hooks/       ← 自動処理を含む                           │
│                                                             │
│  → Pluginsは「機能セット」として独立                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 各構成要素の違いと使い分け

### 一覧表

| 要素 | 呼び出し方 | 用途 | 会社で例えると |
|-----|----------|------|--------------|
| **Commands** | `/command名` で手動 | 繰り返し作業の自動化 | 「この書類を作って」という依頼 |
| **Skills** | 会話内容から自動 | 専門知識の提供 | 必要な時に開く業務マニュアル |
| **Subagents** | Claudeが自動判断 | 独立した重い作業 | 別部署に仕事を依頼する |

### 詳細な使い分け

```
【Commands を使う場面】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 毎回同じ手順で実行したい作業
✓ 「/deploy」「/test」のように明示的に実行
✓ 短時間で完了する単発タスク

例: /fix-issue 1234  → GitHub Issue #1234を修正

【Skills を使う場面】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 特定の技術や知識が必要な時に自動適用
✓ 複数のプロジェクトで再利用したい知識
✓ 会話の文脈で自動的に呼び出される

例: 「Docker」と言うとDocker専門知識が自動で適用

【Subagents を使う場面】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 時間のかかる独立した作業
✓ メインの会話を邪魔したくない重い処理
✓ 並列で複数の作業を同時実行

例: 大量のファイルを分析しながら別の作業を進める
```

---

# 第2部：推奨フォルダ構成

## 4. GitHub管理を前提とした推奨構成

### グローバル設定（個人のPC内 - Git管理外）

```
~/.claude/                          ← あなたのPC全体に適用
├── CLAUDE.md                       ← 全プロジェクト共通のルール
├── settings.json                   ← 全プロジェクト共通の権限設定
├── commands/                       ← 個人用コマンド
│   ├── my-shortcuts.md
│   └── daily-standup.md
├── skills/                         ← 個人用スキル
│   └── my-coding-style/
│       └── SKILL.md
└── agents/                         ← 個人用エージェント
    └── my-reviewer.md
```

### プロジェクト設定（Git管理対象）

```
your-project/                       ← プロジェクトルート
├── .claude/                        ← Claude Code設定フォルダ
│   ├── settings.json              ← [Git管理] チーム共有の権限設定
│   ├── settings.local.json        ← [Git除外] 個人の権限設定
│   ├── commands/                  ← [Git管理] プロジェクト用コマンド
│   │   ├── deploy.md              ← /project:deploy で呼び出し
│   │   ├── test.md                ← /project:test で呼び出し
│   │   └── fix-issue.md           ← /project:fix-issue で呼び出し
│   ├── skills/                    ← [Git管理] プロジェクト用スキル
│   │   ├── api-design/
│   │   │   └── SKILL.md           ← API設計の専門知識
│   │   └── testing-patterns/
│   │       └── SKILL.md           ← テストパターンの知識
│   └── agents/                    ← [Git管理] プロジェクト用エージェント
│       ├── code-reviewer.md       ← コードレビュー専門
│       └── security-checker.md    ← セキュリティチェック専門
├── CLAUDE.md                      ← [Git管理] プロジェクトの主要ルール
├── CLAUDE.local.md                ← [Git除外] 個人用の追加ルール
├── .mcp.json                      ← [Git管理] MCP外部連携設定
├── .gitignore                     ← Git除外設定
└── src/                           ← ソースコード
```

---

## 5. Git管理の方針

### 管理対象の判断基準

```
┌─────────────────────────────────────────────────────────────┐
│  【Git管理する】= チームで共有すべきもの                       │
├─────────────────────────────────────────────────────────────┤
│  ✓ .claude/settings.json     - チームの権限ルール             │
│  ✓ .claude/commands/         - チーム共通コマンド             │
│  ✓ .claude/skills/           - チーム共通の専門知識           │
│  ✓ .claude/agents/           - チーム共通エージェント          │
│  ✓ CLAUDE.md                 - プロジェクトのルール            │
│  ✓ .mcp.json                 - 外部連携設定                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  【Git管理しない】= 個人設定・機密情報                         │
├─────────────────────────────────────────────────────────────┤
│  ✗ .claude/settings.local.json - 個人の権限設定               │
│  ✗ CLAUDE.local.md             - 個人のルール追加             │
│  ✗ ~/.claude/ 配下全て          - グローバル設定               │
│  ✗ .env ファイル                - 機密情報                    │
└─────────────────────────────────────────────────────────────┘
```

### 必須の .gitignore 設定

```gitignore
# Claude Code - 個人設定（チームに共有しない）
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

## 6. 各ファイルの書き方テンプレート

### CLAUDE.md（プロジェクトルール）

```markdown
# プロジェクト概要

このプロジェクトは〇〇のためのWebアプリケーションです。

## コーディング規約

- TypeScriptを使用
- 関数名はcamelCase
- コメントは日本語

## フォルダ構造

- src/: ソースコード
- tests/: テストコード
- docs/: ドキュメント

## 開発フロー

1. featureブランチを作成
2. 実装・テスト
3. PRを作成
4. レビュー後マージ

## よく使うコマンド

- npm run dev: 開発サーバー起動
- npm run test: テスト実行
- npm run build: ビルド
```

**ポイント**: 100〜200行以内に収める。詳細はdocs/フォルダに分離。

### settings.json（権限設定）

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
      "Bash(git:*)",
      "Bash(pnpm:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(docker:*)"
    ],
    "deny": [
      "Read(**/.env)",
      "Read(**/*.pem)",
      "Bash(sudo:*)",
      "Bash(rm -rf:*)",
      "Bash(curl:*)",
      "Bash(wget:*)"
    ]
  }
}
```

**ルール適用順序**: deny → allow → ask（denyが最優先）

### Command ファイル例 (.claude/commands/deploy.md)

```markdown
---
name: deploy
description: 本番環境へのデプロイを実行
---

# デプロイ手順

以下の手順でデプロイを実行してください：

1. テストを実行して全てパスすることを確認
2. ビルドを実行
3. デプロイスクリプトを実行

引数: $ARGUMENTS

## 注意事項
- mainブランチからのみデプロイ可能
- デプロイ前に必ずチームに連絡
```

### Skill ファイル例 (.claude/skills/api-design/SKILL.md)

```markdown
---
name: api-design
description: REST API設計のベストプラクティス
triggers:
  - API
  - REST
  - エンドポイント
---

# API設計ガイドライン

## 命名規則
- リソース名は複数形（users, products）
- ケバブケースを使用（user-profiles）

## HTTPメソッド
- GET: 取得
- POST: 作成
- PUT: 全体更新
- PATCH: 部分更新
- DELETE: 削除

## レスポンス形式
- 成功: { data: ... }
- エラー: { error: { code, message } }
```

### Subagent ファイル例 (.claude/agents/code-reviewer.md)

```markdown
---
name: code-reviewer
description: コードレビューを実行する専門エージェント
tools:
  - Read
  - Grep
  - Glob
model: sonnet
---

あなたはシニアエンジニアとしてコードレビューを行います。

## レビュー観点

1. **可読性**: 変数名は適切か、コメントは十分か
2. **保守性**: 将来の変更に対応しやすいか
3. **セキュリティ**: 脆弱性はないか
4. **パフォーマンス**: 非効率な処理はないか

## 出力形式

各ファイルについて以下を報告：
- 問題点（深刻度: 高/中/低）
- 改善提案
- 良い点
```

---

# 第3部：運用ガイド

## 7. チーム運用のベストプラクティス

### プロジェクト開始時のセットアップ

```bash
# 1. プロジェクトディレクトリ作成
mkdir my-project && cd my-project

# 2. Git初期化
git init

# 3. Claude Code構成フォルダ作成
mkdir -p .claude/{commands,skills,agents}

# 4. 基本ファイル作成
touch CLAUDE.md
touch .claude/settings.json
touch .mcp.json

# 5. .gitignore設定
cat << 'EOF' >> .gitignore
# Claude Code個人設定
.claude/settings.local.json
CLAUDE.local.md

# 機密情報
.env
.env.*
EOF

# 6. 初期コミット
git add .
git commit -m "Initial Claude Code setup"
```

### GitHub Actionsとの連携

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
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          task: "このPRの変更をレビューしてください"
```

---

## 8. セキュリティガイドライン

### 最小権限の原則

```
┌─────────────────────────────────────────────────────────────┐
│  Claude Codeへの権限は「必要最小限」に                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【絶対にdenyすべき】                                        │
│  ✗ .env ファイルの読み取り                                   │
│  ✗ sudo コマンドの実行                                       │
│  ✗ 外部への通信（curl, wget）                                │
│  ✗ SSH接続                                                  │
│                                                             │
│  【askにすべき（確認後許可）】                                 │
│  △ git push（意図しないプッシュ防止）                         │
│  △ docker run（コンテナ起動）                                 │
│  △ npm publish（パッケージ公開）                              │
│                                                             │
│  【allowで良い】                                              │
│  ○ ファイルの読み書き編集                                     │
│  ○ git status, git diff などの参照系                         │
│  ○ npm install, npm run などの開発系                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. よくある質問（FAQ）

### Q1: グローバル設定とプロジェクト設定が矛盾したらどうなる？

**A**: より具体的な設定（プロジェクト）が優先されます。

```
グローバル: 「コメントは英語で」
プロジェクト: 「コメントは日本語で」
→ プロジェクトの「日本語」が適用される
```

### Q2: SkillsとSubagentsの違いがわからない

**A**:
- **Skills** = 知識・ノウハウ（本を読むようなもの）
- **Subagents** = 実際に作業する人（別の社員に仕事を頼む）

```
「Dockerのベストプラクティスを教えて」→ Skills
「この50ファイルを全部レビューして」→ Subagents
```

### Q3: Commandsは何個まで作れる？

**A**: 制限はありませんが、よく使う10〜20個程度に絞ることを推奨。多すぎると管理が大変になります。

### Q4: CLAUDE.mdが長くなりすぎた場合は？

**A**: 100〜200行を超えたら分割しましょう。

```
CLAUDE.md          ← 概要・重要事項のみ（100行以内）
docs/coding.md     ← 詳細なコーディング規約
docs/workflow.md   ← 詳細なワークフロー
docs/api.md        ← API仕様

CLAUDE.md内で参照: @docs/coding.md
```

---

## 10. チェックリスト

### プロジェクト開始時

- [ ] `.claude/` フォルダを作成
- [ ] `CLAUDE.md` を作成（プロジェクト概要・規約）
- [ ] `.claude/settings.json` を作成（権限設定）
- [ ] `.gitignore` に個人設定ファイルを追加
- [ ] チームメンバーに構成を共有

### 新しいコマンド追加時

- [ ] `.claude/commands/` にファイル作成
- [ ] frontmatter（name, description）を記載
- [ ] チームにPRでレビュー依頼
- [ ] ドキュメントに追加

### 新しいスキル追加時

- [ ] `.claude/skills/スキル名/` フォルダ作成
- [ ] `SKILL.md` を作成
- [ ] triggers（発動条件）を適切に設定
- [ ] チームにPRでレビュー依頼

---

## 参考リンク

- [Claude Code 公式ドキュメント](https://code.claude.com/docs)
- [CLAUDE.md の使い方（公式）](https://claude.com/blog/using-claude-md-files)
- [Claude Code ベストプラクティス（Anthropic）](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Skills vs Commands vs Subagents の違い](https://www.youngleaders.tech/p/claude-skills-commands-subagents-plugins)
- [Claude Code 設定ガイド](https://code.claude.com/docs/en/settings)
- [GitHub連携ガイド](https://support.claude.com/en/articles/10167454-using-the-github-integration)
- [セキュリティベストプラクティス](https://www.backslash.security/blog/claude-code-security-best-practices)

---

*作成日: 2026-01-12*
