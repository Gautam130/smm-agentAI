'use client';

import { useState } from 'react';

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
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                text += parsed.choices[0].delta.content;
              }
            } catch {}
          }
        }
      }
      setResult(text || 'No response');
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const runFind = () => generate(`Find ${count} ${tier} influencers for ${brand}. Niche: ${niche}. Platform: ${platform}. City: ${city}. Content style: ${style}. Offer: ${offer}. Include their handles, follower counts, and engagement rates.`);
  const runPitch = () => generate(`Write 3 pitch DM templates for ${pitchBrand}. Influencer tier: ${pitchTier}. Platform: ${pitchPlatform}. Include a casual version, professional version, and value-first approach.`);
  const runBrief = () => generate(`Create a detailed creator brief for ${briefCreator}. Product: ${briefProduct}. Deliverables: ${briefDeliverables}. Guidelines: ${briefGuidelines}. Include timeline, compensation, do's and don'ts, and hashtag requirements.`);

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
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
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
          <button onClick={runFind} disabled={loading || !brand || !niche} className="run-btn btn-purple">
            {loading ? 'Searching...' : 'Find influencers ✦'}
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
          <button onClick={runPitch} disabled={loading || !pitchBrand} className="run-btn btn-purple">
            {loading ? 'Generating...' : 'Write pitch DMs ✦'}
          </button>
        </>
      )}

      {activeTab === 'dmauto' && (
        <>
          <div className="notice mb-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', padding: '16px', borderRadius: '12px' }}>
            🤖 <strong>Auto DM System</strong> — Automatically send personalized DMs to influencers from your shortlist.
          </div>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Campaign name</label>
              <input placeholder="e.g. Diwali influencer outreach" />
            </div>
            <div className="field">
              <label className="lbl">DM Template</label>
              <select>
                <option>Welcome - Free product</option>
                <option>Collaboration offer</option>
                <option>Follow up</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
          <div className="field mb-4">
            <label className="lbl">Selected influencers (from Shortlist)</label>
            <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No influencers in shortlist. Add influencers from "Find influencers" tab.
            </div>
          </div>
          <button className="run-btn btn-purple">Start Auto DM ✦</button>
        </>
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
          <button onClick={runBrief} disabled={loading || !briefCreator} className="run-btn btn-purple">
            {loading ? 'Generating...' : 'Generate brief ✦'}
          </button>
        </>
      )}

      {activeTab === 'track' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>📊 Campaign Tracker</div>
          <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>Track your influencer campaigns from pitch to post</div>
          <div className="notice n-purple">⚡ Coming Soon</div>
        </div>
      )}

      {activeTab === 'shortlist' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>⭐ My Shortlist</div>
          <div style={{ fontSize: '14px', color: '#71717a' }}>Your saved influencers will appear here</div>
        </div>
      )}
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Results
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="excel-export-btn">📄 Excel</button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box output-purple">
            {result}
          </div>
        </div>
      )}
    </>
  );
}