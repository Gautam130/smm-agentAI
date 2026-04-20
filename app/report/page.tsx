'use client';

import { useState } from 'react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { useSearch } from '@/lib/hooks/useSearch';

type ReportType = 'performance' | 'competitor' | 'audience' | 'content';

export default function ReportPage() {
  const [platform, setPlatform] = useState('Instagram');
  const [period, setPeriod] = useState('30 days');
  const [brand, setBrand] = useState('');
  const [reportType, setReportType] = useState<ReportType>('performance');
  
  const { response, isLoading, sendMessage } = useStreamingChat();
  const { data: searchData, execute: doSearch, isLoading: searchLoading } = useSearch();

  const generateReport = async () => {
    if (!brand) return;
    
    const searchQueries: Record<ReportType, string> = {
      performance: `${brand} ${platform} marketing case study India 2026`,
      competitor: `${brand} competitors ${platform} India case study`,
      audience: `${brand} target audience India behavior insights`,
      content: `${brand} best performing ${platform} content India`
    };
    
    try {
      await doSearch('serper', searchQueries[reportType], { niche: brand, limit: 8 });
      
      const typePrompts: Record<ReportType, string> = {
        performance: `Generate a comprehensive performance report for ${brand} on ${platform} for ${period}.`,
        competitor: `Generate a competitive analysis report for ${brand} vs competitors in ${platform} India.`,
        audience: `Generate an audience insights report for ${brand} based on Indian market.`,
        content: `Generate a content performance report for ${brand} on ${platform}.`
      };

      const prompt = `${typePrompts[reportType]}

RESEARCH DATA:
${searchData?.results?.slice(0, 6).map((r: any) => `${r.title}: ${r.snippet}`).join('\n') || 'No specific data found'}

Include:
- Key metrics and benchmarks
- Actionable insights
- Specific recommendations
- Indian market context`;

      await sendMessage([
        { role: 'user', content: prompt }
      ], { task: 'research' });
    } catch (err) {
      console.error(err);
    }
  };

  const reportTypes = [
    { id: 'performance', label: 'Performance' },
    { id: 'competitor', label: 'Competitor' },
    { id: 'audience', label: 'Audience' },
    { id: 'content', label: 'Content' },
  ] as const;

  return (
    <>
      <h2 className="module-title">📊 AI Reporting</h2>

      <div className="notice n-amber mb-4">
        ⚠️ <strong>Note:</strong> This generates reports based on <strong>live research</strong> and industry benchmarks. Connect analytics API for real account data.
      </div>
      
      <div className="stabs mb-4">
        {reportTypes.map((type) => (
          <button key={type.id} onClick={() => { setReportType(type.id); }} className={`stab ${reportType === type.id ? 'active' : ''}`}>
            {type.label} Report
          </button>
        ))}
      </div>

      <div className="g3 mb-4">
        <div className="field">
          <label className="lbl">Brand name</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. your brand" />
        </div>
        <div className="field">
          <label className="lbl">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>YouTube</option>
            <option>Twitter/X</option>
            <option>Facebook</option>
          </select>
        </div>
        <div className="field">
          <label className="lbl">Time period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
            <option>6 months</option>
          </select>
        </div>
      </div>

      <button onClick={generateReport} disabled={isLoading || searchLoading || !brand} className="run-btn">
        {isLoading || searchLoading ? 'Researching...' : 'Generate Report ✦'}
      </button>

      {searchData?.results && (
        <div className="output-wrap mb-4">
          <div className="output-header">
            <div className="output-label">🔍 Research Sources</div>
          </div>
          <div className="output-box" style={{ background: 'var(--bg-card)', maxHeight: '150px', overflow: 'auto' }}>
            {searchData.results.slice(0, 4).map((r: any, i: number) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{r.title}</div>
                <div style={{ fontSize: '11px', color: '#71717a' }}>{r.domain}</div>
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
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'research' })} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="action-btn">Export PDF</button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(response)}>Copy</button>
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