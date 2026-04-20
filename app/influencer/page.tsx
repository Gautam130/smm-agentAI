'use client';

import { useState } from 'react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { searchInfluencers } from '@/lib/api/search';

type TabType = 'find' | 'pitch' | 'dmauto' | 'brief' | 'track' | 'shortlist';

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
  const [searchResults, setSearchResults] = useState<any>(null);
  const { response, isLoading, error, sendMessage } = useStreamingChat();

  const tierMap: Record<string, string> = {
    'Nano (1k–10k)': 'nano',
    'Micro (10k–100k)': 'micro',
    'Mid-tier (100k–500k)': 'mid',
    'Macro (500k+)': 'macro'
  };

  const runFind = async () => {
    if (!brand || !niche) return;
    
    setSearchResults(null);
    
    try {
      const results = await searchInfluencers(niche, {
        niche,
        platform,
        city,
        tier: tierMap[tier],
        limit: parseInt(count)
      });
      setSearchResults(results);
      
      const handlesText = results.handles?.length 
        ? `Found ${results.handles.length} influencer handles: ${results.handles.slice(0, 10).join(', ')}`
        : 'No specific handles found. Here are relevant profiles:';
      
      const summaryPrompt = `${handlesText}

Provide a summary of these influencer search results. For each influencer, include:
- Profile name/handle
- Why they're a good fit for ${brand} (${niche})
- Engagement potential
- Suggested outreach approach

Search results:
${results.results.slice(0, 8).map((r: any) => `${r.title}: ${r.snippet}`).join('\n\n')}`;

      await sendMessage([
        { role: 'system', content: 'You are an influencer marketing expert. Analyze influencer profiles and provide actionable insights.' },
        { role: 'user', content: summaryPrompt }
      ], { task: 'influencer' });
      
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const runPitch = async () => {
    if (!pitchBrand) return;
    
    const prompt = `Write 3 pitch DM templates for ${pitchBrand}. Influencer tier: ${pitchTier}. Platform: ${pitchPlatform}. Include a casual version, professional version, and value-first approach.`;
    
    await sendMessage([
      { role: 'user', content: prompt }
    ], { task: 'content' });
  };

  const runBrief = async () => {
    if (!briefCreator) return;
    
    const prompt = `Create a detailed creator brief for ${briefCreator}. Product: ${briefProduct}. Deliverables: ${briefDeliverables}. Guidelines: ${briefGuidelines}. Include timeline, compensation, do's and don'ts, and hashtag requirements.`;
    
    await sendMessage([
      { role: 'user', content: prompt }
    ], { task: 'content' });
  };

  const runTrack = async () => {
    if (!trackBrand) return;
    
    const prompt = `Create an influencer tracking spreadsheet structure for ${trackBrand}. Include columns for: influencer name, handle, platform, followers, engagement rate, posts done, reach, conversions, ROI, status (pitched/replied/posting/completed), notes. Also provide tips for tracking effectiveness.`;
    
    await sendMessage([
      { role: 'user', content: prompt }
    ], { task: 'content' });
  };

  const tabs = [
    { id: 'find', label: 'Find influencers' },
    { id: 'pitch', label: 'Pitch DMs' },
    { id: 'dmauto', label: 'Auto DM' },
    { id: 'brief', label: 'Creator brief' },
    { id: 'track', label: 'Campaign tracker' },
    { id: 'shortlist', label: 'My Shortlist' },
  ] as const;

  return (
    <>
      <div className="stabs">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
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
          <button onClick={runFind} disabled={isLoading || !brand || !niche} className="run-btn btn-purple">
            {isLoading ? 'Searching...' : 'Find influencers ✦'}
          </button>

          {searchResults && searchResults.handles && searchResults.handles.length > 0 && (
            <div className="output-wrap" style={{ marginTop: '20px' }}>
              <div className="output-header">
                <div className="output-label text-purple">
                  <span className="dot-purple"></span>
                  Found Handles
                </div>
              </div>
              <div className="output-box" style={{ background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {searchResults.handles.map((handle: string, idx: number) => (
                    <span key={idx} style={{ 
                      background: 'rgba(168,85,247,0.2)', 
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      fontSize: '13px',
                      color: '#a855f7'
                    }}>
                      {handle}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
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
          <button onClick={runPitch} disabled={isLoading || !pitchBrand} className="run-btn btn-purple">
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
          <button onClick={runBrief} disabled={isLoading || !briefCreator} className="run-btn btn-purple">
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
            <input 
              value={trackBrand} 
              onChange={(e) => setTrackBrand(e.target.value)} 
              placeholder="e.g. Kshm Summer Campaign" 
            />
          </div>
          <button onClick={runTrack} disabled={isLoading || !trackBrand} className="run-btn btn-purple">
            {isLoading ? 'Generating...' : 'Generate tracker ✦'}
          </button>
        </>
      )}

      {activeTab === 'shortlist' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>⭐ My Shortlist</div>
          <div style={{ fontSize: '14px', color: '#71717a' }}>Your saved influencers will appear here</div>
        </div>
      )}
      
      {(response || error) && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Results
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'influencer' })} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="excel-export-btn">📄 Excel</button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(response)}>Copy</button>
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
