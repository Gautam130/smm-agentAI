'use client';

import { useState } from 'react';

type TabType = 'copy' | 'strategy' | 'audience';

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('copy');
  
  const [adType, setAdType] = useState('Instagram Reel');
  const [product, setProduct] = useState('');
  const [offer, setOffer] = useState('');
  const [cta, setCta] = useState('Shop Now');
  
  const [campaignGoal, setCampaignGoal] = useState('Brand Awareness');
  const [budget, setBudget] = useState('50000');
  const [duration, setDuration] = useState('30');
  
  const [targetDemographic, setTargetDemographic] = useState('');
  const [interests, setInterests] = useState('');
  
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

  const runCopy = () => generate(`Generate ad copy for ${adType}. Product: ${product}. Offer: ${offer}. CTA: ${cta}. Include multiple variations.`);
  const runStrategy = () => generate(`Create a complete ad campaign strategy. Goal: ${campaignGoal}. Budget: ₹${budget}. Duration: ${duration} days. Include targeting, bidding strategy, and creative recommendations.`);
  const runAudience = () => generate(`Suggest target audience segments for ${targetDemographic}. Interests: ${interests}. Include lookalike audiences and retargeting strategies.`);

  const tabs = [
    { id: 'copy', label: 'Ad Copy' },
    { id: 'strategy', label: 'Campaign Strategy' },
    { id: 'audience', label: 'Targeting' },
  ] as const;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #a855f7' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(168,85,247,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#a855f7' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'copy' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Ad format</label><select value={adType} onChange={(e) => setAdType(e.target.value)} style={inputStyle}><option>Instagram Reel</option><option>Instagram Carousel</option><option>Instagram Story</option><option>Facebook Feed</option><option>LinkedIn Sponsored</option></select></div>
              <div><label style={labelStyle}>Call to action</label><select value={cta} onChange={(e) => setCta(e.target.value)} style={inputStyle}><option>Shop Now</option><option>Learn More</option><option>Sign Up</option><option>Book Now</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Product / service</label><input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Organic face serum" style={inputStyle} /></div>
              <div><label style={labelStyle}>Offer / USP</label><input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. 30% off, free shipping" style={inputStyle} /></div>
            </div>
            <button onClick={runCopy} disabled={loading || !product} style={btnStyle}>{loading ? 'Generating...' : 'Generate Ad Copy ✦'}</button>
          </>
        )}

        {activeTab === 'strategy' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Campaign goal</label><select value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)} style={inputStyle}><option>Brand Awareness</option><option>Lead Generation</option><option>Sales / Conversions</option><option>Traffic / Clicks</option><option>Engagement</option></select></div>
              <div><label style={labelStyle}>Budget (₹)</label><select value={budget} onChange={(e) => setBudget(e.target.value)} style={inputStyle}><option>10000</option><option>25000</option><option>50000</option><option>100000</option><option>250000</option></select></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Campaign duration (days)</label><input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} /></div>
            <button onClick={runStrategy} disabled={loading} style={btnStyle}>{loading ? 'Creating...' : 'Generate Campaign Strategy ✦'}</button>
          </>
        )}

        {activeTab === 'audience' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Demographics</label><input value={targetDemographic} onChange={(e) => setTargetDemographic(e.target.value)} placeholder="e.g. Women 25-45, Tier 1 cities" style={inputStyle} /></div>
              <div><label style={labelStyle}>Interests</label><input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. skincare, wellness, fitness" style={inputStyle} /></div>
            </div>
            <button onClick={runAudience} disabled={loading || !targetDemographic} style={btnStyle}>{loading ? 'Researching...' : 'Get Targeting Suggestions ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }}></span>Results</div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{result}</div>
        </div>
      )}
    </div>
  );
}