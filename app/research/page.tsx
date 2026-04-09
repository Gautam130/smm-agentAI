'use client';

import { useState } from 'react';

type TabType = 'market' | 'competitor' | 'audience' | 'trends';

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<TabType>('market');
  
  const [industry, setIndustry] = useState('');
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  
  const [competitor, setCompetitor] = useState('');
  const [compPlatform, setCompPlatform] = useState('Instagram');
  
  const [audienceAge, setAudienceAge] = useState('25-34');
  const [audienceInterest, setAudienceInterest] = useState('');
  
  const [trendsNiche, setTrendsNiche] = useState('');
  
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

  const runMarket = () => generate(`Provide a comprehensive market research report for ${industry}. Product: ${product}. Target audience: ${targetAudience}. Include market size, key players, trends, and opportunities.`);
  const runCompetitor = () => generate(`Analyze competitor ${competitor} on ${compPlatform}. Include their content strategy, top posts, engagement tactics, and what's working for them.`);
  const runAudience = () => generate(`Research target audience: ${audienceAge} age group interested in ${audienceInterest}. Include their social media behavior, preferred content types, peak activity times, and pain points.`);
  const runTrends = () => generate(`Find trending topics and hashtags in ${trendsNiche} for the last 30 days. Include viral content patterns and emerging creators.`);

  const tabs = [
    { id: 'market', label: 'Market Research' },
    { id: 'competitor', label: 'Competitor Analysis' },
    { id: 'audience', label: 'Audience Insights' },
    { id: 'trends', label: 'Trend Tracking' },
  ] as const;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #00ffcc' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(0,255,204,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#00ffcc' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'market' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Industry / niche</label><input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. organic skincare, fitness" style={inputStyle} /></div>
              <div><label style={labelStyle}>Product / service</label><input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. vitamin C serum" style={inputStyle} /></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Target audience</label><input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. women 25-40, urban professionals" style={inputStyle} /></div>
            <button onClick={runMarket} disabled={loading || !industry} style={btnStyle}>{loading ? 'Researching...' : 'Generate Market Report ✦'}</button>
          </>
        )}

        {activeTab === 'competitor' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Competitor name or handle</label><input value={competitor} onChange={(e) => setCompetitor(e.target.value)} placeholder="e.g. @competitorbrand" style={inputStyle} /></div>
              <div><label style={labelStyle}>Platform</label><select value={compPlatform} onChange={(e) => setCompPlatform(e.target.value)} style={inputStyle}><option>Instagram</option><option>YouTube</option><option>LinkedIn</option><option>Twitter/X</option></select></div>
            </div>
            <button onClick={runCompetitor} disabled={loading || !competitor} style={btnStyle}>{loading ? 'Analyzing...' : 'Analyze Competitor ✦'}</button>
          </>
        )}

        {activeTab === 'audience' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Age group</label><select value={audienceAge} onChange={(e) => setAudienceAge(e.target.value)} style={inputStyle}><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55+</option></select></div>
              <div><label style={labelStyle}>Interests</label><input value={audienceInterest} onChange={(e) => setAudienceInterest(e.target.value)} placeholder="e.g. fitness, fashion, tech" style={inputStyle} /></div>
            </div>
            <button onClick={runAudience} disabled={loading || !audienceInterest} style={btnStyle}>{loading ? 'Researching...' : 'Get Audience Insights ✦'}</button>
          </>
        )}

        {activeTab === 'trends' && (
          <>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Niche / industry to track</label><input value={trendsNiche} onChange={(e) => setTrendsNiche(e.target.value)} placeholder="e.g. sustainable fashion, wellness" style={inputStyle} /></div>
            <button onClick={runTrends} disabled={loading || !trendsNiche} style={btnStyle}>{loading ? 'Tracking...' : 'Find Trending Topics ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ffcc' }}></span>Research Results</div>
            <div style={{ display: 'flex', gap: '6px' }}><button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button></div>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{result}</div>
        </div>
      )}
    </div>
  );
}