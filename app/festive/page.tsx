'use client';

import { useState } from 'react';

type TabType = 'festive';

const festivals = [
  { name: 'Diwali', emoji: '🪔' },
  { name: 'Holi', emoji: '🎨' },
  { name: 'IPL Season', emoji: '🏏' },
  { name: 'Eid', emoji: '🌙' },
  { name: 'Navratri', emoji: '💃' },
  { name: 'Republic Day', emoji: '🇮🇳' },
  { name: 'Independence Day', emoji: '🎉' },
  { name: 'Raksha Bandhan', emoji: '🎀' },
];

export default function FestivePage() {
  const [selectedFest, setSelectedFest] = useState('Diwali');
  const [brand, setBrand] = useState('');
  const [campaignType, setCampaignType] = useState('Full 7-day content series');
  const [offer, setOffer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!brand.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Create a ${selectedFest} festive campaign for ${brand}. Type: ${campaignType}. Offer: ${offer}. Include post ideas, captions, and timing.` }] })
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
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #fbbf24' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '16px', padding: '12px', background: 'rgba(251,191,36,0.05)', borderRadius: '8px' }}>
          🇮🇳 India's festive calendar is your biggest marketing opportunity. Plan campaigns that actually land.
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Select festival</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {festivals.map((f) => (
              <button key={f.name} onClick={() => setSelectedFest(f.name)} style={{ padding: '8px 16px', borderRadius: '20px', border: selectedFest === f.name ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)', background: selectedFest === f.name ? 'rgba(251,191,36,0.1)' : '#111111', color: selectedFest === f.name ? '#fbbf24' : '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>
                {f.emoji} {f.name}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={labelStyle}>Brand & product</label><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. FreshBrew teas — gifting hampers" style={inputStyle} /></div>
          <div><label style={labelStyle}>Campaign type</label><select value={campaignType} onChange={(e) => setCampaignType(e.target.value)} style={inputStyle}><option>Full 7-day content series</option><option>Single hero post + caption</option><option>Offer / sale campaign</option><option>Gifting campaign</option></select></div>
        </div>
        <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Offer / angle (optional)</label><input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. 30% off, free gifting, limited edition packaging" style={inputStyle} /></div>
        <button onClick={generate} disabled={loading || !brand} style={btnStyle}>{loading ? 'Generating...' : 'Generate Festive Campaign ✦'}</button>
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24' }}>Festive Campaign</div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{result}</div>
        </div>
      )}
    </div>
  );
}