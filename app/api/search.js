// Vercel API Route - Search
// All search APIs server-side, keys hidden from users
// Supports single provider, batch providers, and multi-query search

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Content-Length', '0');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider = 'serper', maxResults = 8 } = req.body;

  // Keys stored as env vars on Vercel - not visible to users
  const SERPER_KEY = process.env.SERPER_API_KEY || process.env.SERPER_KEY;
  const EXA_KEY = process.env.EXA_KEY;
  const GNEWS_KEY = process.env.GNEWS_KEY;
  const JINA_KEY = process.env.JINA_API_KEY;

  try {
    // RSS feed search - doesn't need a query
    if (provider === 'rss') {
      const feedUrl = req.body.feedUrl || (typeof maxResults === 'object' ? maxResults.feedUrl : null);
      const limit = typeof maxResults === 'object' ? (maxResults.maxResults || 5) : 5;
      
      if (!feedUrl) {
        return res.status(400).json({ error: 'RSS feed URL required' });
      }
      
      try {
        const response = await fetch(feedUrl, { timeout: 10000 });
        if (!response.ok) throw new Error('Feed fetch failed');
        
        const text = await response.text();
        const items = parseRSSItems(text, limit);
        
        return res.status(200).json({
          results: items,
          provider: 'rss',
          feedUrl
        });
      } catch (e) {
        return res.status(200).json({ results: [], error: e.message, provider: 'rss' });
      }
    }

    // Influencer-specific search - needs req.body
    if (provider === 'influencer') {
      const niche = req.body.niche || req.body.query || '';
      const city = req.body.city || 'India';
      const tier = req.body.tier || 'nano micro';
      const platform = req.body.platform || 'Instagram';
      const year = new Date().getFullYear();
      const prevYear = year - 1;
      
      // Run all searches in parallel — Serper + Exa + Qoruz
      const searches = [];
      
      if (SERPER_KEY) {
        searches.push(
          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: niche + ' influencer ' + city + ' India site:grynow.in OR site:winkl.co OR site:plixxo.com OR site:viralmafia.com OR site:kofluence.com OR site:qoruz.com ' + year, num: maxResults })
          }).then(r => r.json()).catch(() => ({ organic: [], _source: 'serper_directories' })),

          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: '"' + niche + '" creator ' + city + ' India ' + platform + ' ' + tier + ' followers collab ' + year, num: maxResults })
          }).then(r => r.json()).catch(() => ({ organic: [], _source: 'serper_profiles' })),

          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: niche + ' India influencer brand collab "paid partnership" OR "sponsored" OR "gifted" ' + prevYear + ' ' + year, num: maxResults })
          }).then(r => r.json()).catch(() => ({ organic: [], _source: 'serper_collabs' })),

          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: niche + ' India ' + tier + ' influencer site:grynow.in ' + year, num: maxResults })
          }).then(r => r.json()).catch(() => ({ organic: [], _source: 'serper_grynow' })),

          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: niche + ' influencer ' + tier + ' India site:winkl.co OR site:plixxo.com ' + year, num: maxResults })
          }).then(r => r.json()).catch(() => ({ organic: [], _source: 'serper_winkl' })),

          fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: niche + ' India influencer creator site:qoruz.com ' + year, num: maxResults })
          }).then(r => r.json()).catch(() => ({ organic: [], _source: 'serper_qoruz' }))
        );
      }

      // Exa: deep content search for influencer data
      if (EXA_KEY) {
        searches.push(
          fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': EXA_KEY },
            body: JSON.stringify({ query: niche + ' influencer ' + city + ' India ' + platform + ' ' + tier + ' followers engagement collab ' + year, num_results: maxResults, highlights: true, category: 'social_media' })
          }).then(r => r.json()).catch(() => ({ results: [], _source: 'exa' })),

          fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': EXA_KEY },
            body: JSON.stringify({ query: niche + ' India influencer brand collaboration case study ' + prevYear + ' ' + year, num_results: 5, highlights: true })
          }).then(r => r.json()).catch(() => ({ results: [], _source: 'exa_case' }))
        );
      }

      const resultsArr = await Promise.all(searches);
      
      // Map Serper results (organic array)
      const mapSerper = (data, source) => (data.organic || []).map(r => ({
        title: r.title || '',
        snippet: r.snippet || '',
        url: r.link || '',
        domain: (r.link || '').replace(/^https?:\/\//, '').split('/')[0],
        source
      }));

      // Map Exa results
      const mapExa = (data, source) => (data.results || []).map(r => ({
        title: r.title || '',
        snippet: ((r.highlights && r.highlights[0]) || r.text || '').substring(0, 300),
        url: r.url || '',
        domain: (r.url || '').replace(/^https?:\/\//, '').split('/')[0],
        source
      }));

      let allInfluencerResults = [];
      let sourceCounts = { serperDirectories: 0, serperProfiles: 0, serperCollabs: 0, serperGrynw: 0, serperWinkl: 0, serperQoruz: 0, exaDeep: 0, exaCase: 0 };
      let idx = 0;

      if (SERPER_KEY) {
        allInfluencerResults.push(...mapSerper(resultsArr[idx] || {}, 'serper_directories'));
        sourceCounts.serperDirectories = (resultsArr[idx++]?.organic || []).length;
        allInfluencerResults.push(...mapSerper(resultsArr[idx] || {}, 'serper_profiles'));
        sourceCounts.serperProfiles = (resultsArr[idx++]?.organic || []).length;
        allInfluencerResults.push(...mapSerper(resultsArr[idx] || {}, 'serper_collabs'));
        sourceCounts.serperCollabs = (resultsArr[idx++]?.organic || []).length;
        allInfluencerResults.push(...mapSerper(resultsArr[idx] || {}, 'serper_grynow'));
        sourceCounts.serperGrynw = (resultsArr[idx++]?.organic || []).length;
        allInfluencerResults.push(...mapSerper(resultsArr[idx] || {}, 'serper_winkl'));
        sourceCounts.serperWinkl = (resultsArr[idx++]?.organic || []).length;
        allInfluencerResults.push(...mapSerper(resultsArr[idx] || {}, 'serper_qoruz'));
        sourceCounts.serperQoruz = (resultsArr[idx++]?.organic || []).length;
      }

      if (EXA_KEY) {
        allInfluencerResults.push(...mapExa(resultsArr[idx] || {}, 'exa_deep'));
        sourceCounts.exaDeep = (resultsArr[idx++]?.results || []).length;
        allInfluencerResults.push(...mapExa(resultsArr[idx] || {}, 'exa_case'));
        sourceCounts.exaCase = (resultsArr[idx++]?.results || []).length;
      }

      const scored = scoreResults(allInfluencerResults, niche);
      
      const allText = allInfluencerResults.map(r => r.title + ' ' + r.snippet).join(' ');
      const handles = (allText.match(/@[a-zA-Z0-9_.]{3,30}/g) || [])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 30);

      return res.status(200).json({
        results: scored,
        handles,
        provider: 'influencer',
        sources: sourceCounts
      });
    }
    
    // Social Blade - Note: Direct scraping blocked by Cloudflare
    // Use web search to find Social Blade profiles instead
    if (provider === 'socialblade') {
      const handle = req.body.handle || req.body.query || '';
      const cleanHandle = handle.replace('@', '').trim();
      
      if (!cleanHandle) {
        return res.status(200).json({ results: [], provider: 'socialblade' });
      }

      if (!SERPER_KEY) {
        return res.status(200).json({ 
          results: [{ 
            handle: '@' + cleanHandle, 
            url: 'https://socialblade.com/instagram/user/' + cleanHandle, 
            snippet: 'Check stats directly at socialblade.com (web scraping blocked)' 
          }], 
          provider: 'socialblade' 
        });
      }

      try {
        // Use web search to find Social Blade profile
        const searchRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            q: cleanHandle + ' instagram socialblade followers stats',
            num: 3
          })
        });

        if (searchRes.ok) {
          const data = await searchRes.json();
          const results = (data.organic || []).map(r => ({
            handle: '@' + cleanHandle,
            url: r.link || 'https://socialblade.com/instagram/user/' + cleanHandle,
            snippet: r.snippet || 'Check profile on Social Blade',
            source: 'web_search'
          }));

          return res.status(200).json({
            results: results.length > 0 ? results : [{ 
              handle: '@' + cleanHandle, 
              url: 'https://socialblade.com/instagram/user/' + cleanHandle, 
              snippet: 'Direct check required: socialblade.com/' + cleanHandle 
            }],
            provider: 'socialblade'
          });
        }
      } catch(e) {}

      return res.status(200).json({ 
        results: [{ 
          handle: '@' + cleanHandle, 
          url: 'https://socialblade.com/instagram/user/' + cleanHandle, 
          snippet: 'Check: socialblade.com/user/' + cleanHandle 
        }], 
        provider: 'socialblade' 
      });
    }

    // Qoruz - Use web search (API no longer public, requires login)
    if (provider === 'qoruz') {
      const niche = req.body.niche || req.body.query || '';
      const platform = req.body.platform || 'instagram';
      const year = new Date().getFullYear();

      if (!SERPER_KEY) {
        return res.status(200).json({ results: [], provider: 'qoruz', error: 'No search API key' });
      }

      try {
        // Search for Qoruz profiles using Serper
        const qoruzSearch = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            q: niche + ' ' + platform + ' influencer India site:qoruz.com ' + year,
            num: 10
          })
        });

        if (qoruzSearch.ok) {
          const data = await qoruzSearch.json();
          const results = (data.organic || []).map(r => ({
            title: r.title || '',
            snippet: r.snippet || '',
            url: r.link || '',
            domain: 'qoruz.com',
            handle: extractHandle(r.title || r.snippet || ''),
            followers: extractFollowerCount(r.snippet || ''),
            engagement: null,
            avgLikes: null,
            avgComments: null,
            category: niche,
            source: 'qoruz_web'
          }));

          return res.status(200).json({
            results,
            provider: 'qoruz',
            total: results.length
          });
        }
      } catch(e) {}

      return res.status(200).json({ results: [], provider: 'qoruz' });
    }

    // Wikipedia provider - doesn't need a query (uses req.body.query for topic)
    if (provider === 'wikipedia') {
      const topic = (req.body.query || '').split(' ').slice(0, 3).join('_');
      if (!topic) {
        return res.status(400).json({ error: 'Topic required for Wikipedia' });
      }
      try {
        const wikiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic);
        const r = await fetch(wikiUrl);
        if (r.ok) {
          const d = await r.json();
          if (d.extract) {
            return res.status(200).json({
              results: [{
                title: d.title,
                snippet: d.extract.substring(0, 500),
                url: d.content_urls?.desktop?.page || '',
                domain: 'wikipedia.org',
                score: 8
              }],
              provider: 'wikipedia'
            });
          }
        }
      } catch(e) {}
      return res.status(200).json({ results: [], provider: 'wikipedia' });
    }

    // Reddit India - Community discussions
    if (provider === 'reddit') {
      const query = req.body.query || '';
      const limit = typeof maxResults === 'object' ? (maxResults.maxResults || 5) : maxResults;
      
      try {
        const url = `https://www.reddit.com/r/india/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${limit}&sort=relevance`;
        const r = await fetch(url, {
          headers: { 'User-Agent': 'SMM-Agent/1.0 (by /u/smmagent)' },
          timeout: 10000
        });
        
        if (r.ok) {
          const d = await r.json();
          const results = (d.data?.children || []).map(item => ({
            title: item.data?.title || '',
            snippet: (item.data?.selftext || item.data?.title || '').substring(0, 300),
            url: 'https://reddit.com' + (item.data?.permalink || ''),
            domain: 'reddit.com',
            score: 3
          }));
          
          return res.status(200).json({ results, provider: 'reddit' });
        }
      } catch(e) {
        console.error('[API] Reddit error:', e.message);
      }
      return res.status(200).json({ results: [], provider: 'reddit' });
    }

    // Stocks - Yahoo Finance (free, no API key)
    if (provider === 'stocks') {
      const query = req.body.query || '';
      
      // Common Indian stock symbols
      const stockSymbols = {
        'nifty': '^NSEI',
        'sensex': '^BSESN',
        'reliance': 'RELIANCE.NS',
        'tcs': 'TCS.NS',
        'infosys': 'INFY.NS',
        'hdfc': 'HDFCBANK.NS',
        'icici': 'ICICIBANK.NS',
        'sbi': 'SBIN.NS',
        'adani': 'ADANIENT.NS',
        'tata': 'TATAMOTORS.NS',
        'itc': 'ITC.NS'
      };
      
      // Map query to symbol
      let symbol = '^NSEI'; // Default to Nifty 50
      const qLower = query.toLowerCase();
      for (const [name, sym] of Object.entries(stockSymbols)) {
        if (qLower.includes(name)) {
          symbol = sym;
          break;
        }
      }
      
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const r = await fetch(url, { timeout: 10000 });
        
        if (r.ok) {
          const d = await r.json();
          const chart = d?.chart?.result?.[0];
          const meta = chart?.meta;
          const quote = chart?.indicators?.quote?.[0];
          
          if (meta) {
            const price = meta.regularMarketPrice || 0;
            const prevClose = meta.previousClose || price;
            const change = price - prevClose;
            const changePercent = prevClose ? ((change / prevClose) * 100).toFixed(2) : 0;
            
            const results = [{
              title: `${meta.symbol} - Stock Data`,
              snippet: `Current: ₹${price?.toFixed(2) || 'N/A'} | Change: ${change >= 0 ? '+' : ''}${change?.toFixed(2)} (${changePercent}%) | High: ₹${quote?.high?.[quote.high.length - 1]?.toFixed(2) || 'N/A'} | Low: ₹${quote?.low?.[quote.low.length - 1]?.toFixed(2) || 'N/A'}`,
              url: `https://finance.yahoo.com/quote/${symbol}`,
              domain: 'finance.yahoo.com',
              score: 10
            }];
            
            return res.status(200).json({ results, provider: 'stocks' });
          }
        }
      } catch(e) {
        console.error('[API] Stocks error:', e.message);
      }
      return res.status(200).json({ results: [], provider: 'stocks' });
    }

    // Stocks - Finnhub (free tier available, requires API key)
    const FINNHUB_KEY = process.env.FINNHUB_KEY;
    if (provider === 'finnhub' && FINNHUB_KEY) {
      const query = req.body.query || '';
      
      // Common Indian stock symbols mapping
      const finnhubSymbols = {
        'nifty': 'NSE:NIFTY',
        'sensex': 'BSE:SENSEX',
        'reliance': 'NSE:RELIANCE',
        'tcs': 'NSE:TCS',
        'infosys': 'NSE:INFY',
        'hdfc': 'NSE:HDFCBANK',
        'icici': 'NSE:ICICIBANK',
        'sbi': 'NSE:SBIN',
        'adani': 'NSE:ADANIENT',
        'tata': 'NSE:TATAMOTORS',
        'itc': 'NSE:ITC'
      };
      
      let symbol = 'NSE:NIFTY';
      const qLower = query.toLowerCase();
      for (const [name, sym] of Object.entries(finnhubSymbols)) {
        if (qLower.includes(name)) {
          symbol = sym;
          break;
        }
      }
      
      try {
        // Get quote
        const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
        if (quoteRes.ok) {
          const quote = await quoteRes.json();
          if (quote.c) {
            const change = quote.d || 0;
            const changePercent = quote.dp || 0;
            
            // Get company info
            const infoRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`);
            let companyName = symbol.split(':')[1] || symbol;
            if (infoRes.ok) {
              const info = await infoRes.json();
              companyName = info.name || companyName;
            }
            
            const results = [{
              title: `${companyName} - Live Quote`,
              snippet: `Current: ₹${quote.c?.toFixed(2) || 'N/A'} | Change: ${change >= 0 ? '+' : ''}${change?.toFixed(2)} (${changePercent?.toFixed(2)}%) | High: ₹${quote.h?.toFixed(2) || 'N/A'} | Low: ₹${quote.l?.toFixed(2) || 'N/A'}`,
              url: `https://finnhub.io/quote?symbol=${symbol}`,
              domain: 'finnhub.io',
              score: 10
            }];
            
            return res.status(200).json({ results, provider: 'finnhub' });
          }
        }
      } catch(e) {
        console.error('[API] Finnhub error:', e.message);
      }
      return res.status(200).json({ results: [], provider: 'finnhub' });
    }

    // LinkUp - AI-powered real-time search (free tier: 1000 searches/month)
    const LINKUP_KEY = process.env.LINKUP_KEY;
    if (provider === 'linkup' && LINKUP_KEY) {
      const query = req.body.query || '';
      
      try {
        const response = await fetch('https://api.linkup.ai/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LINKUP_KEY}`
          },
          body: JSON.stringify({
            query: query,
            depth: 'standard',
            num_sources: 10
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const results = (data.results || []).map(item => ({
            title: item.title || '',
            snippet: item.content?.substring(0, 300) || '',
            url: item.url || '',
            domain: item.url ? new URL(item.url).hostname : 'linkup.com',
            score: 10
          }));
          
          return res.status(200).json({ results, provider: 'linkup' });
        }
      } catch(e) {
        console.error('[API] LinkUp error:', e.message);
      }
      return res.status(200).json({ results: [], provider: 'linkup' });
    }

    // Tavily - AI-powered search (free tier: 1000 searches/month)
    const TAVILY_KEY = process.env.TAVILY_KEY;
    if (provider === 'tavily' && TAVILY_KEY) {
      const query = req.body.query || '';
      
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            api_key: TAVILY_KEY,
            query: query,
            search_depth: 'basic',
            max_results: 8,
            include_answer: true
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const results = (data.results || []).map(item => ({
            title: item.title || '',
            snippet: item.content?.substring(0, 300) || '',
            url: item.url || '',
            domain: item.url ? new URL(item.url).hostname : 'tavily.com',
            score: 10
          }));
          
          return res.status(200).json({ results, provider: 'tavily' });
        }
      } catch(e) {
        console.error('[API] Tavily error:', e.message);
      }
      return res.status(200).json({ results: [], provider: 'tavily' });
    }

    // Multi-provider batch search - accepts array of {provider, query, maxResults}
    if (provider === 'multi' && Array.isArray(req.body.queries)) {
      const queries = req.body.queries.slice(0, 10); // max 10 queries
      
      const searchPromises = queries.map(async (q) => {
        try {
          const result = await searchProvider(q.query || '', q.provider || 'serper', q.maxResults || maxResults, {
            SERPER_KEY, EXA_KEY, GNEWS_KEY
          });
          return { provider: q.provider || 'serper', query: q.query, ...result };
        } catch (e) {
          return { provider: q.provider || 'serper', query: q.query, results: [], error: e.message };
        }
      });

      const results = await Promise.all(searchPromises);
      return res.status(200).json({ results, type: 'batch' });
    }

    // Single query, single provider
    const query = req.body.query || '';
    
    // Allow empty query only for specific providers
    const requiresQuery = !['duckduckgo', 'gnews'].includes(provider);
    if (requiresQuery && !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await searchProvider(query, provider, typeof maxResults === 'number' ? maxResults : 8, {
      SERPER_KEY, EXA_KEY, GNEWS_KEY
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Search Error:', error.message);
    return res.status(200).json({ results: [], error: error.message });
  }
}

// Helper: Extract @handle from text
function extractHandle(text) {
  const match = text.match(/@[a-zA-Z0-9._]{3,30}/);
  return match ? match[0] : null;
}

// Helper: Extract follower count from text (e.g., "45.2K followers")
function extractFollowerCount(text) {
  const match = text.match(/([\d,.]+[KMB]?)\s*(?:followers?|subscribers?|粉丝)/i);
  return match ? match[1] : null;
}

function parseRSSItems(xml, limit = 5) {
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const item = match[1];
    const title = (item.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '';
    const link = (item.match(/<link[^>]*>([^<]+)<\/link>/i) || [])[1] || '';
    const description = (item.match(/<description[^>]*>([^<]+)<\/description>/i) || [])[1] || '';
    const pubDate = (item.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/i) || [])[1] || '';
    
    if (title) {
      items.push({
        title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
        snippet: description.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').substring(0, 300).trim(),
        url: link.trim(),
        domain: link.replace(/^https?:\/\//, '').split('/')[0] || new URL(link).hostname,
        publishedDate: pubDate
      });
    }
  }
  
  return items;
}

async function searchProvider(query, provider, maxResults, keys) {
  const { SERPER_KEY, EXA_KEY, GNEWS_KEY } = keys;
  let results = [];

  // Serper primary (reliable, fast)
  if (provider === 'serper' || provider === 'auto') {
    if (SERPER_KEY) {
      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: query, num: maxResults })
        });

        if (response.ok) {
          const data = await response.json();
          results = (data.organic || []).map(r => ({
            title: r.title,
            snippet: r.snippet,
            url: r.link,
            domain: r.link?.replace(/^https?:\/\//, '').split('/')[0]
          }));
          return { results, provider: 'serper' };
        } else {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Serper ${response.status}: ${errorText.substring(0, 100)}`);
        }
      } catch (e) {
        if (e.message.includes('Serper')) throw e;
        console.error('Serper error:', e.message);
      }
    }
  }

  // Exa fallback
  if (provider === 'exa' || provider === 'auto' || results.length === 0) {
    if (EXA_KEY) {
      try {
        const response = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': EXA_KEY
          },
          body: JSON.stringify({
            query,
            num_results: maxResults,
            highlights: true
          })
        });

        if (response.ok) {
          const data = await response.json();
          results = (data.results || []).map(r => ({
            title: r.title,
            snippet: r.highlight || r.text,
            url: r.url,
            domain: r.url?.replace(/^https?:\/\//, '').split('/')[0]
          }));
          return { results, provider: 'exa' };
        } else {
          const errorText = await response.text().catch(() => '');
          throw new Error(`Exa ${response.status}: ${errorText.substring(0, 100)}`);
        }
      } catch (e) {
        if (e.message.includes('Exa')) throw e;
        console.error('Exa error:', e.message);
      }
    }
  }

  // DuckDuckGo fallback
  if (provider === 'duckduckgo' || results.length === 0) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=in-en`;
      const response = await fetch(searchUrl, { timeout: 10000 });
      
      if (response.ok) {
        const html = await response.text();
        const resultRegex = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        const matches = [];
        let match;
        let count = 0;
        
        while ((match = resultRegex.exec(html)) !== null && count < 5) {
          const url = match[1];
          const title = match[2].replace(/<[^>]*>/g, '').trim();
          const snippet = match[3].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          
          if (url && title && !url.includes('duckduckgo') && !url.includes('yahoo.com')) {
            matches.push({
              title,
              snippet: snippet.substring(0, 200),
              url,
              domain: url.replace(/^https?:\/\//, '').split('/')[0]
            });
            count++;
          }
        }
        return { results: matches, provider: 'duckduckgo' };
      }
    } catch (e) {
      console.error('DuckDuckGo error:', e.message);
    }
  }

  // GNews fallback
  if (provider === 'gnews' || results.length === 0) {
    if (GNEWS_KEY) {
      try {
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${maxResults}&apikey=${GNEWS_KEY}`;
        const response = await fetch(gnewsUrl);
        
        if (response.ok) {
          const data = await response.json();
          const articles = data.articles || [];
          if (articles.length > 0) {
            results = articles.map(a => ({
              title: (a.title || '').substring(0, 200),
              snippet: ((a.description || a.content) || '').substring(0, 300),
              url: a.url || '',
              domain: (a.source && a.source.name) ? a.source.name.replace(/^https?:\/\//, '').split('/')[0] : 'gnews.io'
            }));
            return { results, provider: 'gnews' };
          }
        }
        
        // Log failure
        const errBody = await response.text().catch(() => '');
        console.error('GNews failed:', response.status, query.substring(0, 30), errBody.substring(0, 100));
      } catch (e) {
        console.error('GNews error:', e.message);
      }
    }
  }

  return { results: [], error: 'No providers available', provider };
}

function scoreResults(results, query) {
  const q = query.toLowerCase();
  const year = new Date().getFullYear();
  
  const HIGH_TRUST_DOMAINS = [
    'economictimes.com', 'livemint.com', 'businessstandard.com',
    'yourstory.com', 'inc42.com', 'forbesindia.com', 'ndtv.com',
    'hindustantimes.com', 'thehindu.com', 'moneycontrol.com',
    'socialsamosa.com', 'afaqs.com', 'exchange4media.com',
    'grynow.in', 'winkl.co', 'plixxo.com', 'viralmafia.com',
    'kofluence.com', 'influglue.com', 'qoruz.com'
  ];

  const LOW_TRUST_DOMAINS = [
    'reddit.com', 'quora.com', 'yahoo.com', 
    'pinterest.com', 'tumblr.com'
  ];
  
  return results.map(r => {
    let score = 5;
    const domain = r.domain || '';
    const text = (r.title + ' ' + r.snippet).toLowerCase();
    
    if (HIGH_TRUST_DOMAINS.some(d => domain.includes(d))) score += 3;
    if (LOW_TRUST_DOMAINS.some(d => domain.includes(d))) score -= 3;
    
    if (text.includes(String(year))) score += 2;
    if (text.includes(String(year - 1))) score += 1;
    
    const qWords = q.split(/\s+/).filter(w => w.length > 3);
    const matchCount = qWords.filter(w => text.includes(w)).length;
    score += Math.min(matchCount, 3);
    
    if (text.includes('india') || text.includes('indian') || 
        text.includes('₹') || text.includes('inr')) score += 1;
    
    if (/\d+[k|m|%|₹|cr|lakh]/i.test(text)) score += 1;
    
    return { ...r, score: Math.min(10, Math.max(0, score)) };
  })
  .sort((a, b) => b.score - a.score)
  .filter(r => r.score >= 2);
}
