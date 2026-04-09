'use client';

import { useState } from 'react';

export default function BulkPage() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ 
            role: 'user', 
            content: `Generate ${count} social media post ideas for: ${topic}. Include captions, hooks, and post types.` 
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
      <h2 className="module-title">⚡ Bulk Generate</h2>
      
      <div className="field">
        <label className="lbl">Number of Posts</label>
        <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
          <option value={5}>5 Posts</option>
          <option value={10}>10 Posts</option>
          <option value={15}>15 Posts</option>
          <option value={20}>20 Posts</option>
        </select>
      </div>
      
      <div className="field mb-4">
        <label className="lbl">What do you want content about?</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Our new summer collection for women"
          rows={2}
        />
      </div>
      
      <button
        onClick={generate}
        disabled={loading || !topic.trim()}
        className="run-btn btn-yellow"
      >
        {loading ? 'Generating...' : `Generate ${count} Posts`}
      </button>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-yellow">
              <span className="dot-yellow"></span>
              Generated Content
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy All</button>
            </div>
          </div>
          <div className="output-box output-yellow">
            {result}
          </div>
        </div>
      )}
    </>
  );
}