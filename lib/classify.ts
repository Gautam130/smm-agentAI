'use client';

export interface ClassificationResult {
  type: 'content' | 'competitor' | 'glossary' | 'market' | 'platform' | 'audience' | 'format' | 'conversational';
  useSupabase: boolean;
  useLiveSearch: boolean;
}

export function classifyQuery(query: string): ClassificationResult {
  const q = query.toLowerCase().trim();
  
  const contentPatterns = [
    /^create\s+/i, /^write\s+/i, /^generate\s+/i, /^make\s+/i,
    /^(5|10|7)\s+(hooks?|captions?|posts?|hashtags?)/i,
    /^(give|create|write)\s+me\s+(5|10|7)\s+/i,
    /^(hooks?|captions?|hashtags?|reel|story|caption)\s+(for|about)/i,
    /\bdraft\s+/i, /\bcaption\s+/i, /\bscript\s+/i
  ];
  
  const competitorPatterns = [
    /\bcompetitor\b/i, /\bcompare\b/i, /\bvs\b/i, /\bversus\b/i,
    /\b(campaign|strategy|marketing) of [A-Z]/i,
    /\bwho is\b/i, /\bfind (me )?(top|best)\b/i,
    /\binfluencer(s)?\b/i, /\bnews|update|launch|announce/i,
    /\b(boAt|Nykaa|Mamaearth|Flipkart|Amazon|Reliance)\b/i,
    /\banalyse\s+[A-Z]/i,
    /\banalyze\s+[A-Z]/i,
    /\baudit\s+[A-Z]/i,
    /\bstrategy\s+of\b/i,
    /\bhow\s+does\s+[A-Z]/i
  ];
  
  const glossaryPatterns = [
    /\bwhat (is|are|does)\b/i, /\bhow (to|does) calculate\b/i,
    /\bdefinition\b/i, /\bmeaning\b/i, /\bformula\b/i,
    /\b(cac|roas|ltv|cpm|ctr|er|cpc|cpa|arpu)\b/i,
    /\bbenchmark\b/i, /\bhook rate\b/i,
    /\bexplain\b/i,
    /\btell me about\s+(cac|roas|ltv|cpm|ctr)\b/i,
    /\bhow\s+to\s+calculate\b/i,
    /\b(what|which)\s+is\s+a\s+good\b/i,
    /\b(engagement rate|hook rate|open rate|click rate)\b/i,
    /\b(good|healthy|ideal|average)\s+(cac|roas|ltv|benchmark)\b/i
  ];
  
  const platformPatterns = [
    /\b(instagram|facebook|twitter|youtube|linkedin|tiktok|reels|stories|shorts)\b/i,
    /\bwhatsapp\s+(marketing|business)/i
  ];
  
  const audiencePatterns = [
    /\bgen[ -]?z\b/i, /\btier[ -]?2\b/i, /\btier[ -]?3\b/i,
    /\baudience\b/i, /\bconsumer\b/i, /\bpsychology\b/i,
    /\b(purchase|buying|shopping)\s+(behavior|pattern|habit)/i,
    /\bfestive\s+(season|buying|shopping)/i, /\bvernacular\b/i
  ];
  
  const formatPatterns = [
    /\bcarousel\b/i, /\b(carra?ousel|ugc)\s+(tips?|best|strategy)/i,
    /\bvideo\s+(length|size|duration)/i, /\bstories?\s+(tips?|best|strategy)/i,
    /\breel(s)?\s+(tips?|best|strategy|length)/i,
    /\bhook(s)?\s+(tips?|best|strategy)/i, /\bshorts?\s+(tips?|best)/i,
    /\bpost(ing)?\s+(time|frequency|schedule)\b/i,
    /\bbest\s+time\s+to\s+post\b/i,
    /\bhow\s+often\b/i
  ];
  
  const marketPatterns = [
    /\b(d2c|b2b|b2c)\s+(market|size|growth)/i,
    /\bindia(n)?\s+(market|market size)/i,
    /\bcac\b/i, /\broas\b/i, /\binfluencer\s+(rate|price|cost)/i,
    /\bfestive\s+(ad|campaign|spend|cost)/i
  ];
  
  if (contentPatterns.some(p => p.test(q))) {
    return { type: 'content', useSupabase: false, useLiveSearch: true };
  }
  
  if (competitorPatterns.some(p => p.test(q))) {
    return { type: 'competitor', useSupabase: false, useLiveSearch: true };
  }
  
  if (glossaryPatterns.some(p => p.test(q))) {
    return { type: 'glossary', useSupabase: true, useLiveSearch: false };
  }
  
  if (marketPatterns.some(p => p.test(q))) {
    return { type: 'market', useSupabase: true, useLiveSearch: true };
  }
  
  if (platformPatterns.some(p => p.test(q))) {
    return { type: 'platform', useSupabase: true, useLiveSearch: true };
  }
  
  if (audiencePatterns.some(p => p.test(q))) {
    return { type: 'audience', useSupabase: true, useLiveSearch: true };
  }
  
  if (formatPatterns.some(p => p.test(q))) {
    return { type: 'format', useSupabase: true, useLiveSearch: true };
  }
  
  return { type: 'conversational', useSupabase: true, useLiveSearch: true };
}

export type QueryTier = 1 | 2 | 3 | 4;

const QUERY_TIERS: Record<QueryTier, { name: string; maxTokens: number; search: boolean; temp: number; description: string }> = {
  1: { name: 'instant', maxTokens: 2000, search: false, temp: 0.9, description: 'Simple content creation' },
  2: { name: 'quick', maxTokens: 3000, search: true, temp: 0.7, description: 'Standard queries' },
  3: { name: 'deep', maxTokens: 5000, search: true, temp: 0.4, description: 'Research and analysis' },
  4: { name: 'complex', maxTokens: 6000, search: true, temp: 0.3, description: 'Multi-step comparisons' }
};

export function getQueryTier(prompt: string): QueryTier {
  const lower = prompt.toLowerCase().trim();
  
  const instantPatterns = [
    /^create\s+(a\s+)?(caption|hook|hashtag|post|tweet|thread|script)/i,
    /^write\s+(a\s+)?(caption|hook|hashtag|post|tweet|thread|script)/i,
    /^generate\s+(a\s+)?(caption|hook|hashtag|post|tweet)/i,
    /^(5|10|7)\s+(hooks?|captions?|hashtags?|posts?|tweets?)/i,
    /^(give|create|write)\s+me\s+(5|10|7)\s+/i,
    /^(hooks?|captions?|hashtags?|reel|story|caption)\s+(for|about)/i
  ];
  
  const quickPatterns = [
    /^(strategy|campaign|plan|ideas?|recommend|suggestions?)/i,
    /(diwali|holi|festival|seasonal)\s+(campaign|strategy|content)/i,
    /(growth|engagement|reach)\s+(strategy|plan|tips)/i,
    /^(content|posting)\s+(strategy|plan|calendar)/i,
    /^(best|good|top)\s+(time|platform|format)/i
  ];
  
  const deepPatterns = [
    /^(research|analyze|analyse|audit|investigate)/i,
    /^(market|industry|competitor|swot)\s+(research|analysis)/i,
    /^(compare|vs|versus)\s+/i,
    /^(how\s+to|what\s+is|why\s+does)/i,
    /(size|share|trend|growth|forecast)/i
  ];
  
  if (instantPatterns.some(p => p.test(lower))) return 1;
  if (deepPatterns.some(p => p.test(lower))) return 3;
  if (quickPatterns.some(p => p.test(lower))) return 2;
  
  return 2;
}

export function getTierParams(tier: QueryTier): { maxTokens: number; search: boolean; temp: number } {
  const params = QUERY_TIERS[tier];
  return { maxTokens: params.maxTokens, search: params.search, temp: params.temp };
}