-- ============================================================
-- Migration 003: Storage バケット設計
--
-- バケット名: work-images
-- アクセス方式: private bucket + signed URL（公開URLは使用しない）
--
-- オブジェクトパス（バケット内）:
--   works/<work_id>/<topic_id>.png
--   例: works/a1b2c3d4-.../h01.png
--
-- images カラム移行パス（works テーブル）:
--   現在: JSONB { "h01": "data:image/png;base64,..." }
--   将来: JSONB { "h01": "works/<work_id>/h01.png" }
--         → フロントで createSignedUrl(path, 3600) を呼び出して <img> に渡す
--   ※ カラム型・構造の変更は不要（値の内容だけ変わる）
--
-- 注意: 現在のパスに user_id を含まないため、
--       将来の所有者制御は signed URL の発行を Edge Function 経由にするか、
--       パスを works/<user_id>/<work_id>/<topic_id>.png に変更する必要がある。
-- ============================================================

-- ----------------------------------------------------------------
-- バケット作成
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'work-images',
  'work-images',
  false,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------
-- MVP フェーズ: 全ユーザーが参照・アップロード可能
-- ----------------------------------------------------------------

-- 参照（signed URL 経由ダウンロードに必要）
CREATE POLICY "storage_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'work-images');

-- アップロード: works/ 配下のパスのみ許可（パス形式を強制）
CREATE POLICY "storage_insert_public"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'work-images'
    AND name LIKE 'works/%/%'
  );

-- ----------------------------------------------------------------
-- [将来移行用] 所有者管理フェーズ（2パターン）
--
-- ▼ パターン A: パスに user_id を含める（推奨）
--   パス変更: works/<work_id>/<topic_id>.png
--          → works/<user_id>/<work_id>/<topic_id>.png
--   ポリシーでパスの先頭セグメントを user_id と照合する
--
-- ▼ パターン B: パス変更なし（現行パス維持）
--   signed URL の発行を Edge Function 経由にして、
--   発行前に works テーブルの user_id を確認する
-- ----------------------------------------------------------------

/*
-- ── パターン A ──────────────────────────────────────────────

DROP POLICY IF EXISTS "storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_public" ON storage.objects;

-- パス規則: works/<user_id>/<work_id>/<topic_id>.png
-- (storage.foldername(name))[1] = 'works'
-- (storage.foldername(name))[2] = user_id

CREATE POLICY "storage_select_own"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'work-images'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "storage_insert_own"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'work-images'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "storage_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'work-images'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
*/
