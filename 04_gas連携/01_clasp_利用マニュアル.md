# clasp 利用マニュアル（設定後の使い方 / 文系向け）

この資料は **「clasp（クラスプ）で Google Apps Script（GAS）をローカル編集し、Google に反映する」**ための、設定後の運用マニュアルです。  
コマンドはコピペでOK。迷ったら「よくある詰まりどころ」を先に見てください。

---

## 0. まず結論（いちばん大事）

- **`clasp: command not found` が出る理由**: `@google/clasp` を **ローカル**に入れただけで、`clasp` が PATH にいないため。
- **推奨の呼び出し方**: どこでも確実に動くので、基本は **`npx clasp ...`** を使う。
- **いつ `-g` が必要？**: `clasp` を毎回 `npx` なしで打ちたいなら **グローバル**に入れる（`npm i -g @google/clasp`）。

---

## 1. 利用シーン別：何をすればいい？

### シーンA：初回（ログインしてローカルから触れるようにする）

1) clasp が動くか確認

```bash
npx clasp -v
```

2) Google アカウントでログイン（ブラウザ認証）

```bash
npx clasp login
```

3) ログインできたか確認（任意）

```bash
npx clasp whoami
```

> メモ: **WSL と Windows（PowerShell）は別環境**です。WSLで作業するなら、WSLで `npx clasp ...` を実行してください。

---

### シーンB：既にあるGAS（スプレッドシート等）のプロジェクトを、ローカルに持ってくる（clone）

1) 事前に「Script ID」を用意する  
GASエディタで **プロジェクト設定 → スクリプトID** をコピー。

> 注意（ハマりがち）:  
> `https://script.google.com/u/0/home/projects/.../edit` の **`/projects/` の後ろ**に出てくるIDは、ダッシュボード用の「プロジェクトID」のことがあります。  
> `clasp clone` で必要なのは、基本的に **「スクリプトID（Script ID）」**です。  
> - いちばん確実: GASエディタの **プロジェクト設定 → スクリプトID** をコピー  
> - もう1つの目印: エディタURLが `https://script.google.com/d/<スクリプトID>/edit` の形になっている場合、`/d/` の後ろがスクリプトIDです。

2) 作業用フォルダで clone

```bash
mkdir gas-project
cd gas-project
npx clasp clone <SCRIPT_ID>
```

3) ローカルにファイルが落ちてきたらOK  
（`appsscript.json` や `Code.gs` などが作成されます）

---

### シーンC：ローカルで編集 → Google（GAS）に反映（push）

1) ローカルで編集（例：`Code.gs` を直す）
2) 反映

```bash
npx clasp push
```

> 反映のたびにブラウザ側をリロードすると、変更が見えます。

---

### シーンD：Google（GAS）側の変更を、ローカルに持ってくる（pull）

Google側で直接編集した／誰かが編集した場合に使います。

```bash
npx clasp pull
```

> チーム運用では「**どっちで編集するか**」を決めないと衝突します。基本は「ローカル編集→push」を推奨。

---

### シーンE：実行して動作確認したい（run）

関数を指定して実行できます（対象プロジェクトにその関数が存在する必要あり）。

```bash
npx clasp run <関数名>
```

例：

```bash
npx clasp run main
```

> うまく動かないときは、まず `npx clasp logs` でログを見るのが最短です。

---

### シーンF：Webアプリ / アドオン等として「リリース（デプロイ）」したい

GASは「バージョン」と「デプロイ」の概念があります。

1) まずバージョンを作る

```bash
npx clasp version "v1 初回リリース"
```

2) デプロイを作る（新規）

```bash
npx clasp deploy --description "v1"
```

3) 既存デプロイを確認したい

```bash
npx clasp deployments
```

> WebアプリのURLなどは「デプロイ管理画面」で確認できます。

---

### シーンG：ブラウザでGASを開きたい（open）

```bash
npx clasp open
```

スプレッドシート（コンテナバインド）の場合は:

```bash
npx clasp open --spreadsheet
```

---

### シーンH：ここ（ローカル）から新規GASプロジェクトを作って、Google側に連携（create → push）

「Google側で先に作らずに、ローカルから新規プロジェクトを作って紐付ける」こともできます。

#### H-1. まっさらなGAS（単体プロジェクト）を新規作成したい

```bash
mkdir my-new-gas
cd my-new-gas
npx clasp create --type standalone --title "My New GAS"
```

作成が成功すると、このフォルダに **`.clasp.json`** ができて「どのGASに繋がっているか」が記録されます。

#### H-2. スプレッドシートに紐づくGAS（コンテナバインド）を作りたい

先にスプレッドシートを用意して、その **ファイルID（URLの /d/ の後ろ）** を使います。

```bash
mkdir sheet-gas
cd sheet-gas
npx clasp create --type sheets --title "Sheet GAS" --parentId "<スプレッドシートのファイルID>"
```

#### H-3. コードを反映（push）

最初の反映はこれだけでOKです。

```bash
npx clasp push
```

> もし `push` でエラーが出る場合、初回は「Apps Script API の有効化」が必要なことがあります。  
> そのときはエラーメッセージを貼ってください（最短ルートで案内します）。

---

## 2. よく使うコマンド早見表（これだけ覚えればOK）

- **ログイン**: `npx clasp login`
- **既存プロジェクト取得**: `npx clasp clone <SCRIPT_ID>`
- **新規プロジェクト作成**: `npx clasp create ...`
- **Googleへ反映**: `npx clasp push`
- **Googleから取得**: `npx clasp pull`
- **関数実行**: `npx clasp run <関数名>`
- **ログ確認**: `npx clasp logs`
- **ブラウザで開く**: `npx clasp open`
- **デプロイ確認**: `npx clasp deployments`

---

## 3. 典型的な作業フロー（迷ったらこれ）

### 個人開発 / 小さめ改修（おすすめ）

1) `npx clasp pull`（最新化）
2) ローカル編集
3) `npx clasp push`（反映）
4) `npx clasp open` → ブラウザで確認
5) 失敗したら `npx clasp logs`

---

## 3.5 Cursorで「要件→実装」してclaspで反映する手順（おすすめ運用）

「何を作るか（要件）」を Cursor で固めてから、GAS（clasp）に反映する一連の流れです。  
迷ったらこの順で進めると、手戻りが減ります。

### 3.5-1. 事前準備（最初だけ）

- **作業フォルダを決める**（例：`gas-project/`）
- **最新化**（チーム/複数PCなら特に重要）

```bash
cd /mnt/c/Users/西田貴彦/Documents/Cursor/P_Unico/gas-project
npx clasp pull
```

### 3.5-2. Cursorで「要件（何を作るか）」を作る

Cursorに以下を貼って、要件を固めます（コピペ用テンプレ）。

```text
目的（何のために）:
やりたいこと（ユーザー視点で）:
対象（例：スプレッドシート名 / シート名 / データ範囲）:
入力（何を受け取る）:
出力（どうなると成功）:
ルール（計算式・条件分岐・例外）:
失敗時（エラー表示、ログ、リトライ）:
セキュリティ（APIキー、権限、共有範囲）:
テスト（最低3ケース）:
```

> ポイント: 「入力→処理→出力」を文章で書ければ、文系でも十分に要件として成立します。

### 3.5-3. Cursorで「実装タスク」に落とす（やることを分解）

要件が固まったら、Cursorに「やることリスト（タスク）」を作らせます。

例（指示文）:

```text
上の要件を、GASで実装するためのタスクに分解して。ファイル単位（.gs/.html）と関数名まで提案して。
```

### 3.5-4. Cursorで実装（.gs/.html を編集）

- **GASのサーバー側**: `.gs`（例：`コード.js` / `Code.gs`）
- **UI側**: `.html`（例：`sidebar.html`）

> コツ: まず「動く最小」→ 次に「見た目/例外」を追加、の順が最速です。

### 3.5-5. claspで反映（push）

編集が終わったら、GAS側へ反映します。

```bash
npx clasp push
```

### 3.5-6. GAS側で確認（open / run / logs）

ブラウザで開く:

```bash
npx clasp open
```

関数を実行（例：`main`）:

```bash
npx clasp run main
```

ログを見る:

```bash
npx clasp logs
```

### 3.5-7. 仕上げ（共有/リリースが必要なら）

- Webアプリ等で公開するなら「version → deploy」を使います（シーンF参照）

### 3.5-8. 最終チェックリスト（コピペで使う）

- [ ] `npx clasp pull` で最新化した
- [ ] 要件テンプレを埋めた（入力/出力/ルール/例外）
- [ ] タスク分解して、やることが見えている
- [ ] まず最小機能が動く状態にした
- [ ] `npx clasp push` で反映した
- [ ] `npx clasp open` でブラウザ確認した
- [ ] 問題があれば `npx clasp logs` を見た

---

## 3.6 GitHubでバージョン管理するSTEP（おすすめ運用）

GASはブラウザ上でも編集できますが、**GitHubで履歴管理**すると「いつ/誰が/何を」変えたかが明確になり、事故が減ります。

### 3.6-1. 大前提（絶対守る）

- **認証情報はコミットしない**
  - `~/.clasprc.json`（ログイン情報）は **PCのホーム配下**に保存されます（プロジェクト内ではありません）
  - ただし、プロジェクト内に **`.clasp.json`** は作られます（これは「どのスクリプトに紐づくか」だけなので通常コミットOK）
- **APIキー/トークンはコードに直書きしない**（必要なら Script Properties などに逃がす）

### 3.6-2. Git初期化（最初だけ）

`gas-project`（またはあなたのGAS作業フォルダ）で実行します。

```bash
cd /mnt/c/Users/西田貴彦/Documents/Cursor/P_Unico/gas-project
git init
```

### 3.6-3. `.gitignore` を用意（最初だけ）

GAS開発で一般的に除外するものの例です（必要に応じて増やしてください）。

```gitignore
# Node / npm
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# clasp / secrets
# ※ .clasp.json は通常コミットOK（scriptIdが入るだけ）
.clasprc.json
*.env
```

> もし別途 `package.json` を置く運用なら、そのフォルダに合わせて `.gitignore` を調整します。

### 3.6-4. 最初のコミット（最初だけ）

```bash
git add -A
git commit -m "init: clasp project"
```

### 3.6-5. GitHubにリポジトリ作成 → push（最初だけ）

GitHubで空のリポジトリを作成したら、表示される手順に従って remote を追加します（例）。

```bash
git remote add origin <GitHubのリポジトリURL>
git branch -M main
git push -u origin main
```

### 3.6-6. 日々の運用（これだけでOK）

**推奨ルール**: 「`pull → 実装 → commit → push（GitHub） → clasp push（GAS反映）`」

```bash
# 1) 最新化
npx clasp pull

# 2) 編集（Cursorで実装）

# 3) Gitに保存（履歴を残す）
git add -A
git commit -m "feat: ○○を追加"
git push

# 4) GASへ反映
npx clasp push
```

> ポイント: **GASへ反映（clasp push）の前に、先にGitHubへコミット**しておくとロールバックが簡単です。

### 3.6-7. チーム運用（ブランチ運用の最小形）

- **main**: 動く状態だけ置く（本番相当）
- **featureブランチ**: 機能追加・修正はブランチで作業
- **Pull Request（PR）**: main へはPR経由でマージ

例:

```bash
git checkout -b feat/sidebar-ui
# 編集 → commit → push
git push -u origin feat/sidebar-ui
```

### 3.6-8. 事故ったとき（戻し方の基本）

- 「直前の状態に戻したい」: `git log` でコミットを確認 → `git revert <commit>`（履歴を残して戻すのが安全）
- 「ローカルが壊れた」: GitHubから `git clone` し直して `npx clasp push` で復旧

---

## 4. UI（ダイアログ/サイドバー）を触るときの考え方（超ざっくり）

GASでは、ユーザーに見えるUIとして主に2種類あります。

- **ダイアログUI**: 「ボタンを押したときだけ出す」一時的な画面（作業向き）
- **サイドバーUI**: 画面右に常時表示できる（継続的な操作向き）

claspは「ローカルのHTML/GSファイル」をまとめてGASに反映するだけなので、  
UIの種類が違っても **基本フロー（編集→push）は同じ**です。

---

## 5. フォルダ構成のおすすめ（チーム/長期運用向け）

プロジェクト直下が散らかるのを避けたい場合、`gas/` みたいな専用フォルダを切るのがおすすめです。

- `gas/`
  - `appsscript.json`
  - `Code.gs`
  - `UI.html`（必要なら）
  - （その他 `.gs` / `.html`）

この場合、`.clasp.json` の `rootDir` を `gas` に設定します。

> 既に clone した後でも、ファイルを移動して `rootDir` を更新すれば整理できます。

---

## 6. よくある詰まりどころ（ここを見ると大体解決します）

### 6-1. `clasp: command not found`

原因: ローカルインストールで PATH にいない。  
解決:

- まずはこれでOK:

```bash
npx clasp -v
```

- どうしても `clasp` 直打ちしたい場合:

```bash
npm install -g @google/clasp
clasp -v
```

---

### 6-2. ログインできない / 認証が進まない

- ブラウザが立ち上がらない場合、WSL環境だと詰まることがあります。  
  そのときは「Windows側（PowerShell）で `clasp login`」に切り替えるか、WSLのブラウザ連携設定を見直してください。

---

### 6-3. `Script not found` / IDが違う

- Script ID が間違っている可能性が高いです。  
  GASエディタの **プロジェクト設定 → スクリプトID** を再確認してください。

---

### 6-4. pushしたのに反映されない気がする

- ブラウザ側がキャッシュしていることがあります。**リロード**してください。
- そもそも clone/作業ディレクトリが別で、違う `.clasp.json` を触っているケースも多いです。

---

## 7. 補足：用語ミニ辞典（文系向け）

- **GAS**: Googleの中で動くスクリプト（ExcelマクロのGoogle版みたいなもの）
- **clasp**: GASをローカルファイルとして扱うための道具
- **push**: ローカル → Google（反映）
- **pull**: Google → ローカル（取得）
- **Script ID**: プロジェクトを一意に特定するID（住所みたいなもの）

