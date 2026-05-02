-- ============================================================================
-- USER CONTEXT - Add last_seen timestamp for session awareness
-- ============================================================================
ALTER TABLE user_context ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

COMMENT ON COLUMN user_context.last_seen IS 'Timestamp of user most recent conversation start';
