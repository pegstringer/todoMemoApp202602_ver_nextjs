# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## コミュニケーション

- 日本語で対応すること

## コマンド

- `npm run dev` — 開発サーバー起動（localhost:3000）
- `npm run build` — プロダクションビルド
- `npm run lint` — ESLint実行（flat config、next/core-web-vitals + next/typescript）

- `npm test` — Vitest実行（ウォッチモード）
- `npm run test:run` — テスト一括実行
- `npx vitest run <ファイルパス>` — 単一ファイルのテスト実行

## テストコードの原則

### テストの品質

- 必ず実際の機能を検証すること。意味のないアサーションは絶対に書かない
- 各テストケースは具体的な入力と期待される出力を検証すること
- モックは必要最小限に留め、実際の動作に近い形でテストすること

### ハードコーディングの禁止

- テストを通すためだけのハードコードは絶対に禁止
- 本番コードに `if (testMode)` のような条件分岐を入れない
- テスト用の特別な値やマジックナンバーを本番コードに埋め込まない
- 環境変数や設定ファイルを使用して、テスト環境と本番環境を適切に分離すること

### テスト実装の進め方

- テストが失敗する状態から始めること（レッド→グリーン）
- 境界値・異常系・エラーケースも必ずテストすること
- カバレッジの数値だけでなく、実際の品質を重視すること
- テストケース名は何をテストしているか明確に記述すること

### 実装前の確認

- 機能の仕様を正しく理解してからテストを書くこと
- 不明な点があれば、仮の実装ではなくユーザに確認すること

## アーキテクチャ

ToDoメモアプリ — Next.js 16（App Router）によるクライアントサイドToDoアプリ。

**すべてクライアントサイドで動作。** データはlocalStorage（キー: `todo-memo-app`）で永続化。バックエンドやAPIルートはなし。

### データフロー

`page.tsx`（"use client"）→ `useTodos`フック → localStorage

`useTodos`フック（`src/hooks/useTodos.ts`）が唯一のデータ管理層。CRUD操作（追加・削除・完了切替・メモ更新）とフィルタリングを担い、useEffectでlocalStorageと同期。

### コンポーネント構成

`page.tsx` が `TodoForm`、`TodoFilter`、`TodoList` を描画。`TodoList` は各項目を `TodoItem` で描画。全コンポーネントがクライアントコンポーネント（"use client"）。

### 型定義

`src/types/todo.ts` に `Todo`（id, title, memo, completed, createdAt）と `FilterType`（"all" | "active" | "completed"）を定義。

### スタイリング

- Tailwind CSS v4: `@import "tailwindcss"` を使用（v3の `@tailwind` ディレクティブではない）
- `globals.css` の `:root` にCSSカスタムプロパティでデザイントークンを定義（温かみのあるベージュ/ブラウン系パレット）
- `@theme inline` ブロックでCSS変数をTailwindテーマにマッピング
- コンポーネントはTailwindユーティリティクラスとインライン `style` 属性（CSSカスタムプロパティ参照）を併用
- 日本語フォント（Hiragino, Noto Sans JP）+ Geistフォールバック

### パスエイリアス

`@/*` → `./src/*`（tsconfig.jsonで設定）。
