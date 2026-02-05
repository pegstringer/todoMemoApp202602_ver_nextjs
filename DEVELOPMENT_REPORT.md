# ToDoメモアプリ開発レポート

## 概要

Claude Code（CLI）を使い、対話形式で Next.js の ToDo メモアプリをゼロから構築し、UI改善・GitHub Pages デプロイ・Vercel デプロイまでを一連の流れで実施した記録。

---

## 使用環境

| 項目 | 内容 |
|------|------|
| AI ツール | Claude Code（CLI版） / モデル: Claude Opus 4.5 |
| フレームワーク | Next.js 16.1.6 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| データ永続化 | localStorage |
| ホスティング | GitHub Pages → Vercel |

---

## やりとりの全記録

### プロンプト 1: アプリの実装指示

ユーザーは事前にプランモード（Claude Codeの計画立案機能）で設計を行い、承認後に以下のプロンプトで実装を開始した。

> **ユーザーのプロンプト（全文）:**
>
> ```
> Implement the following plan:
>
> # ToDoメモアプリ - Next.js 実装プラン
>
> ## 概要
> Next.js (App Router) + TypeScript + Tailwind CSS で ToDo メモアプリを構築する。
> データはブラウザの localStorage に保存。
>
> ## 技術スタック
> - Next.js 15 (App Router)
> - TypeScript
> - Tailwind CSS
> - localStorage（データ永続化）
>
> ## 機能
> - ToDo の追加（タイトル + メモ）
> - ToDo の削除
> - 完了/未完了の切り替え
> - メモ欄の編集
> - フィルター（全て / 未完了 / 完了済み）
>
> ## 実装ステップ
>
> ### Step 1: Next.js プロジェクトの作成
> - `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias`
> - 既存の README.md を保持
>
> ### Step 2: 型定義の作成
> - `src/types/todo.ts` - Todo 型を定義
>   type Todo = { id: string; title: string; memo: string; completed: boolean; createdAt: string; }
>
> ### Step 3: カスタムフック作成
> - `src/hooks/useTodos.ts` - localStorage との同期・CRUD ロジック
>   - addTodo, deleteTodo, toggleTodo, updateMemo
>   - フィルター機能
>
> ### Step 4: UIコンポーネント作成
> - `src/components/TodoForm.tsx` - 新規 ToDo 入力フォーム
> - `src/components/TodoItem.tsx` - 個別 ToDo アイテム（完了切替・メモ編集・削除）
> - `src/components/TodoList.tsx` - ToDo リスト表示 + フィルター
> - `src/components/TodoFilter.tsx` - フィルターボタン（全て/未完了/完了済み）
>
> ### Step 5: メインページ更新
> - `src/app/page.tsx` - メインページにコンポーネントを配置
> - `src/app/layout.tsx` - レイアウト設定（タイトル等）
> - `src/app/globals.css` - 必要に応じてカスタムスタイル
>
> ## 検証方法
> - `npm run dev` で開発サーバー起動
> - ブラウザで http://localhost:3000 を開いて動作確認
> - ToDo の追加・削除・完了切替・メモ編集が正常に動作するか確認
> - ブラウザリロード後もデータが保持されるか確認
> ```

**Claudeの対応:**

1. `create-next-app` でプロジェクトを初期化（ディレクトリ名の大文字制約を回避するため一時ディレクトリ経由）
2. 型定義 `src/types/todo.ts` を作成
3. カスタムフック `src/hooks/useTodos.ts` を作成（localStorage同期・CRUD・フィルター）
4. UIコンポーネント4つを作成（TodoForm, TodoItem, TodoList, TodoFilter）
5. メインページ `page.tsx` と `layout.tsx` を更新
6. `npm run build` でビルド確認（node_modules破損を検知し再インストール）
7. 開発サーバーを起動しPlaywright MCPでブラウザを操作して全機能をテスト:
   - ToDo追加（「買い物に行く」「レポート作成」）
   - 完了チェック切替
   - フィルター（すべて / 未完了 / 完了済み）
   - メモ編集・保存
   - ページリロード後のデータ永続化
   - 削除

---

### プロンプト 2: UIデザインの変更依頼

> **ユーザーのプロンプト（全文）:**
>
> ```
> アプリの画像を見ましたが全体的に白くて眩しいです。claudeのUIのような目に優しくてフォントも見やすみのに変更してください。
> ```
>
> ※ アプリのスクリーンショット画像が添付されていた

**Claudeの対応:**

全7ファイルを一括で更新し、Claude風のウォームデザインに変更:

- **カラーパレット**: 白系 → ベージュ・クリーム系（背景 `#F3EDE5`、カード `#FAF7F2`、アクセント `#C07A45`）
- **フォント**: Arial → ヒラギノ角ゴ / Noto Sans JP 優先の日本語最適化フォントスタック
- **行間・字間**: `line-height: 1.7`, `letter-spacing: 0.02em` で可読性向上
- **UI質感**: 角丸を `rounded-2xl` に統一、チェックボックスをカスタムデザインに変更

---

### プロンプト 3: リトライ指示

> **ユーザーのプロンプト（全文）:**
>
> ```
> 続きをリトライして
> ```

**Claudeの対応:**

前回のレスポンスで全ファイル更新は完了していたが、ビルド確認とブラウザ表示確認を実施。スクリーンショットを撮影して温かみのあるデザインが正しく適用されていることを確認した。

---

### プロンプト 4: Gitコミット＆プッシュ依頼

> **ユーザーのプロンプト（全文）:**
>
> ```
> ghコマンドを使ってコミットとプッシュして
> ```

**Claudeの対応:**

1. `git status` / `git diff` / `git log` で現状を確認
2. 変更ファイルをステージング（スクリーンショット等は除外）
3. コミットメッセージ:「ToDoメモアプリの実装と温かみのあるUIデザイン適用」
4. `git remote` 未設定のため `gh repo create` を試行 → 既存リポジトリと判明
5. `gh repo view` でURL取得し `git remote add` で接続
6. リモートとのコミット履歴不一致を `git rebase` で解消（README.mdのコンフリクトを手動解決）
7. `git push -u origin main` で正常にプッシュ完了

---

### プロンプト 5: GitHub Pagesデプロイ依頼

> **ユーザーのプロンプト（全文）:**
>
> ```
> githubPagesでデプロイできるかチャレンジしてみて無理ならいいい。
> ```

**Claudeの対応:**

1. `next.config.ts` に `output: "export"` と `basePath` を追加（静的エクスポート設定）
2. `npm run build` でビルド成功を確認
3. `.github/workflows/deploy.yml` を作成（GitHub Actions によるビルド→デプロイ）
4. `gh api` で GitHub Pages のソースを GitHub Actions に設定
5. コミット・プッシュ後、`gh run watch` でデプロイ完了を確認
6. **結果: デプロイ成功** → `https://pegstringer.github.io/todoMemoApp202602_ver_nextjs/`

---

### プロンプト 6: Vercelデプロイへの切り替え依頼

> **ユーザーのプロンプト（全文）:**
>
> ```
> これを今度はvercelにデプロイして欲しい。githubPages用に変更した部分は戻した上でそうしてください。
> ```

**Claudeの対応:**

1. `next.config.ts` を元のデフォルト設定に戻す（`output: "export"` と `basePath` を削除）
2. `.github/workflows/deploy.yml` を `git rm` で削除
3. コミット・プッシュ
4. `vercel --yes --prod` でデプロイ（プロジェクト名の制約エラーを `--name` オプションで回避）
5. **結果: デプロイ成功** → `https://todo-memo-9cl8i1xpv-pegstringers-projects.vercel.app`

---

## 作成されたファイル構成

```
src/
├── app/
│   ├── globals.css        # ウォームベージュ配色のグローバルスタイル
│   ├── layout.tsx         # HTMLレイアウト（lang="ja"、メタデータ）
│   └── page.tsx           # メインページ（"use client"）
├── components/
│   ├── TodoFilter.tsx     # フィルターボタン（すべて/未完了/完了済み）
│   ├── TodoForm.tsx       # 新規ToDo入力フォーム
│   ├── TodoItem.tsx       # 個別ToDoアイテム（チェック・メモ編集・削除）
│   └── TodoList.tsx       # ToDoリスト表示
├── hooks/
│   └── useTodos.ts        # localStorage同期・CRUD・フィルターロジック
└── types/
    └── todo.ts            # Todo型・FilterType型定義
```

---

## 学んだこと・トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| `create-next-app` がディレクトリ名の大文字を拒否 | 一時ディレクトリで作成後コピー |
| コピーした `node_modules` が壊れる | `rm -rf node_modules && npm install` で再インストール |
| ローカルとリモートのコミット履歴不一致 | `git rebase origin/main` でコンフリクト解消 |
| Vercel CLIがプロジェクト名を拒否 | `--name todo-memo-app` で小文字の名前を明示指定 |
| GitHub Pages用の静的エクスポート設定 | `output: "export"` + `basePath` を next.config.ts に追加 |

---

## 所要プロンプト数

ユーザーが入力したプロンプトは**合計6回**（本レポート依頼を除く）。プランモードでの設計1回 + 実装後の改善・デプロイ指示5回で、ゼロからアプリ構築〜本番デプロイまでを完了した。
