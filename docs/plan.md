# 社内向け勤怠管理アプリ 開発計画

## Context

現在のリポジトリ (`C:\Users\t_yos\Desktop\myapp`) は `.gitignore` と `.git` のみのほぼ空の状態。社内向けのシンプルな勤怠管理Webアプリをゼロから構築する。ユーザーへのヒアリングで以下の要件を確認済み:

- 打刻はボタン操作(出勤・退勤・休憩開始/終了)を基本とし、打刻漏れ時のために時刻の手入力(要承認)も可能にする
- 認証は社員ID+パスワードの簡易ログイン(管理者が社員アカウントを登録)
- 月次勤怠一覧・CSV出力(給与計算用)
- 打刻修正申請・承認ワークフロー

有給申請や管理者向けリアルタイムダッシュボードは今回のスコープ外(初期リリースではシンプルさを優先)。

## 洗い出した機能一覧(初期スコープ)

**一般社員向け**
1. ログイン/ログアウト(社員ID+パスワード)
2. 出勤・退勤・休憩開始/終了のボタン打刻(当日の状態表示)
3. 打刻漏れ・誤り時の修正申請フォーム(対象日・時刻・理由を入力)
4. 自分の月次勤怠履歴の確認、自分の申請状況の確認

**管理者向け**
5. 社員アカウントの登録・編集・無効化(CRUD)
6. 打刻修正申請の承認/却下キュー
7. 月次勤怠一覧の閲覧・CSVエクスポート(社員別・月別)

## 技術スタック

- **Next.js 14+ (App Router) + TypeScript** — 単一デプロイ、Server Actionsで別APIレイヤー不要
- **SQLite + Prisma** — 社内小規模利用に十分、運用コストゼロ、型安全なスキーマ管理
- **認証**: NextAuth等は使わず、自前の最小セッション認証(`bcryptjs`でハッシュ化、DBセッションテーブル+httpOnly Cookie)
- **Tailwind CSS** — シンプルなフォーム・テーブルUIを素早く構築
- **CSVエクスポート**: Route Handler (`app/admin/attendance/export/route.ts`) でサーバー側生成しダウンロード

この構成は「簡単な」という要件に沿い、不要な複雑さ(OAuth、外部DB、別バックエンドサービス)を避ける。

## データモデル (`prisma/schema.prisma`)

- `User`: employeeCode(社員ID/ログインID), name, passwordHash, role(EMPLOYEE/ADMIN), isActive
- `Session`: userId, expiresAt(Cookieセッション管理用)
- `AttendanceRecord`: userId, date, clockIn, clockOut, breakStart, breakEnd, status(NORMAL/CORRECTED/MISSING), note (userId+dateでユニーク)
- `CorrectionRequest`: userId, targetDate, requestedClockIn/Out, requestedBreakStart/End, reason, status(PENDING/APPROVED/REJECTED), approverId, approverComment

休憩は初期は1日1回分(start/end)のみ対応し、シンプルさを優先(将来的に複数回対応する場合は子テーブル化)。

## ルート/画面構成

```
app/
  login/page.tsx                      # ログイン
  (employee)/
    dashboard/page.tsx                # 当日の打刻ボタン・状態表示
    history/page.tsx                  # 自分の月次履歴
    requests/page.tsx                 # 自分の修正申請一覧
    requests/new/page.tsx             # 修正申請フォーム
  admin/
    layout.tsx                        # 管理者ガード
    employees/page.tsx (+new/[id]/edit)  # 社員CRUD
    attendance/page.tsx               # 月次勤怠一覧
    attendance/export/route.ts        # CSVダウンロード
    requests/page.tsx                 # 修正申請承認キュー
proxy.ts                         # セッションCookieチェック
lib/
  auth.ts        # getCurrentUser/createSession/hashPassword等
  prisma.ts      # Prismaクライアント
  attendance.ts  # 打刻・集計ロジック
  csv.ts         # CSV生成
actions/
  auth.ts / attendance.ts / correctionRequests.ts / employees.ts   # Server Actions
prisma/
  schema.prisma
  seed.ts        # 初期管理者ユーザー作成
```

管理者向けAction/PageはUI非表示だけでなく、サーバー側で必ず `role === 'ADMIN'` を再チェックする。

## 実装順序

1. `create-next-app` でスキャフォールド(TS/App Router/Tailwind)、Prisma + SQLite + bcryptjs導入
2. `schema.prisma` 作成・マイグレーション・`seed.ts`(管理者1名)
3. 認証(ログイン画面・セッションCookie・middlewareガード・ログアウト)
4. 社員ダッシュボード(当日打刻・休憩ボタン、状態遷移の妥当性チェック)
5. 自分の月次履歴画面
6. 修正申請(申請フォーム・自分の申請一覧)
7. 管理者: 社員CRUD
8. 管理者: 修正申請承認キュー(承認時にAttendanceRecordへ反映)
9. 管理者: 月次勤怠一覧・CSVエクスポート
10. 入力バリデーション(zod)・エラー表示・レスポンシブ調整・READMEにセットアップ手順記載

## 検証方法

- `npm run dev` でアプリを起動し、ブラウザで以下を確認:
  - 管理者でログイン→社員登録→ログアウト→その社員IDでログイン→出勤/休憩/退勤ボタンで打刻→履歴に反映されること
  - 打刻を意図的に飛ばし、修正申請→管理者承認→AttendanceRecordが更新されることを確認
  - 管理者の月次勤怠一覧でCSVがダウンロードでき、内容が打刻データと一致すること
- `npx prisma studio` でDBの中身を確認しながら整合性をチェック
