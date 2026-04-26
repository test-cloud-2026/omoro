-- ============================================================
-- Migration 003: Storage バケット設計
--
-- 設計方針:
--   - public バケットは使用しない（URL 推測による無断アクセスを防止）
--   - private バケット + signed URL 方式を採用
--   - 署名付き URL の有効期限はフロント側で制御する（例: 3600秒）
--
-- images カラム移行パス:
--   現在: JSONB { "h01": "data:image/png;base64,..." }
--   将来: JSONB { "h01": "work-images/works/<work_id>/h01.png" }
--         → フロントで createSignedUrl() を呼び出して表示
--   ※ カラム型・構造の変更は不要（値の内容のみ変わる）
-- ============================================================

-- private バケット作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-images',
  'work-images',
  false,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- MVP フェーズ: 全ユーザーが参照・アップロード可能
-- ----------------------------------------------------------------

-- 参照（signed URL 経由のダウンロードに必要）
CREATE POLICY "storage_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'work-images');

-- アップロード（MVP: 全ユーザー可）
CREATE POLICY "storage_insert_public"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'work-images');

-- ----------------------------------------------------------------
-- [将来移行用] 所有者管理フェーズ
--
-- パス規則: work-images/works/<user_id>/<work_id>/<topic_id>.png
-- フォルダ名の先頭セグメントを user_id と一致させることで
-- ストレージ側でも所有者チェックが完結する
-- ----------------------------------------------------------------

/*
DROP POLICY IF EXISTS "storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_public" ON storage.objects;

-- 自分のフォルダのみ参照
CREATE POLICY "storage_select_own"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'work-images'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- 自分のフォルダにのみアップロード
CREATE POLICY "storage_insert_own"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'work-images'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- 自分のフォルダのみ削除
CREATE POLICY "storage_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'work-images'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
*/
