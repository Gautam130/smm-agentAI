'use client';

import { useState } from 'react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { useSearch } from '@/lib/hooks/useSearch';

type TabType = 'overview' | 'content' | 'audience';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [brand, setBrand] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  
  const { response, isLoading, sendMessage } = useStreamingChat();
  const { data: searchData, execute: doSearch, isLoading: searchLoading } = useSearch();

  const getAnalytics = async () => {
    if (!brand) return;
    
    try {
      await doSearch('serper', `${brand} ${platform} analytics case study India 2026`, { niche: brand, limit: 8 });
      
      const prompt = `Generate analytics insights for ${brand} on ${platform} based on current trends.

SEARCH RESULTS:
${searchData?.results?.slice(0, 6).map((r: any) => `${r.title}: ${r.snippet}`).join('\n') || 'No data found'}

Provide:
- Industry benchmarks for engagement rates
- Typical follower growth rates
- Best performing content types
- Optimal posting times for Indian audience
- Comparison tips`;

      await sendMessage([
        { role: 'user', content: prompt }
      ], { task: 'research' });
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'content', label: 'Content Analysis' },
    { id: 'audience', label: 'Audience Insights' },
  ] as const;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="module-title">📊 Analytics Dashboard</h2>
      </div>

      <div className="notice n-amber mb-4">
        ⚠️ <strong>Note:</strong> This dashboard provides <strong>industry benchmarks and insights</strong> based on live research. Connect your Instagram/analytics API for real-time data.
      </div>

      <div className="g2 mb-4">
        <div className="field">
          <label className="lbl">Brand / Account</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. your brand name" />
        </div>
        <div className="field">
          <label className="lbl">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>YouTube</option>
            <option>Twitter/X</option>
          </select>
        </div>
      </div>

      <button onClick={getAnalytics} disabled={isLoading || searchLoading || !brand} className="run-btn mb-4">
        {isLoading || searchLoading ? 'Researching...' : 'Get industry benchmarks ✦'}
      </button>

      <div className="stabs mb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`stab ${activeTab === tab.id ? 'active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="g2">
          <div className="kpi-card">
            <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Instagram Avg. Engagement</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>1.5% - 3.5%</div>
            <div style={{ fontSize: '12px', color: '#fbbf24' }}>Industry standard</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Good Follower Growth</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>5-10% / month</div>
            <div style={{ fontSize: '12px', color: '#4ade80' }}>Healthy rate</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Best Posting Time (IST)</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>7-9 PM</div>
            <div style={{ fontSize: '12px', color: '#a855f7' }}>Tue, Thu, Sat</div>
          </div>
          <div className="kpi-card">
            <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Reels vs Static</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>3-5x more</div>
            <div style={{ fontSize: '12px', color: '#00ffcc' }}>Engagement boost</div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="dashboard-card">
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Content Type Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { type: 'Reels', percent: '75%', color: '#00ffcc' },
              { type: 'Carousels', percent: '50%', color: '#a855f7' },
              { type: 'Static Posts', percent: '25%', color: '#4ade80' },
              { type: 'Stories', percent: '20%', color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa', width: '100px' }}>{item.type}</span>
                <div style={{ flex: 1, height: '8px', background: '#111111', borderRadius: '4px', margin: '0 12px' }}>
                  <div style={{ width: item.percent, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                </div>
                <span style={{ fontSize: '13px', color: item.color, width: '50px', textAlign: 'right' }}>{item.percent}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="dashboard-card">
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Indian Audience Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Top Cities</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>Delhi NCR, Mumbai, Bangalore, Hyderabad, Pune</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Age Groups</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>18-24 (35%), 25-34 (45%), 35-44 (15%)</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Peak Hours (IST)</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>7-9 AM, 12-2 PM, 7-10 PM</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>Content Preferences</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>Educational, Behind-the-scenes, User-generated</div>
            </div>
          </div>
        </div>
      )}

      {searchData?.results && (
        <div className="output-wrap mb-4">
          <div className="output-header">
            <div className="output-label">🔍 Live Research</div>
          </div>
          <div className="output-box" style={{ background: 'var(--bg-card)', maxHeight: '150px', overflow: 'auto' }}>
            {searchData.results.slice(0, 3).map((r: any, i: number) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                {r.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {response && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Analytics Insights
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'research' })} title="Clear">✕</button>
            </div>
          </div>
          <div className="output-box">
            {response}
          </div>
        </div>
      )}
    </>
  );
}