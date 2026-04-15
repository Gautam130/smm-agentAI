-- ============================================================================
-- USER CONTEXT TABLE - Lightweight memory for Maya
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type TEXT,
  audience TEXT,
  goals TEXT,
  brand_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users see only their own context
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own context" ON user_context
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SEARCH CACHE TABLE - Short-term cache for search results
-- ============================================================================
CREATE TABLE IF NOT EXISTS search_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash TEXT NOT NULL UNIQUE,
  query_text TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_search_cache_query_hash ON search_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires_at ON search_cache(expires_at);

-- RLS: public read for search cache (no user data)
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read search cache" ON search_cache
  FOR SELECT USING (true);

CREATE POLICY "Service can insert search cache" ON search_cache
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- AUTO-CLEANUP: Remove expired cache entries daily
-- ============================================================================
-- This can be run as a cron job or manual cleanup
-- DELETE FROM search_cache WHERE expires_at < NOW();
