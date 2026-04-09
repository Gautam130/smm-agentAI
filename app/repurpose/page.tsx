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

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #00ffcc' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#4ade80', marginBottom: '16px', padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: '8px' }}>
          ♻️ Paste any content — blog post, video script, caption, article — and get it adapted for every platform.
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Original content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your original content here..." rows={8} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Repurpose into</label>
            <select value={formats} onChange={(e) => setFormats(e.target.value)} style={inputStyle}>
              <option>All 6 formats (Reel, Story, Thread, Carousel, LinkedIn, Email)</option>
              <option>Reel caption only</option>
              <option>Carousel script only</option>
              <option>Twitter/X thread only</option>
              <option>LinkedIn post only</option>
              <option>Email newsletter snippet</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} style={inputStyle}>
              <option>Keep original tone</option>
              <option>Make more casual & fun</option>
              <option>Make more professional</option>
              <option>Make more punchy & short</option>
            </select>
          </div>
        </div>
        
        <button onClick={generate} disabled={loading || !content} style={btnStyle}>
          {loading ? 'Repurposing...' : 'Repurpose Now ✦'}
        </button>
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ffcc' }}></span>Repurposed Content</div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{result}</div>
        </div>
      )}
    </div>
  );
}