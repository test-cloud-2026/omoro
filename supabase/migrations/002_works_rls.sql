-- ============================================================
-- Migration 002: works テーブル RLS ポリシー
--
-- フェーズ管理:
--   [現在 MVP] 全ユーザーが SELECT / INSERT 可能
--   [将来]    ポリシーを DROP → 所有者ポリシーに差し替えるだけで移行完了
--             フロントエンドのコード変更は不要
-- ============================================================

ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- MVP フェーズ: 匿名を含む全ユーザーへ開放
-- ----------------------------------------------------------------

CREATE POLICY "works_select_public"
  ON works
  FOR SELECT
  USING (true);

CREATE POLICY "works_insert_public"
  ON works
  FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------------------------------
-- [将来移行用] user_id による所有者管理フェーズ
--
-- 手順:
--   1. 認証フローを実装し、INSERT 時に user_id をセットするよう
--      フロントを修正する
--   2. 以下の DROP → CREATE を実行するだけで移行完了
-- ----------------------------------------------------------------

/*
DROP POLICY IF EXISTS "works_select_public" ON works;
DROP POLICY IF EXISTS "works_insert_public" ON works;

-- 自分の作品のみ参照
CREATE POLICY "works_select_own"
  ON works
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分の user_id でのみ登録
CREATE POLICY "works_insert_own"
  ON works
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分の作品のみ削除
CREATE POLICY "works_delete_own"
  ON works
  FOR DELETE
  USING (auth.uid() = user_id);
*/
