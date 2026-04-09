'use client';

import { useState } from 'react';

export default function ContentPage() {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('caption');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ 
            role: 'user', 
            content: `Generate a ${contentType} for: ${prompt}` 
          }] 
        })
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setResult(prev => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch { setResult('Error generating content'); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>
          ✍️ AI Content Generator
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Content Type
            </label>
            <select 
              value={contentType} 
              onChange={(e) => setContentType(e.target.value)}
              style={{
                width: '100%',
                background: '#111111',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '14px 18px',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="caption">Instagram Caption</option>
              <option value="hook">Reel Hook</option>
              <option value="thread">Twitter Thread</option>
              <option value="story">Story Idea</option>
              <option value="caption">LinkedIn Post</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            What do you want to create?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A post about our new coffee blend arriving soon"
            rows={3}
            style={{
              width: '100%',
              background: '#111111',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
              color: '#ffffff',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font)',
            }}
          />
        </div>
        
        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)',
            color: loading ? '#71717a' : '#080808',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading && <span className="spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#080808', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></span>}
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </div>
      
      {result && (
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '16px',
          padding: '24px',
          borderLeft: '2px solid #00ffcc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ffcc' }}></span>
              Generated Content
            </div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}