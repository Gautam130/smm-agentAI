'use client';

import { useState, useEffect } from 'react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { searchInfluencers } from '@/lib/api/search';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

type TabType = 'find' | 'pitch' | 'dmauto' | 'brief' | 'track' | 'shortlist';

interface InfluencerProfile {
  handle: string;
  name: string;
  followers: string;
  city: string;
  platform: string;
  score: number;
  style: string;
  whyFit: string;
  flags: string;
  contact: string;
  dm: string;
  freshness: 'fresh' | 'moderate' | 'stale';
}

const COLORS = [
  'linear-gradient(135deg, #00d4aa, #06b6d4)',
  'linear-gradient(135deg, #8b5cf6, #a855f7)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #00d4aa, #8b5cf6)',
  'linear-gradient(135deg, #db2777, #f59e0b)',
  'linear-gradient(135deg, #059669, #00d4aa)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #f59e0b, #3b82f6)',
];

export default function InfluencerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('find');
  
  const [brand, setBrand] = useState('');
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tier, setTier] = useState('Micro (10k–100k)');
  const [city, setCity] = useState('');
  const [style, setStyle] = useState('');
  const [offer, setOffer] = useState('');
  const [count, setCount] = useState('5');
  
  const [pitchBrand, setPitchBrand] = useState('');
  const [pitchTier, setPitchTier] = useState('Micro (10k–100k)');
  const [pitchPlatform, setPitchPlatform] = useState('Instagram');
  
  const [briefCreator, setBriefCreator] = useState('');
  const [briefProduct, setBriefProduct] = useState('');
  const [briefDeliverables, setBriefDeliverables] = useState('');
  const [briefGuidelines, setBriefGuidelines] = useState('');

  const [trackBrand, setTrackBrand] = useState('');
  const [searchResults, setSearchResults] = useState<InfluencerProfile[]>([]);
  const [searchHandles, setSearchHandles] = useState<string[]>([]);
  const [rawResponse, setRawResponse] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { response, isLoading, error, sendMessage } = useStreamingChat();

  const [shortlist, setShortlist] = useLocalStorage<InfluencerProfile[]>('smm_influencer_shortlist', []);

  const tierMap: Record<string, string> = {
    'Nano (1k–10k)': 'nano',
    'Micro (10k–100k)': 'micro',
    'Mid-tier (100k–500k)': 'mid',
    'Macro (500k+)': 'macro'
  };

  const parseInfluencerResponse = (text: string, foundHandles?: string[]): InfluencerProfile[] => {
    const profiles: InfluencerProfile[] = [];
    
    // First: try to extract handles directly from text if none parsed from structured format
    const handlesInText = foundHandles || (text.match(/@[a-zA-Z0-9_.]{3,30}/g) || []).filter((v, i, a) => a.indexOf(v) === i);
    
    const blocks = text.split('===').filter(b => b.trim().length > 30);
    
    const gv = (txt: string, key: string): string => {
      const match = txt.match(new RegExp(key + '[\\s\\t]*(.+)', 'i'));
      return match ? match[1].trim() : '';
    };

    const gs = (txt: string): number => {
      let m = txt.match(/OVERALL:[\s\t]*(\d+(?:\.\d+)?)\/10/i);
      if (m) return Math.min(10, Math.max(1, parseFloat(m[1])));
      m = txt.match(/BRAND FIT SCORE:[\s\t]*(\d+(?:\.\d+)?)/i);
      if (m) return Math.min(10, Math.max(1, parseFloat(m[1])));
      m = txt.match(/(?:score|overall)[^0-9]*(\d+(?:\.\d+)?)\/10/i);
      if (m) return Math.min(10, Math.max(1, parseFloat(m[1])));
      return 7;
    };

    const gfresh = (txt: string): 'fresh' | 'moderate' | 'stale' => {
      const f = gv(txt, 'DATA FRESHNESS').toLowerCase();
      if (f.includes('recent') || f.includes('2026') || f.includes('2025')) return 'fresh';
      if (f.includes('moderate') || f.includes('2024')) return 'moderate';
      return 'stale';
    };

    // Parse structured blocks first
    blocks.slice(0, 10).forEach((block, i) => {
      const handle = gv(block, 'HANDLE');
      if (!handle || handle.includes('@username')) return;
      
      profiles.push({
        handle,
        name: gv(block, 'NAME') || handle.replace('@', ''),
        followers: gv(block, 'FOLLOWERS') || 'Verify on platform',
        city: gv(block, 'CITY') || 'India',
        platform,
        score: gs(block),
        style: gv(block, 'CONTENT STYLE') || 'Lifestyle',
        whyFit: gv(block, 'WHY THEY FIT') || 'Good brand alignment',
        flags: gv(block, 'RED FLAGS') || 'None',
        contact: gv(block, 'CONTACT') || 'Check bio',
        dm: gv(block, 'OUTREACH DM') || gv(block, 'DM') || `Hey ${handle.replace('@', '')}! Love your content. Would love to collab. DM us!`,
        freshness: gfresh(block)
      });
    });

    // If no structured profiles found but we have handles, create cards anyway
    if (profiles.length === 0 && handlesInText.length > 0) {
      handlesInText.slice(0, 10).forEach((handle, i) => {
        const handleStr = handle.startsWith('@') ? handle : '@' + handle;
        const nameMatch = text.match(new RegExp(handle.replace('@', '') + '[^\\n]*?([A-Z][a-zA-Z]+\\s+[A-Z][a-zA-Z]+)', 'i'));
        const name = nameMatch ? nameMatch[1] : handleStr.replace('@', '');
        const followersMatch = text.match(/(\d+[\.,]?\d*[KkMm]?)\s*(?:followers?|subscribers?)/i);
        
        profiles.push({
          handle: handleStr,
          name,
          followers: followersMatch ? followersMatch[1] + ' followers' : 'Verify on platform',
          city: 'India',
          platform,
          score: Math.floor(Math.random() * 3) + 7,
          style: 'Lifestyle',
          whyFit: 'Found in search results',
          flags: 'None',
          contact: 'Check bio',
          dm: `Hey ${handleStr.replace('@', '')}! Love your content. Would love to collab. DM us!`,
          freshness: 'moderate'
        });
      });
    }

    return profiles;
  };

  const runFind = async () => {
    if (!brand || !niche) return;
    
    setSearchResults([]);
    setRawResponse('');
    setIsSearching(true);
    
    try {
      const searchResultsData = await searchInfluencers(niche, {
        niche,
        platform,
        city,
        tier: tierMap[tier],
        limit: parseInt(count)
      });

      console.log('[DEBUG] Search results:', searchResultsData.results?.length, 'handles:', searchResultsData.handles);
      setSearchHandles(searchResultsData.handles || []);
      
      const handlesText = searchResultsData.handles?.length 
        ? `Found ${searchResultsData.handles.length} influencer handles: ${searchResultsData.handles.slice(0, 15).join(', ')}`
        : '';

      const prompt = `${handlesText}

For each real influencer found, provide structured data in this format:

=== 
HANDLE: @influencer_handle
NAME: Full Name
FOLLOWERS: 50K
CITY: Mumbai
CONTENT STYLE: Fashion, Lifestyle
WHY THEY FIT: Good brand alignment
RED FLAGS: None
CONTACT: DM open
DATA FRESHNESS: Recent
OUTREACH DM: Your personalized DM message
===

Search results:
${searchResultsData.results.slice(0, 10).map((r: any) => `${r.title}: ${r.snippet}`).join('\n\n')}`;

      await sendMessage([
        { role: 'system', content: 'You are an influencer marketing expert. Extract REAL influencer profiles from search results. For each real profile provide structured data. If no real handles found, still analyze the search results and provide best guesses with verified handles from the data.' },
        { role: 'user', content: prompt }
      ], { task: 'influencer' });
      
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (response && response.length > 50) {
      setRawResponse(response);
      console.log('[DEBUG] searchHandles:', searchHandles);
      const parsed = parseInfluencerResponse(response, searchHandles);
      console.log('[DEBUG] Parsed profiles:', parsed);
      if (parsed.length > 0) {
        alert(`Showing ${parsed.length} influencer cards!`);
      }
      setSearchResults(parsed);
    } else {
      console.log('[DEBUG] No response or too short. response length:', response?.length);
    }
  }, [response, searchHandles]);

  const saveToShortlist = (profile: InfluencerProfile) => {
    if (shortlist.find(s => s.handle === profile.handle)) return;
    setShortlist([...shortlist, profile]);
  };

  const removeFromShortlist = (handle: string) => {
    setShortlist(shortlist.filter(s => s.handle !== handle));
  };

  const copyDM = (dm: string) => {
    navigator.clipboard.writeText(dm);
  };

  const getInitials = (handle: string) => {
    const h = handle.replace('@', '').substring(0, 2).toUpperCase();
    return h;
  };

  const tabs = [
    { id: 'find', label: 'Find influencers' },
    { id: 'pitch', label: 'Pitch DMs' },
    { id: 'dmauto', label: 'Auto DM' },
    { id: 'brief', label: 'Creator brief' },
    { id: 'track', label: 'Campaign tracker' },
    { id: 'shortlist', label: `My Shortlist (${shortlist.length})` },
  ] as const;

  return (
    <>
      <div className="stabs">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'find' && (
        <>
          <div className="notice n-green">
            🔍 Uses live search to find real profiles. Always verify follower counts on platform before DMing.
          </div>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Your brand & product</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Kshm — Ayurvedic skincare brand" />
            </div>
            <div className="field">
              <label className="lbl">Influencer niche</label>
              <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. yoga & wellness, skincare, food" />
            </div>
          </div>
          <div className="g3 mb-4">
            <div className="field">
              <label className="lbl">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>Twitter / X</option>
                <option>LinkedIn</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">Follower range</label>
              <select value={tier} onChange={(e) => setTier(e.target.value)}>
                <option>Nano (1k–10k)</option>
                <option>Micro (10k–100k)</option>
                <option>Mid-tier (100k–500k)</option>
                <option>Macro (500k+)</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">City / region</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai, Delhi, Bangalore" />
            </div>
          </div>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Content style (optional)</label>
              <input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g. aesthetic reels, educational content" />
            </div>
            <div className="field">
              <label className="lbl">What you are offering</label>
              <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. free products + 10% commission" />
            </div>
          </div>
          <div className="field mb-5">
            <label className="lbl">Number of profiles to find</label>
            <select value={count} onChange={(e) => setCount(e.target.value)} style={{ width: '200px' }}>
              <option value="5">5 profiles</option>
              <option value="8">8 profiles</option>
              <option value="10">10 profiles</option>
            </select>
          </div>
          <button onClick={runFind} disabled={isLoading || isSearching || !brand || !niche} className="run-btn btn-purple">
            {isLoading || isSearching ? 'Searching...' : 'Find influencers ✦'}
          </button>
        </>
      )}

      {activeTab === 'pitch' && (
        <>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Your brand & offer</label>
              <input value={pitchBrand} onChange={(e) => setPitchBrand(e.target.value)} placeholder="e.g. FreshBrew organic teas — free product + 15% commission" />
            </div>
            <div className="field">
              <label className="lbl">Influencer tier</label>
              <select value={pitchTier} onChange={(e) => setPitchTier(e.target.value)}>
                <option>Nano (1k–10k)</option>
                <option>Micro (10k–100k)</option>
                <option>Mid-tier (100k–500k)</option>
                <option>Macro (500k+)</option>
              </select>
            </div>
          </div>
          <div className="field mb-5">
            <label className="lbl">Platform</label>
            <select value={pitchPlatform} onChange={(e) => setPitchPlatform(e.target.value)} style={{ width: '300px' }}>
              <option>Instagram</option>
              <option>YouTube</option>
              <option>Twitter / X</option>
              <option>LinkedIn</option>
            </select>
          </div>
          <button onClick={() => sendMessage([{ role: 'user', content: `Write 3 pitch DM templates for ${pitchBrand}. Influencer tier: ${pitchTier}. Platform: ${pitchPlatform}. Include casual, professional, and value-first approaches.` }], { task: 'content' })} disabled={isLoading || !pitchBrand} className="run-btn btn-purple">
            {isLoading ? 'Generating...' : 'Write pitch DMs ✦'}
          </button>
        </>
      )}

      {activeTab === 'dmauto' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>🤖 Auto DM</div>
          <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>Automatically send personalized DMs to influencers</div>
          <div className="notice n-purple">⚡ Coming Soon</div>
        </div>
      )}

      {activeTab === 'brief' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Creator name</label>
              <input value={briefCreator} onChange={(e) => setBriefCreator(e.target.value)} placeholder="e.g. @fitnesswithpriya" />
            </div>
            <div className="field">
              <label className="lbl">Product / service</label>
              <input value={briefProduct} onChange={(e) => setBriefProduct(e.target.value)} placeholder="e.g. Summer skincare collection" />
            </div>
          </div>
          <div className="field mb-4">
            <label className="lbl">Deliverables</label>
            <input value={briefDeliverables} onChange={(e) => setBriefDeliverables(e.target.value)} placeholder="e.g. 1 Reel + 3 stories + link in bio" />
          </div>
          <div className="field mb-5">
            <label className="lbl">Brand guidelines</label>
            <textarea value={briefGuidelines} onChange={(e) => setBriefGuidelines(e.target.value)} placeholder="e.g. Use brand colors, mention discount code, no competitor products..." rows={3} />
          </div>
          <button onClick={() => sendMessage([{ role: 'user', content: `Create a detailed creator brief for ${briefCreator}. Product: ${briefProduct}. Deliverables: ${briefDeliverables}. Guidelines: ${briefGuidelines}. Include timeline, compensation, do's and don'ts, and hashtag requirements.` }], { task: 'content' })} disabled={isLoading || !briefCreator} className="run-btn btn-purple">
            {isLoading ? 'Generating...' : 'Generate brief ✦'}
          </button>
        </>
      )}

      {activeTab === 'track' && (
        <>
          <div className="notice n-green mb-4">
            📊 Track your influencer campaigns from pitch to post. Get a spreadsheet-ready structure.
          </div>
          <div className="field mb-4">
            <label className="lbl">Brand / Campaign name</label>
            <input value={trackBrand} onChange={(e) => setTrackBrand(e.target.value)} placeholder="e.g. Kshm Summer Campaign" />
          </div>
          <button onClick={() => sendMessage([{ role: 'user', content: `Create an influencer tracking spreadsheet structure for ${trackBrand}. Include columns: influencer name, handle, platform, followers, engagement rate, posts done, reach, conversions, ROI, status (pitched/replied/posting/completed), notes. Also provide tips for tracking effectiveness.` }], { task: 'content' })} disabled={isLoading || !trackBrand} className="run-btn btn-purple">
            {isLoading ? 'Generating...' : 'Generate tracker ✦'}
          </button>
        </>
      )}

      {activeTab === 'shortlist' && (
        <>
          {shortlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
              No saved influencers yet. Save some from the Find tab!
            </div>
          ) : (
            <div className="flex-col gap-3">
              {shortlist.map((inf, i) => (
                <div key={i} className="output-wrap">
                  <div className="output-header">
                    <div className="output-label text-purple">
                      <span className="dot-purple"></span>
                      {inf.handle}
                    </div>
                    <button onClick={() => removeFromShortlist(inf.handle)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>🗑️</button>
                  </div>
                  <div className="output-box output-purple">
                    <div className="g2">
                      <div><strong>Name:</strong> {inf.name}</div>
                      <div><strong>Followers:</strong> {inf.followers}</div>
                      <div><strong>City:</strong> {inf.city}</div>
                      <div><strong>Score:</strong> {inf.score}/10</div>
                    </div>
                    <div style={{ marginTop: '8px' }}><strong>Why Fit:</strong> {inf.whyFit}</div>
                    <div style={{ marginTop: '8px' }}><strong>DM:</strong> {inf.dm}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {searchResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button className="run-btn" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>📥 Export CSV</button>
            <button className="run-btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)' }}>📋 Copy for Notion</button>
          </div>
          
          <div className="notice" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '12px', padding: '12px' }}>
            <strong>⚠️ Always verify before DMing:</strong> Check profile is PUBLIC, confirm follower count on platform, verify last post date.
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {searchResults.map((profile, i) => (
              <div key={i} style={{ 
                background: 'var(--bg-card)', 
                borderRadius: '16px', 
                padding: '16px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px',
                    background: COLORS[i % COLORS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {getInitials(profile.handle)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a 
                        href={`https://instagram.com/${profile.handle.replace('@', '')}`} 
                        target="_blank" 
                        style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        {profile.handle}
                      </a>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        background: profile.freshness === 'fresh' ? 'rgba(74,222,128,0.2)' : profile.freshness === 'moderate' ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)',
                        color: profile.freshness === 'fresh' ? '#4ade80' : profile.freshness === 'moderate' ? '#fbbf24' : '#ef4444'
                      }}>
                        {profile.freshness === 'fresh' ? '🟢 Recent' : profile.freshness === 'moderate' ? '🟡 Moderate' : '🔴 Verify'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#71717a' }}>{profile.name} · {profile.city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{profile.followers}</div>
                    <div style={{ fontSize: '12px', color: '#71717a' }}>followers</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: '#a855f7' }}>🎨</span> {profile.style}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1, height: '6px', background: '#27272a', borderRadius: '3px' }}>
                    <div style={{ width: `${profile.score * 10}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>{profile.score}/10</span>
                </div>

                <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>
                  <strong>Why they fit:</strong> {profile.whyFit}
                </div>

                {profile.flags && profile.flags !== 'None' && (
                  <div style={{ fontSize: '11px', color: '#d97706', marginBottom: '8px', padding: '6px', background: 'rgba(245,158,11,0.1)', borderRadius: '6px' }}>
                    ⚠️ {profile.flags}
                  </div>
                )}

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px' }}>📧 Ready-to-send DM</div>
                  <div style={{ fontSize: '12px' }}>{profile.dm}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => copyDM(profile.dm)} className="run-btn" style={{ padding: '8px 12px', fontSize: '12px' }}>Copy DM</button>
                  <button 
                    onClick={() => window.open(`https://www.google.com/search?q=${profile.name}+${profile.platform}+profile`, '_blank')} 
                    className="run-btn" 
                    style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                  >
                    🔍 Search
                  </button>
                  <button onClick={() => saveToShortlist(profile)} className="run-btn" style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
                    ⭐ Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(response || error) && searchResults.length === 0 && (
        <div className="output-wrap mt-4">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Analysis
            </div>
          </div>
          <div className="output-box output-purple">
            {error || response}
          </div>
        </div>
      )}
    </>
  );
}
