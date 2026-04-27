-- ============================================================
-- Migration 003: Storage バケット設計
--
-- 設計方針:
--   - MVP フェーズ: public バケット + 直接 URL 参照
--   - 将来フェーズ: private バケット + signed URL 方式に移行可能
--
-- images カラム移行パス:
--   現在: JSONB { "h01": "works/<timestamp>/h01.png" }（Storage パス）
--   URL:  https://<project>.supabase.co/storage/v1/object/public/work-images/<path>
-- ============================================================

-- public バケット作成（MVP: 直接 URL でアクセス可能）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-images',
  'work-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 既存バケットが private で作成済みの場合はこちらを実行
-- UPDATE storage.buckets SET public = true WHERE id = 'work-images';

-- ----------------------------------------------------------------
-- MVP フェーズ: 全ユーザーが参照・アップロード可能
-- ----------------------------------------------------------------

-- アップロード（MVP: 全ユーザー可）
CREATE POLICY "storage_insert_public"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'work-images');

-- ----------------------------------------------------------------
-- [将来移行用] private バケット + signed URL フェーズ
--
-- 手順:
--   1. UPDATE storage.buckets SET public = false WHERE id = 'work-images';
--   2. restoreWork を async 化して createSignedUrl に差し替える
--   3. パス規則: work-images/works/<user_id>/<work_id>/<topic_id>.png
-- ----------------------------------------------------------------

/*
DROP POLICY IF EXISTS "storage_insert_public" ON storage.objects;

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
