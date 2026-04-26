-- ============================================================
-- Migration 001: works テーブル作成
--
-- 設計方針:
--   - MVP では user_id は NULL 許容（匿名保存）
--   - user_id カラムを最初から持つことで、
--     将来の「所有者管理」移行をポリシー差し替えのみで完結させる
--   - images カラムは現在 DataURL の JSONB だが、
--     将来 Storage URL に差し替えても型・構造は変わらない
-- ============================================================

CREATE TABLE IF NOT EXISTS works (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL DEFAULT 'おもろ図鑑',
  topics     JSONB       NOT NULL,
  images     JSONB,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 将来の user_id フィルタ・一覧取得に備えたインデックス
CREATE INDEX IF NOT EXISTS works_user_id_idx    ON works (user_id);
CREATE INDEX IF NOT EXISTS works_created_at_idx ON works (created_at DESC);
