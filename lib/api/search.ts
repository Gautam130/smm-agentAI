export type SearchProvider =
  | 'serper' | 'exa' | 'gnews' | 'duckduckgo' | 'jina'
  | 'stocks' | 'finnhub' | 'influencer' | 'socialblade'
  | 'rss' | 'qoruz' | 'wikipedia' | 'reddit' | 'linkup' | 'tavily';

export interface SearchOptions {
  niche?: string;
  platform?: string;
  limit?: number;
  city?: string;
  tier?: string;
  url?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain?: string;
  tierScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  handles?: string[];
  content?: string;
  provider: string;
  error?: string;
}

export async function search(
  provider: SearchProvider,
  query: string,
  options?: SearchOptions
): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, query, ...options }),
  });
  
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }
  
  return res.json();
}

export async function searchInfluencers(
  query: string,
  options?: SearchOptions
): Promise<SearchResponse> {
  return search('influencer', query, options);
}

export async function searchNews(
  query: string,
  options?: SearchOptions
): Promise<SearchResponse> {
  return search('gnews', query, options);
}

export async function searchWeb(
  query: string,
  options?: SearchOptions
): Promise<SearchResponse> {
  return search('serper', query, options);
}

export async function searchWikipedia(
  query: string
): Promise<SearchResponse> {
  return search('wikipedia', query);
}

export async function fetchUrlContent(
  url: string
): Promise<{ content: string; provider: string }> {
  const res = await search('jina', '', { url });
  return { content: res.content || '', provider: res.provider };
}