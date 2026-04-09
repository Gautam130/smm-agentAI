'use client';

import { useState } from 'react';

type TabType = 'find' | 'pitch' | 'brief' | 'track' | 'shortlist';

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
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setResult(prev => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch { setResult('Error generating content'); }
    setLoading(false);
  };

  const runFind = () => generate(`Find ${count} ${tier} influencers for ${brand}. Niche: ${niche}. Platform: ${platform}. City: ${city}. Content style: ${style}. Offer: ${offer}. Include their handles, follower counts, and engagement rates.`);
  const runPitch = () => generate(`Write 3 pitch DM templates for ${pitchBrand}. Influencer tier: ${pitchTier}. Platform: ${pitchPlatform}. Include a casual version, professional version, and value-first approach.`);
  const runBrief = () => generate(`Create a detailed creator brief for ${briefCreator}. Product: ${briefProduct}. Deliverables: ${briefDeliverables}. Guidelines: ${briefGuidelines}. Include timeline, compensation, do's and don'ts, and hashtag requirements.`);

  const tabs = [
    { id: 'find', label: 'Find influencers' },
    { id: 'pitch', label: 'Pitch DMs' },
    { id: 'brief', label: 'Creator brief' },
    { id: 'track', label: 'Campaign tracker' },
    { id: 'shortlist', label: 'My Shortlist' },
  ] as const;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(''); }}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '10px 16px',
                background: activeTab === tab.id ? 'rgba(168,85,247,0.1)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === tab.id ? '#a855f7' : '#71717a',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'find' && (
          <>
            <div style={{ fontSize: '12px', color: '#00ffcc', marginBottom: '16px', padding: '12px', background: 'rgba(0,255,204,0.05)', borderRadius: '8px' }}>
              🔍 Uses live search to find real profiles. Always verify follower counts on platform before DMing.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Your brand & product</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Kshm — Ayurvedic skincare brand" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Influencer niche</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. yoga & wellness, skincare, food" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={inputStyle}>
                  <option>Instagram</option>
                  <option>YouTube</option>
                  <option>Twitter / X</option>
                  <option>LinkedIn</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Follower range</label>
                <select value={tier} onChange={(e) => setTier(e.target.value)} style={inputStyle}>
                  <option>Nano (1k–10k)</option>
                  <option>Micro (10k–100k)</option>
                  <option>Mid-tier (100k–500k)</option>
                  <option>Macro (500k+)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>City / region</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai, Delhi, Bangalore" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Content style (optional)</label>
                <input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g. aesthetic reels, educational content" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>What you are offering</label>
                <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. free products + 10% commission" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Number of profiles to find</label>
              <select value={count} onChange={(e) => setCount(e.target.value)} style={{ ...inputStyle, width: '200px' }}>
                <option value="5">5 profiles</option>
                <option value="8">8 profiles</option>
                <option value="10">10 profiles</option>
              </select>
            </div>
            <button onClick={runFind} disabled={loading || !brand || !niche} style={purpleBtnStyle}>
              {loading ? 'Searching...' : 'Find influencers ✦'}
            </button>
          </>
        )}

        {activeTab === 'pitch' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Your brand & offer</label>
                <input value={pitchBrand} onChange={(e) => setPitchBrand(e.target.value)} placeholder="e.g. FreshBrew organic teas — free product + 15% commission" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Influencer tier</label>
                <select value={pitchTier} onChange={(e) => setPitchTier(e.target.value)} style={inputStyle}>
                  <option>Nano (1k–10k)</option>
                  <option>Micro (10k–100k)</option>
                  <option>Mid-tier (100k–500k)</option>
                  <option>Macro (500k+)</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Platform</label>
              <select value={pitchPlatform} onChange={(e) => setPitchPlatform(e.target.value)} style={{ ...inputStyle, width: '300px' }}>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>Twitter / X</option>
                <option>LinkedIn</option>
              </select>
            </div>
            <button onClick={runPitch} disabled={loading || !pitchBrand} style={purpleBtnStyle}>
              {loading ? 'Generating...' : 'Write pitch DMs ✦'}
            </button>
          </>
        )}

        {activeTab === 'brief' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Creator name</label>
                <input value={briefCreator} onChange={(e) => setBriefCreator(e.target.value)} placeholder="e.g. @fitnesswithpriya" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Product / service</label>
                <input value={briefProduct} onChange={(e) => setBriefProduct(e.target.value)} placeholder="e.g. Summer skincare collection" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Deliverables</label>
              <input value={briefDeliverables} onChange={(e) => setBriefDeliverables(e.target.value)} placeholder="e.g. 1 Reel + 3 stories + link in bio" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Brand guidelines</label>
              <textarea value={briefGuidelines} onChange={(e) => setBriefGuidelines(e.target.value)} placeholder="e.g. Use brand colors, mention discount code, no competitor products..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <button onClick={runBrief} disabled={loading || !briefCreator} style={purpleBtnStyle}>
              {loading ? 'Generating...' : 'Generate brief ✦'}
            </button>
          </>
        )}

        {activeTab === 'track' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>📊 Campaign Tracker</div>
            <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>Track your influencer campaigns from pitch to post</div>
            <div style={{ padding: '16px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', display: 'inline-block' }}>
              <div style={{ fontSize: '13px', color: '#a855f7' }}>⚡ Coming Soon</div>
            </div>
          </div>
        )}

        {activeTab === 'shortlist' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>⭐ My Shortlist</div>
            <div style={{ fontSize: '14px', color: '#71717a' }}>Your saved influencers will appear here</div>
          </div>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }}></span>
              Results
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={actionBtnStyle}>📄 Excel</button>
              <button style={actionBtnStyle}>Copy</button>
            </div>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#71717a',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111111',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '14px 18px',
  fontSize: '14px',
  color: '#ffffff',
  outline: 'none',
};

const purpleBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const resultStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '24px',
  borderLeft: '2px solid #a855f7',
};

const actionBtnStyle: React.CSSProperties = {
  fontSize: '11px',
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'transparent',
  color: '#a1a1aa',
  cursor: 'pointer',
};