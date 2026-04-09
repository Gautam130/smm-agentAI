'use client';

import { useState } from 'react';

export default function RepurposePage() {
  const [content, setContent] = useState('');
  const [formats, setFormats] = useState('All 6 formats (Reel, Story, Thread, Carousel, LinkedIn, Email)');
  const [tone, setTone] = useState('Keep original tone');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Repurpose the following content into ${formats}. Tone: ${tone}. Original content: ${content}` }] })
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
      <div className="notice n-green">
        ♻️ Paste any content — blog post, video script, caption, article — and get it adapted for every platform.
      </div>
      
      <div className="field">
        <label className="lbl">Original content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your original content here..." rows={8} />
      </div>
      
      <div className="g2 mb-4">
        <div className="field">
          <label className="lbl">Repurpose into</label>
          <select value={formats} onChange={(e) => setFormats(e.target.value)}>
            <option>All 6 formats (Reel, Story, Thread, Carousel, LinkedIn, Email)</option>
            <option>Reel caption only</option>
            <option>Carousel script only</option>
            <option>Twitter/X thread only</option>
            <option>LinkedIn post only</option>
            <option>Email newsletter snippet</option>
          </select>
        </div>
        <div className="field">
          <label className="lbl">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Keep original tone</option>
            <option>Make more casual & fun</option>
            <option>Make more professional</option>
            <option>Make more punchy & short</option>
          </select>
        </div>
      </div>
      
      <button onClick={generate} disabled={loading || !content} className="run-btn">
        {loading ? 'Repurposing...' : 'Repurpose Now ✦'}
      </button>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Repurposed Content
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
            </div>
            <div className="output-actions">
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