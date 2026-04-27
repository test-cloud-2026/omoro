-- ============================================================
-- Migration 004: Storage パスパターン制限
--
-- 背景:
--   003_storage.sql の storage_insert_public は bucket_id のみを確認しており、
--   任意のパスへのアップロードを許可している。
--   過剰アップロード防止・将来のレートリミット拡張の足場として、
--   許可するパス形式をフロント実装に合わせて制限する。
--
-- 許可パス形式:
--   works/<work_id>/<topic_id>.<ext>
--   例: works/550e8400-e29b-41d4-a716-446655440000/h01.png
--
-- work_id  : crypto.randomUUID() が生成する UUID v4
-- topic_id : h01〜h12 / d01〜d12 / s01〜s12 / r01〜r12 等
-- ext      : png / jpg / jpeg / webp
-- ============================================================

-- 無制限ポリシーを差し替え（パスパターン制限版へ移行）
DROP POLICY IF EXISTS "storage_insert_public" ON storage.objects;

-- パスパターン付きアップロードポリシー（anon 含む全ユーザー可）
CREATE POLICY "storage_insert_path_check"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'work-images'
    AND name ~ '^works/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[a-z][a-z0-9]*\.(png|jpe?g|webp)$'
  );

-- ----------------------------------------------------------------
-- [将来移行用] レートリミット拡張ポイント
--
-- 方針A: アップロードログテーブル + ポリシーで件数チェック
--
--   1. アップロード記録テーブルを作成
--      CREATE TABLE upload_log (
--        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
--        anon_key   TEXT,           -- anon セッション識別子（IP hash 等）
--        bucket_id  TEXT,
--        uploaded_at TIMESTAMPTZ DEFAULT now()
--      );
--
--   2. storage_insert_path_check に副問い合わせを追加
--      AND (
--        SELECT count(*) FROM upload_log
--        WHERE anon_key = current_setting('request.headers')::json->>'x-forwarded-for'
--          AND uploaded_at > now() - interval '1 hour'
--      ) < 30   -- 1時間あたり30件上限
--
-- 方針B: Edge Function ゲートウェイ（推奨・柔軟）
--
--   1. /functions/v1/upload-gate を作成
--   2. フロントは supabaseClient.storage ではなく Edge Function 経由でアップロード
--   3. Edge Function 内で Upstash Redis 等を使ったレートリミットを実装
--   4. 検証済みリクエストのみ Storage に転送
--
-- ※ MVP フェーズではパスパターン制限のみで十分
-- ----------------------------------------------------------------
