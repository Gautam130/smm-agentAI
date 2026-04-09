'use client';

import { useState } from 'react';

export default function DiagnosePage() {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const analyze = async () => {
    if (!post.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ 
            role: 'user', 
            content: `Analyze this social media post and explain why it might not be performing well. Provide specific feedback on: hook, content, formatting, timing, and call-to-action. Post: "${post}"` 
          }] 
        })
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
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
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