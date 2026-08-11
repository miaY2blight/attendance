# 勤怠管理アプリ

社内向けのシンプルな勤怠管理Webアプリです。機能一覧・設計方針は [`docs/plan.md`](docs/plan.md)、実装順序は [`docs/build-order.md`](docs/build-order.md)、無料クラウドへのデプロイ手順は [`docs/deploy.md`](docs/deploy.md) を参照してください。

## 主な機能

- 社員: 社員ID+パスワードでログイン、出勤・退勤・休憩のボタン打刻、自分の月次勤怠履歴の確認、打刻修正申請
- 管理者: 社員アカウントの登録・編集、打刻修正申請の承認/却下、月次勤怠一覧の閲覧・CSVエクスポート

## 技術スタック

- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL(`@prisma/adapter-pg` ドライバアダプタ経由。デプロイ先は [Neon](https://neon.tech/) の無料枠を想定)
- Tailwind CSS
- 認証: 自前のセッションCookie方式(`bcryptjs` でパスワードハッシュ化)
- テスト: Vitest

## セットアップ(ローカル開発)

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. データベースの用意

[Neon](https://neon.tech/) などの無料Postgresでデータベースを1つ作成し、接続文字列を取得してください。詳しい手順は [`docs/deploy.md`](docs/deploy.md) を参照してください。

`.env.example` を `.env` にコピーし、`DATABASE_URL` を書き換えます。

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### 3. マイグレーションと初期管理者アカウントの作成

```bash
npx prisma migrate deploy
npx prisma db seed
```

初期管理者アカウントは以下の環境変数で変更できます(未設定の場合はデフォルト値が使われます)。

| 環境変数 | 説明 | デフォルト値 |
|---|---|---|
| `SEED_ADMIN_CODE` | 管理者の社員ID | `admin` |
| `SEED_ADMIN_PASSWORD` | 管理者の初期パスワード | `admin1234` |

本番運用する場合は、デフォルトのパスワードを必ず変更してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開き、上記の社員ID/パスワードでログインしてください。

## デプロイ

社内に常時稼働のサーバーがない場合の、無料クラウド(Neon + Vercel)へのデプロイ手順は [`docs/deploy.md`](docs/deploy.md) にまとめています。

## テスト

テストはテスト専用のPostgresデータベースに対して実行します(実行のたびにスキーマをリセットするため、本番/開発用DBとは必ず分けてください)。

1. Neonなどでテスト用のデータベースをもう1つ用意する
2. プロジェクトルートに `.env.test` を作成し、`TEST_DATABASE_URL` に接続文字列を設定する

```
TEST_DATABASE_URL="postgresql://user:password@host/dbname_test?sslmode=require"
```

```bash
npm test
```

カバレッジレポートを見る場合:

```bash
npx vitest run --coverage
```

## ディレクトリ構成(抜粋)

```
app/
  login/                  # ログイン画面
  page.tsx                # 社員ダッシュボード(打刻)
  history/                # 自分の月次勤怠履歴
  requests/                # 打刻修正申請(一覧・新規)
  admin/                  # 管理者向け画面(社員管理・申請承認・勤怠一覧/CSV)
actions/                  # Server Actions
lib/                      # 認証・打刻ロジック・CSV生成などの共通処理
prisma/                   # スキーマ・マイグレーション・シード
tests/                    # Vitest テスト
docs/                     # 企画・設計・デプロイドキュメント
```
