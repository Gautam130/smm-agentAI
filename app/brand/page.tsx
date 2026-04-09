'use client';

import { useState } from 'react';

type TabType = 'identity' | 'guidelines' | 'assets';

export default function BrandPage() {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [values, setValues] = useState('');
  const [voice, setVoice] = useState('');
  
  const [colors, setColors] = useState('');
  const [fonts, setFonts] = useState('');
  const [dos, setDos] = useState('');
  const [donts, setDonts] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
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

  const runIdentity = () => generate(`Create a brand identity for ${brandName}. Tagline: ${tagline}. Core values: ${values}. Brand voice: ${voice}.`);
  const runGuidelines = () => generate(`Create brand guidelines. Colors: ${colors}. Fonts: ${fonts}. Do's: ${dos}. Don'ts: ${donts}.`);

  const tabs = [
    { id: 'identity', label: 'Brand Identity' },
    { id: 'guidelines', label: 'Guidelines' },
    { id: 'assets', label: 'Assets' },
  ] as const;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #a855f7' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(168,85,247,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#a855f7' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'identity' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Brand name</label><input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. FreshBrew" style={inputStyle} /></div>
              <div><label style={labelStyle}>Tagline</label><input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Sip the difference" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Core values</label><input value={values} onChange={(e) => setValues(e.target.value)} placeholder="e.g. sustainability, quality, authenticity" style={inputStyle} /></div>
              <div><label style={labelStyle}>Brand voice</label><input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="e.g. friendly, professional, educational" style={inputStyle} /></div>
            </div>
            <button onClick={runIdentity} disabled={loading || !brandName} style={btnStyle}>{loading ? 'Generating...' : 'Generate Brand Identity ✦'}</button>
          </>
        )}

        {activeTab === 'guidelines' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Brand colors</label><input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="e.g. Navy blue, gold, white" style={inputStyle} /></div>
              <div><label style={labelStyle}>Fonts</label><input value={fonts} onChange={(e) => setFonts(e.target.value)} placeholder="e.g. Plus Jakarta Sans, Inter" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Do's</label><input value={dos} onChange={(e) => setDos(e.target.value)} placeholder="e.g. Use high-res images, consistent colors" style={inputStyle} /></div>
              <div><label style={labelStyle}>Don'ts</label><input value={donts} onChange={(e) => setDonts(e.target.value)} placeholder="e.g. Use competitor logos, overused stock photos" style={inputStyle} /></div>
            </div>
            <button onClick={runGuidelines} disabled={loading || !colors} style={btnStyle}>{loading ? 'Generating...' : 'Generate Guidelines ✦'}</button>
          </>
        )}

        {activeTab === 'assets' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>🎨 Brand Assets</div>
            <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>Upload and manage your brand assets</div>
            <div style={{ padding: '16px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px', display: 'inline-block' }}>
              <div style={{ fontSize: '13px', color: '#a855f7' }}>⚡ Coming Soon</div>
            </div>
          </div>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7' }}>Brand Kit</div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{result}</div>
        </div>
      )}
    </div>
  );
}