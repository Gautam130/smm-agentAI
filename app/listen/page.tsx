'use client';

import { useState } from 'react';

type TabType = 'monitor' | 'newsjack' | 'sentiment';

export default function ListenPage() {
  const [activeTab, setActiveTab] = useState<TabType>('monitor');
  
  const [brand, setBrand] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [audience, setAudience] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [monitorType, setMonitorType] = useState('Brand mentions & sentiment');
  
  const [njBrand, setNjBrand] = useState('');
  const [njPlatform, setNjPlatform] = useState('Instagram');
  
  const [sentBrand, setSentBrand] = useState('');
  const [sentIndustry, setSentIndustry] = useState('');
  const [sentType, setSentType] = useState('Overall public sentiment right now');
  
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

  const runMonitor = () => generate(`Monitor brand: ${brand}. Industry: ${industry}. City: ${city}. Audience: ${audience}. Competitors: ${competitors}. What to monitor: ${monitorType}. Provide a comprehensive monitoring report.`);
  const runNewsjack = () => generate(`Find today's newsjacking opportunities for ${njBrand}. Platform: ${njPlatform}. What trending topics can we leverage for this brand?`);
  const runSentiment = () => generate(`Check sentiment for ${sentBrand} in ${sentIndustry} industry. What to find: ${sentType}. Provide detailed sentiment analysis.`);

  const tabs = [
    { id: 'monitor', label: 'Brand monitoring' },
    { id: 'newsjack', label: 'What to newsjack' },
    { id: 'sentiment', label: 'Sentiment check' },
  ] as const;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const selectStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #00ffcc' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#00ffcc', marginBottom: '16px', padding: '12px', background: 'rgba(0,255,204,0.05)', borderRadius: '8px' }}>
          🌐 Uses live web search — results based on what's actually happening right now.
        </div>
        
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(0,255,204,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#00ffcc' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'monitor' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Brand name</label><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Kshm, FreshBrew, YourBrand" style={inputStyle} /></div>
              <div><label style={labelStyle}>Industry / niche</label><input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. D2C yoga pants, organic skincare, chai" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>City / region</label><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jaipur, Delhi NCR, Pan-India" style={inputStyle} /></div>
              <div><label style={labelStyle}>Target audience</label><input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. women 25-35, gym-goers, students" style={inputStyle} /></div>
            </div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Known competitors (optional)</label><input value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="e.g. Bhaane, Nicobar, FabIndia — leave blank if unsure" style={inputStyle} /></div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>What to monitor</label><select value={monitorType} onChange={(e) => setMonitorType(e.target.value)} style={selectStyle}><option>Brand mentions & sentiment</option><option>Competitor activity this week</option><option>Industry conversations to join</option><option>Negative sentiment to address</option></select></div>
            <button onClick={runMonitor} disabled={loading || !brand} style={btnStyle}>{loading ? 'Monitoring...' : 'Search & monitor ✦'}</button>
          </>
        )}

        {activeTab === 'newsjack' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Your brand / niche</label><input value={njBrand} onChange={(e) => setNjBrand(e.target.value)} placeholder="e.g. fashion brand, fintech startup, food brand" style={inputStyle} /></div>
              <div><label style={labelStyle}>Platform</label><select value={njPlatform} onChange={(e) => setNjPlatform(e.target.value)} style={selectStyle}><option>Instagram</option><option>Twitter / X</option><option>LinkedIn</option></select></div>
            </div>
            <button onClick={runNewsjack} disabled={loading || !njBrand} style={btnStyle}>{loading ? 'Finding opportunities...' : "Find today's opportunities ✦"}</button>
          </>
        )}

        {activeTab === 'sentiment' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Brand or topic to check</label><input value={sentBrand} onChange={(e) => setSentBrand(e.target.value)} placeholder="e.g. Kshm, yoga pants India, your niche" style={inputStyle} /></div>
              <div><label style={labelStyle}>Industry / niche</label><input value={sentIndustry} onChange={(e) => setSentIndustry(e.target.value)} placeholder="e.g. D2C fashion, organic food, fitness" style={inputStyle} /></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>What you want to know</label><select value={sentType} onChange={(e) => setSentType(e.target.value)} style={selectStyle}><option>Overall public sentiment right now</option><option>What people are complaining about</option><option>What people love / praise</option><option>Emerging controversies to be aware of</option></select></div>
            <button onClick={runSentiment} disabled={loading || !sentBrand} style={btnStyle}>{loading ? 'Checking sentiment...' : 'Check sentiment ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffcc' }}>
              {activeTab === 'monitor' && 'Monitoring Report'}
              {activeTab === 'newsjack' && "Newsjacking Opportunities"}
              {activeTab === 'sentiment' && 'Sentiment Report'}
            </div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}