# デプロイ手順(無料クラウド: Neon + Vercel)

社内に常時稼働のサーバーがないため、無料のクラウドサービスにデプロイする手順をまとめます。

- **データベース**: [Neon](https://neon.tech/)(無料のホスティングPostgres)
- **アプリ本体**: [Vercel](https://vercel.com/)(無料のNext.jsホスティング)

どちらもクレジットカード登録なしで始められる無料プランがあります(2026年8月時点)。料金体系は変わる可能性があるため、契約前に各サービスの最新の無料枠を確認してください。

## なぜSQLiteのままではダメなのか

これまでのローカル開発では `dev.db` というファイル1つで完結するSQLiteを使っていましたが、Vercelのようなサーバーレス環境ではリクエストのたびに実行環境が使い捨てられるため、ファイルに保存したデータは残りません。そのため、常時接続できる外部のデータベース(Postgres)に切り替えています。

## 前提

- GitHubアカウント(コードを置く場所として)
- Neonアカウント(無料)
- Vercelアカウント(無料。GitHubアカウントでログイン可能)

## 手順

### 1. Neonでデータベースを作成する

1. [neon.tech](https://neon.tech/) にサインアップし、新しいプロジェクトを作成する(リージョンは `ap-northeast` など日本に近いものを選択)
2. プロジェクト作成後、ダッシュボードから接続文字列(Connection string)を2種類コピーしておく
   - **Pooled connection**(ホスト名に `-pooler` が付くもの): アプリ本体(Vercel)用
   - **Direct connection**: マイグレーション実行用(ローカルから`prisma migrate`を叩くときに使う。Pooled接続でも動く場合が多いが、直接接続の方が確実)
3. 動作確認・テスト用に、同じプロジェクト内にもう1つデータベースを作成しておくことを推奨(Neonはブランチ機能で簡単に複製できます)。本番データと混ざらないようにするためです。

### 2. ローカルでスキーマを適用し、初期管理者を作成する

プロジェクトルートの `.env` を編集し、`DATABASE_URL` にNeonの **Pooled connection** 文字列を設定します(`.env.example` を参考にしてください)。

```
DATABASE_URL="postgresql://xxxx:xxxx@xxxx-pooler.xxxx.neon.tech/xxxx?sslmode=require"
```

その状態で以下を実行し、Neon側にテーブルを作成 → 初期管理者アカウントを投入します。

```bash
npx prisma migrate deploy
npx prisma db seed
```

`SEED_ADMIN_PASSWORD` 環境変数で初期パスワードを指定できます。本番で使う場合は必ずデフォルト値(`admin1234`)から変更してください。

```bash
SEED_ADMIN_CODE="admin" SEED_ADMIN_PASSWORD="適当な強いパスワード" npx prisma db seed
```

### 3. コードをGitHubにpushする

```bash
git add -A
git commit -m "Set up for deployment"
git push origin main
```

### 4. Vercelにプロジェクトをインポートする

1. [vercel.com](https://vercel.com/) にログインし、「Add New Project」からこのGitHubリポジトリを選択
2. Framework Presetは自動的に「Next.js」と検出されるはずなのでそのままでOK
3. 「Environment Variables」に以下を設定する

   | 変数名 | 値 |
   |---|---|
   | `DATABASE_URL` | Neonの **Pooled connection** 文字列 |

4. 「Deploy」をクリック

ビルド時に `postinstall` スクリプトが自動的に `prisma generate` を実行するので、追加設定は不要です(マイグレーションの適用は含まれないので、手順2をデプロイ前に必ず行っておいてください)。

### 5. 動作確認

デプロイ完了後にVercelが発行するURL(`https://xxxx.vercel.app`)にアクセスし、手順2で作成した管理者アカウントでログインできることを確認してください。

## スキーマを変更したとき

`prisma/schema.prisma` を変更した場合、Vercel上のビルドではマイグレーションを自動実行しません。**デプロイ前に手元から本番DBに対して**以下を実行してください。

```bash
DATABASE_URL="(Neonの接続文字列)" npx prisma migrate dev --name 変更内容
```

その後 `git push` すると、生成されたマイグレーションファイルを使ってVercel側のビルドが通ります(コード側は新しいスキーマ前提になるため、マイグレーション未適用のまま先にデプロイしないよう順序に注意してください)。

## テストを実行する場合

`npm test` はテスト専用のPostgresデータベースに対して実行されます(テスト開始時にスキーマをリセットするため、本番/開発用DBとは必ず分けてください)。

1. Neonでテスト用のデータベース(またはブランチ)をもう1つ作成する
2. プロジェクトルートに `.env.test` を作成し、以下を記載する

   ```
   TEST_DATABASE_URL="postgresql://xxxx:xxxx@xxxx-pooler.xxxx.neon.tech/xxxx_test?sslmode=require"
   ```

3. `npm test` を実行

## 無料枠に関する注意

- Neonの無料プランには容量・計算時間の上限があります。社内の小規模利用であれば通常は問題になりませんが、上限に達すると一時的にアクセスできなくなることがあります。
- Vercelの無料(Hobby)プランは個人・小規模利用を想定したものです。利用規約上、商用チームでの利用が制限される場合があるため、社内利用の規模によっては有料プランへの切り替えを検討してください。
- どちらのサービスも料金体系は変更されることがあるため、契約前に公式サイトの最新情報を確認してください。
