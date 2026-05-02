'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';

export default function StrategyPage() {
  const [prompt, setPrompt] = useState('');

  const { response: result, isLoading: loading, sendMessage, clearHistory } = useModuleMaya({ enableHistory: true });

  const analyze = () => sendMessage([
    { role: 'user', content: `Provide a comprehensive social media strategy for: ${prompt}. Include audience analysis, content pillars, posting schedule, and growth tactics.` }
  ], { task: 'strategy', temperature: 0.5 });

  return (
    <>
      <h2 className="module-title">📊 Strategy & Audit</h2>
      
      <div className="field">
        <label className="lbl">Describe your business</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A D2C fashion brand in India, targeting young professionals. Need a strategy to grow on Instagram."
          rows={3}
        />
      </div>
      
      <button onClick={analyze} disabled={loading || !prompt.trim()} className="run-btn btn-purple">
        {loading ? 'Analyzing...' : 'Generate Strategy'}
      </button>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Your Strategy
              <button className="clear-btn" onClick={clearHistory} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box output-purple">
            {result}
          </div>
        </div>
      )}
    </>
  );
}
