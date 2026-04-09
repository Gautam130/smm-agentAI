'use client';

import { useState } from 'react';

export default function InfluencerPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const search = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt, type: 'influencer' })
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch { setResult('Error searching'); }
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
          🤝 Influencer Tracker
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Find influencers for
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Yoga influencers in Delhi for my skincare brand"
            rows={2}
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
          onClick={search}
          disabled={loading || !prompt.trim()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            color: loading ? '#71717a' : '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Find Influencers'}
        </button>
      </div>
      
      {result && (
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '16px',
          padding: '24px',
          borderLeft: '2px solid #a855f7',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', marginBottom: '16px' }}>
            Results
          </div>
          <pre style={{ fontSize: '13px', lineHeight: 1.6, color: '#ffffff', whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}