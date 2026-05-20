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
        ⚠️ <strong>Note:</strong> Live analytics API integration is coming soon. The AI will provide insights based on web research for now. Connect your Instagram/analytics API for real-time data.
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
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Live Analytics Coming Soon</h3>
          <p style={{ fontSize: '13px', color: '#71717a', maxWidth: '400px', margin: '0 auto' }}>
            Connect your Instagram, LinkedIn, or YouTube account to see real-time engagement metrics, follower growth, and content performance.
          </p>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📈</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Content Performance Analytics</h3>
          <p style={{ fontSize: '13px', color: '#71717a', maxWidth: '400px', margin: '0 auto' }}>
            Once connected, this tab will show your best-performing content types, engagement breakdown by format, and optimization recommendations.
          </p>
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Audience Insights</h3>
          <p style={{ fontSize: '13px', color: '#71717a', maxWidth: '400px', margin: '0 auto' }}>
            Demographics, location data, peak activity times, and content preferences will appear here when your analytics accounts are linked.
          </p>
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