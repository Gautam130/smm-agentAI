'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';

export default function DiagnosePage() {
  const [post, setPost] = useState('');

  const { response: result, isLoading: loading, sendMessage, clearHistory } = useModuleMaya({ enableHistory: true });

  const analyze = () => sendMessage([
    { role: 'user', content: `Analyze this social media post and explain why it might not be performing well. Provide specific feedback on: hook, content, formatting, timing, and call-to-action. Post: "${post}"` }
  ], { task: 'strategy', temperature: 0.4 });

  return (
    <>
      <h2 className="module-title">🔬 Post Diagnosis</h2>
      
      <div className="field mb-4">
        <label className="lbl">Paste your post that didn't perform well</label>
        <textarea
          value={post}
          onChange={(e) => setPost(e.target.value)}
          placeholder="Paste your caption, hook, or full post here..."
          rows={5}
          className="inp"
        />
      </div>
      
      <button onClick={analyze} disabled={loading || !post.trim()} className="run-btn btn-red">
        {loading ? 'Analyzing...' : 'Diagnose Post'}
      </button>
      
      {result && (
        <div className="output-wrap" style={{ borderLeft: '2px solid #ef4444' }}>
          <div className="output-header">
            <div className="output-label">
              <span className="dot-red"></span>
              Diagnosis Report
              <button className="clear-btn" onClick={clearHistory} title="Clear">✕</button>
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
