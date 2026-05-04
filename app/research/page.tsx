'use client';

import { useState } from 'react';
import { saveOutput } from '@/lib/save';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !result || saved) return;
    const res = await saveOutput({
      module: 'research',
      title: `Research ${activeTab}: ${industry || competitor || audienceInterest || trendsNiche}`,
      content: result,
      metadata: { tab: activeTab },
      userId: user.id,
    });
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

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

  return (
    <>
      <div className="stabs">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} className={`stab ${activeTab === tab.id ? 'active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'market' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Industry / niche</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. organic skincare, fitness" />
            </div>
            <div className="field">
              <label className="lbl">Product / service</label>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. vitamin C serum" />
            </div>
          </div>
          <div className="field mb-5">
            <label className="lbl">Target audience</label>
            <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. women 25-40, urban professionals" />
          </div>
          <button onClick={runMarket} disabled={loading || !industry} className="run-btn">
            {loading ? 'Researching...' : 'Generate Market Report ✦'}
          </button>
        </>
      )}

      {activeTab === 'competitor' && (
        <>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Competitor name or handle</label>
              <input value={competitor} onChange={(e) => setCompetitor(e.target.value)} placeholder="e.g. @competitorbrand" />
            </div>
            <div className="field">
              <label className="lbl">Platform</label>
              <select value={compPlatform} onChange={(e) => setCompPlatform(e.target.value)}>
                <option>Instagram</option>
                <option>YouTube</option>
                <option>LinkedIn</option>
                <option>Twitter/X</option>
              </select>
            </div>
          </div>
          <button onClick={runCompetitor} disabled={loading || !competitor} className="run-btn">
            {loading ? 'Analyzing...' : 'Analyze Competitor ✦'}
          </button>
        </>
      )}

      {activeTab === 'audience' && (
        <>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Age group</label>
              <select value={audienceAge} onChange={(e) => setAudienceAge(e.target.value)}>
                <option>18-24</option>
                <option>25-34</option>
                <option>35-44</option>
                <option>45-54</option>
                <option>55+</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">Interests</label>
              <input value={audienceInterest} onChange={(e) => setAudienceInterest(e.target.value)} placeholder="e.g. fitness, fashion, tech" />
            </div>
          </div>
          <button onClick={runAudience} disabled={loading || !audienceInterest} className="run-btn">
            {loading ? 'Researching...' : 'Get Audience Insights ✦'}
          </button>
        </>
      )}

      {activeTab === 'trends' && (
        <>
          <div className="field mb-5">
            <label className="lbl">Niche / industry to track</label>
            <input value={trendsNiche} onChange={(e) => setTrendsNiche(e.target.value)} placeholder="e.g. sustainable fashion, wellness" />
          </div>
          <button onClick={runTrends} disabled={loading || !trendsNiche} className="run-btn">
            {loading ? 'Tracking...' : 'Find Trending Topics ✦'}
          </button>
        </>
      )}
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Research Results
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="save-output-btn" onClick={handleSave} disabled={saved}>
                {saved ? 'Saved ✓' : 'Save'}
              </button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box">
            {result}
          </div>
        </div>
      )}
    </>
  );
}