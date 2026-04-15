import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DOMAIN_SCORES: Record<string, number> = {
  // Tier 10 - Official Government Data (facts)
  'data.gov.in': 10,
  'mca.gov.in': 10,
  'sebi.gov.in': 10,
  'nseindia.com': 10,
  'bseindia.com': 10,
  'rbi.org.in': 10,
  'pib.gov.in': 10,
  'epfindia.gov.in': 10,
  'gst.gov.in': 10,
  
  // Tier 9 - Premium Indian (free access)
  'inc42.com': 9,
  'moneycontrol.com': 9,
  'theprint.in': 9,
  'cnbctv18.com': 9,
  'ndtv.com': 9,
  'hindustantimes.com': 9,
  
  // Tier 8 - Meaning/Interpretation
  'worldbank.org': 8,
  'imf.org': 8,
  'datareportal.com': 8,
  'mckinsey.com': 8,
  'bcg.com': 8,
  'bain.com': 8,
  'linkedin.com': 8,
  'hbr.org': 8,
  'reuters.com': 8,
  
  // Tier 7 - Business Context
  'livemint.com': 7,
  'economictimes.indiatimes.com': 7,
  'forbesindia.com': 7,
  'businesstoday.in': 7,
  'statista.com': 7,
  'wearesocial.com': 7,
  'gartner.com': 7,
  
  // Tier 6 - Ideas/Frameworks
  'hubspot.com': 6,
  'buffer.com': 6,
  'campaignindia.in': 6,
  'afaqs.com': 6,
  'afaqs.co.in': 6,
  'socialmediaexaminer.com': 6,
  'hootsuite.com': 6,
  'sproutsocial.com': 6,
  
  // Tier 5 - Tech/Business News
  'techcrunch.com': 5,
  'medianama.com': 5,
  'yourstory.com': 5,
  'entrackr.com': 5,
  'bloomberg.com': 5,
  'economist.com': 5,
  
  // Tier 3 - Signals only (max 1 per response, never for hard numbers)
  'trends.google.com': 3,
  'google.com': 3,
  
  // Tier 0 - Never cite
  'medium.com': 0,
  'substack.com': 0,
  'reddit.com': 0,
  'youtube.com': 0,
  'twitter.com': 0,
  'x.com': 0,
  'quora.com': 0,
};

const getDomainScore = (url: string): number => {
  try {
    const domain = url?.replace(/^https?:\/\//, '').split('/')[0].toLowerCase() || '';
    
    if (!domain) return 5;
    
    // Check exact match first
    if (DOMAIN_SCORES[domain]) return DOMAIN_SCORES[domain];
    
    // Check if domain ends with any known domain (handles subdomains)
    for (const [knownDomain, score] of Object.entries(DOMAIN_SCORES)) {
      if (domain === knownDomain || domain.endsWith('.' + knownDomain)) {
        return score;
      }
    }
    
    return 5; // Default score for unknown domains
  } catch {
    return 5;
  }
};

const getConfidence = (tierScore: number): 'high' | 'medium' | 'low' => {
  if (tierScore >= 8) return 'high';
  if (tierScore >= 5) return 'medium';
  return 'low';
};

const scoreAndSortResults = (results: { title: string; snippet?: string; url: string; domain?: string }[]) => {
  return results
    .map(r => {
      const tierScore = getDomainScore(r.url || r.domain || '');
      return {
        ...r,
        tierScore,
        confidence: getConfidence(tierScore),
        domain: r.domain || r.url?.replace(/^https?:\/\//, '').split('/')[0] || 'unknown'
      };
    })
    .sort((a, b) => b.tierScore - a.tierScore);
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  
  // Multi-query batch handler
  if (body.queries && Array.isArray(body.queries)) {
    const results = await Promise.all(
      body.queries.map(async (q: {query: string; provider: string; maxResults: number}) => {
        const r = await fetch(request.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q)
        });
        return r.json().catch(() => ({ results: [] }));
      })
    );
    return NextResponse.json({ results, provider: 'multi' });
  }

  const { provider = 'serper', maxResults = 8, query } = body;

  const SERPER_KEY = process.env.SERPER_API_KEY || process.env.SERPER_KEY;
  const EXA_KEY = process.env.EXA_KEY;
  const GNEWS_KEY = process.env.GNEWS_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_KEY;

  if (provider === 'stocks') {
    const stockSymbols: Record<string, string> = {
      nifty: '^NSEI', sensex: '^BSESN', reliance: 'RELIANCE.NS',
      tcs: 'TCS.NS', infosys: 'INFY.NS', hdfc: 'HDFCBANK.NS',
      icici: 'ICICIBANK.NS', sbi: 'SBIN.NS', adani: 'ADANIENT.NS',
      tata: 'TATAMOTORS.NS', itc: 'ITC.NS'
    };
    let symbol = '^NSEI';
    const qLower = (query || '').toLowerCase();
    for (const [name, sym] of Object.entries(stockSymbols)) {
      if (qLower.includes(name)) { symbol = sym; break; }
    }
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        const chart = d?.chart?.result?.[0];
        const meta = chart?.meta;
        const price = meta?.regularMarketPrice || 0;
        const prevClose = meta?.previousClose || price;
        const change = price - prevClose;
        const changePercent = prevClose ? ((change / prevClose) * 100).toFixed(2) : '0';
        return NextResponse.json({
          results: [{
            title: `${meta.symbol} - Stock Data`,
            snippet: `Current: ₹${price?.toFixed(2)} | Change: ${change >= 0 ? '+' : ''}${change?.toFixed(2)} (${changePercent}%)`,
            url: `https://finance.yahoo.com/quote/${symbol}`,
            domain: 'finance.yahoo.com',
            score: 10
          }],
          provider: 'stocks'
        });
      }
    } catch (e) { console.error('Stocks error:', e); }
    return NextResponse.json({ results: [], provider: 'stocks' });
  }

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  if (provider === 'serper' && SERPER_KEY) {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, num: maxResults })
      });
      if (response.ok) {
        const data = await response.json();
        const results = (data.organic || []).map((r: { title: string; snippet: string; link: string }) => ({
          title: r.title,
          snippet: r.snippet,
          url: r.link,
          domain: r.link?.replace(/^https?:\/\//, '').split('/')[0]
        }));
        return NextResponse.json({ results: scoreAndSortResults(results), provider: 'serper' });
      }
    } catch (e) { console.error('Serper error:', e); }
  }

  if ((provider === 'exa' || !SERPER_KEY) && EXA_KEY) {
    try {
      const response = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': EXA_KEY },
        body: JSON.stringify({ query, num_results: maxResults, highlights: true })
      });
      if (response.ok) {
        const data = await response.json();
        const results = (data.results || []).map((r: { title: string; highlight?: string; text?: string; url: string }) => ({
          title: r.title,
          snippet: r.highlight || r.text,
          url: r.url,
          domain: r.url?.replace(/^https?:\/\//, '').split('/')[0]
        }));
        return NextResponse.json({ results: scoreAndSortResults(results), provider: 'exa' });
      }
    } catch (e) { console.error('Exa error:', e); }
  }

  if (GNEWS_KEY) {
    try {
      const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${maxResults}&apikey=${GNEWS_KEY}`;
      const response = await fetch(gnewsUrl, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const results = (data.articles || []).map((a: { title: string; description?: string; url: string; source?: { name: string } }) => ({
          title: a.title?.substring(0, 200),
          snippet: a.description?.substring(0, 300),
          url: a.url,
          domain: a.source?.name || 'gnews.io'
        }));
        return NextResponse.json({ results: scoreAndSortResults(results), provider: 'gnews' });
      }
    } catch (e) { console.error('GNews error:', e); }
  }

  // DuckDuckGo provider
  if (provider === 'duckduckgo') {
    try {
      const encoded = encodeURIComponent(query);
      const r = await fetch(
        `https://html.duckduckgo.com/html/?q=${encoded}&kl=in-en`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (r.ok) {
        const html = await r.text();
        const results: {title:string;snippet:string;url:string;domain:string}[] = [];
        const matches = html.matchAll(
          /class="result__title"[^>]*>.*?href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?class="result__snippet"[^>]*>([^<]+)/g
        );
        for (const m of matches) {
          results.push({
            title: m[2].trim(),
            snippet: m[3].trim(),
            url: m[1],
            domain: m[1].replace(/^https?:\/\//, '').split('/')[0]
          });
          if (results.length >= maxResults) break;
        }
        return NextResponse.json({ results: scoreAndSortResults(results), provider: 'duckduckgo' });
      }
    } catch(e) { console.error('DDG error:', e); }
  }

  // Finnhub provider
  if (provider === 'finnhub' && FINNHUB_KEY) {
    try {
      const symbol = query.toUpperCase().replace(/\s+/g,'');
      const [quote, profile] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`).then(r=>r.json()),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`).then(r=>r.json())
      ]);
      return NextResponse.json({
        results: [{
          title: `${profile.name || symbol} (${symbol})`,
          snippet: `Price: $${quote.c} | Change: ${quote.d >= 0 ? '+' : ''}${quote.d} (${quote.dp?.toFixed(2)}%) | High: $${quote.h} | Low: $${quote.l}`,
          url: `https://finance.yahoo.com/quote/${symbol}`,
          domain: 'finnhub.io'
        }],
        provider: 'finnhub'
      });
    } catch(e) { console.error('Finnhub error:', e); }
  }

  // Jina URL fetcher
  if (provider === 'jina') {
    const { url: targetUrl } = body;
    if (targetUrl) {
      try {
        const r = await fetch(`https://r.jina.ai/${encodeURIComponent(targetUrl)}`, {
          headers: { 'Accept': 'text/plain' }
        });
        if (r.ok) {
          const content = await r.text();
          return NextResponse.json({ content, success: true, provider: 'jina' });
        }
      } catch(e) { console.error('Jina error:', e); }
    }
    return NextResponse.json({ content: '', success: false, provider: 'jina' });
  }

  return NextResponse.json({ results: [], error: 'No providers available', provider });
}

export async function GET() {
  return NextResponse.json({ status: 'Search API ready' });
}