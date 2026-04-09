'use client';

import { useState } from 'react';

export default function ReportPage() {
  const [platform, setPlatform] = useState('Instagram');
  const [period, setPeriod] = useState('30 days');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Generate a comprehensive performance report for ${platform} for the last ${period}. Include engagement metrics, top performing content, audience insights, and recommendations.` }] })
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

  return (
    <>
      <h2 className="module-title">📊 AI Reporting</h2>
      
      <div className="g2 mb-4">
        <div className="field">
          <label className="lbl">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>YouTube</option>
            <option>Twitter/X</option>
          </select>
        </div>
        <div className="field">
          <label className="lbl">Time period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
          </select>
        </div>
      </div>
      <button onClick={generate} disabled={loading} className="run-btn">
        {loading ? 'Generating...' : 'Generate Report ✦'}
      </button>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Performance Report
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="action-btn">Export PDF</button>
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