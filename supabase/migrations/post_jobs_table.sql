-- ============================================================================
-- POST JOBS TABLE - Agentic execution queue (Dispatcher → Worker → TryPost)
-- ============================================================================
CREATE TABLE IF NOT EXISTS post_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  media_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
  attempts INT NOT NULL DEFAULT 0,
  error_log TEXT,
  trypost_job_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users see only their own jobs
ALTER TABLE post_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own post jobs" ON post_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for the dispatcher (find pending jobs quickly)
CREATE INDEX IF NOT EXISTS idx_post_jobs_status ON post_jobs(status);
CREATE INDEX IF NOT EXISTS idx_post_jobs_scheduled_at ON post_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_post_jobs_user_id ON post_jobs(user_id);

-- ============================================================================
-- TRIGGER: Auto-update updated_at on row change
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_jobs_updated_at
  BEFORE UPDATE ON post_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
