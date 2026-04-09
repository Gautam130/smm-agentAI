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

  return (
    <>
      <h2 className="module-title">👂 Listen</h2>
      
      <div className="info-box mb-4" style={{ color: 'var(--accent)', background: 'rgba(0,255,204,0.05)' }}>
        🌐 Uses live web search — results based on what's actually happening right now.
      </div>
      
      <div className="tabs mb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'monitor' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Brand name</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Kshm, FreshBrew, YourBrand" />
            </div>
            <div className="field">
              <label className="lbl">Industry / niche</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. D2C yoga pants, organic skincare, chai" />
            </div>
          </div>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">City / region</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jaipur, Delhi NCR, Pan-India" />
            </div>
            <div className="field">
              <label className="lbl">Target audience</label>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. women 25-35, gym-goers, students" />
            </div>
          </div>
          <div className="field mb-4">
            <label className="lbl">Known competitors (optional)</label>
            <input value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="e.g. Bhaane, Nicobar, FabIndia — leave blank if unsure" />
          </div>
          <div className="field mb-4">
            <label className="lbl">What to monitor</label>
            <select value={monitorType} onChange={(e) => setMonitorType(e.target.value)}>
              <option>Brand mentions & sentiment</option>
              <option>Competitor activity this week</option>
              <option>Industry conversations to join</option>
              <option>Negative sentiment to address</option>
            </select>
          </div>
          <button onClick={runMonitor} disabled={loading || !brand} className="run-btn">{loading ? 'Monitoring...' : 'Search & monitor ✦'}</button>
        </>
      )}

      {activeTab === 'newsjack' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Your brand / niche</label>
              <input value={njBrand} onChange={(e) => setNjBrand(e.target.value)} placeholder="e.g. fashion brand, fintech startup, food brand" />
            </div>
            <div className="field">
              <label className="lbl">Platform</label>
              <select value={njPlatform} onChange={(e) => setNjPlatform(e.target.value)}>
                <option>Instagram</option>
                <option>Twitter / X</option>
                <option>LinkedIn</option>
              </select>
            </div>
          </div>
          <button onClick={runNewsjack} disabled={loading || !njBrand} className="run-btn">{loading ? 'Finding opportunities...' : "Find today's opportunities ✦"}</button>
        </>
      )}

      {activeTab === 'sentiment' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Brand or topic to check</label>
              <input value={sentBrand} onChange={(e) => setSentBrand(e.target.value)} placeholder="e.g. Kshm, yoga pants India, your niche" />
            </div>
            <div className="field">
              <label className="lbl">Industry / niche</label>
              <input value={sentIndustry} onChange={(e) => setSentIndustry(e.target.value)} placeholder="e.g. D2C fashion, organic food, fitness" />
            </div>
          </div>
          <div className="field mb-4">
            <label className="lbl">What you want to know</label>
            <select value={sentType} onChange={(e) => setSentType(e.target.value)}>
              <option>Overall public sentiment right now</option>
              <option>What people are complaining about</option>
              <option>What people love / praise</option>
              <option>Emerging controversies to be aware of</option>
            </select>
          </div>
          <button onClick={runSentiment} disabled={loading || !sentBrand} className="run-btn">{loading ? 'Checking sentiment...' : 'Check sentiment ✦'}</button>
        </>
      )}
      
      {result && (
        <div className="output-wrap" style={{ borderLeft: '2px solid var(--accent)' }}>
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              {activeTab === 'monitor' && 'Monitoring Report'}
              {activeTab === 'newsjack' && "Newsjacking Opportunities"}
              {activeTab === 'sentiment' && 'Sentiment Report'}
            </div>
            <button className="action-btn" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
          </div>
          <div className="output-box">
            {result}
          </div>
        </div>
      )}
    </>
  );
}