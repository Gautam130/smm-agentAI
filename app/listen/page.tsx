'use client';

import { useState } from 'react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { useSearch } from '@/lib/hooks/useSearch';
import { search } from '@/lib/api/search';

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

  const { response, isLoading, sendMessage } = useStreamingChat();
  const { data: searchData, execute: doSearch, isLoading: searchLoading } = useSearch();

  const runMonitor = async () => {
    if (!brand) return;
    
    const searchQueries = {
      'Brand mentions & sentiment': `${brand} ${industry} India`,
      'Competitor activity this week': `${competitors || industry} competitor activity India`,
      'Industry conversations to join': `${industry} trends India 2026`,
      'Negative sentiment to address': `${brand} complaints issues India`
    };
    
    try {
      await doSearch('serper', searchQueries[monitorType as keyof typeof searchQueries] || brand, { niche: industry, city });
      
      const prompt = `Analyze brand monitoring for ${brand} in ${industry} industry (${city || 'Pan-India'}).

SEARCH RESULTS:
${searchData?.results?.slice(0, 10).map((r: any) => `${r.title}: ${r.snippet}`).join('\n') || 'No search results'}

Provide:
- Current brand mentions and sentiment
- Key conversations happening
- Opportunities to join
- Risks to address`;
      
      await sendMessage([
        { role: 'user', content: prompt }
      ], { task: 'research' });
    } catch (err) {
      console.error(err);
    }
  };

  const runNewsjack = async () => {
    if (!njBrand) return;
    
    try {
      await doSearch('gnews', `trending today India ${njPlatform}`, { niche: njBrand, limit: 10 });
      
      const prompt = `Find newsjacking opportunities for ${njBrand}.

TRENDING NEWS:
${searchData?.results?.slice(0, 8).map((r: any) => `${r.title}: ${r.snippet}`).join('\n') || 'No news found'}

Provide:
- 3-5 trending topics we can tie into
- Suggested angles for ${njPlatform}
- Example hooks for each`;
      
      await sendMessage([
        { role: 'user', content: prompt }
      ], { task: 'research' });
    } catch (err) {
      console.error(err);
    }
  };

  const runSentiment = async () => {
    if (!sentBrand) return;
    
    try {
      const searchQuery = sentType === 'Overall public sentiment right now' 
        ? `${sentBrand} ${sentIndustry} reviews India`
        : sentType === 'What people are complaining about'
        ? `${sentBrand} complaints problems India`
        : `${sentBrand} positive reviews India`;
      
      await doSearch('reddit', searchQuery, { niche: sentIndustry });
      
      const prompt = `Sentiment analysis for ${sentBrand} in ${sentIndustry}.

WHAT PEOPLE ARE SAYING:
${searchData?.results?.slice(0, 10).map((r: any) => `${r.title}: ${r.snippet}`).join('\n') || 'No results found'}

Provide:
- Overall sentiment (positive/negative/mixed)
- Key themes in conversations
- What people love
- What people complain about
- Recommendations for brand`;

      await sendMessage([
        { role: 'user', content: prompt }
      ], { task: 'research' });
    } catch (err) {
      console.error(err);
    }
  };

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
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); }} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
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
            <input value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="e.g. Bhaane, Nicobar, FabIndia" />
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
          <button onClick={runMonitor} disabled={isLoading || searchLoading || !brand} className="run-btn">
            {isLoading || searchLoading ? 'Monitoring...' : 'Search & monitor ✦'}
          </button>
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
          <button onClick={runNewsjack} disabled={isLoading || searchLoading || !njBrand} className="run-btn">
            {isLoading || searchLoading ? 'Finding opportunities...' : "Find today's opportunities ✦"}
          </button>
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
          <button onClick={runSentiment} disabled={isLoading || searchLoading || !sentBrand} className="run-btn">
            {isLoading || searchLoading ? 'Checking sentiment...' : 'Check sentiment ✦'}
          </button>
        </>
      )}

      {searchData?.results && (
        <div className="output-wrap mb-4">
          <div className="output-header">
            <div className="output-label">🔍 Search Results</div>
          </div>
          <div className="output-box" style={{ background: 'var(--bg-card)', maxHeight: '200px', overflow: 'auto' }}>
            {searchData.results.slice(0, 5).map((r: any, i: number) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{r.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.snippet?.substring(0, 150)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {response && (
        <div className="output-wrap" style={{ borderLeft: '2px solid var(--accent)' }}>
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              {activeTab === 'monitor' && 'Monitoring Report'}
              {activeTab === 'newsjack' && "Newsjacking Opportunities"}
              {activeTab === 'sentiment' && 'Sentiment Report'}
            </div>
            <button className="action-btn" onClick={() => navigator.clipboard.writeText(response)}>Copy</button>
          </div>
          <div className="output-box">
            {response}
          </div>
        </div>
      )}
    </>
  );
}