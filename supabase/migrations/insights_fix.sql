
-- ============================================================================
-- SEARCH_INSIGHTS FUNCTION - Use existing marketing_insights table
-- ============================================================================
DROP FUNCTION IF EXISTS search_insights(TEXT, INT);

CREATE OR REPLACE FUNCTION search_insights(
  search_query TEXT,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  topic TEXT,
  insight TEXT,
  data_point TEXT,
  source TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.topic,
    i.insight,
    i.data_point,
    i.source
  FROM marketing_insights i
  WHERE i.topic ILIKE '%' || search_query || '%'
     OR i.insight ILIKE '%' || search_query || '%'
     OR i.category ILIKE '%' || search_query || '%'
  ORDER BY 
    CASE 
      WHEN i.topic ILIKE '%' || search_query || '%' THEN 1
      WHEN i.category ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END
  LIMIT match_count;
END;
$$;
