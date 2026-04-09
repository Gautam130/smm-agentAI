'use client';

import { useState } from 'react';

type TabType = 'concept' | 'audio' | 'newsjack';

export default function MemePage() {
  const [activeTab, setActiveTab] = useState<TabType>('concept');
  
  const [brand, setBrand] = useState('');
  const [memeStyle, setMemeStyle] = useState('Relatable situational (Indian office/family)');
  const [topic, setTopic] = useState('');
  
  const [niche, setNiche] = useState('');
  const [maPlatform, setMaPlatform] = useState('Instagram Reels');
  const [contentType, setContentType] = useState('Product showcase');
  
  const [trendingTopic, setTrendingTopic] = useState('');
  const [mjBrand, setMjBrand] = useState('');
  const [mjTone, setMjTone] = useState('Witty & clever');
  
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

  const runConcept = () => generate(`Generate meme concepts for ${brand}. Style: ${memeStyle}. Topic: ${topic}. Include 5 different meme formats with captions.`);
  const runAudio = () => generate(`Suggest trending audio strategy for ${niche} on ${maPlatform}. Content type: ${contentType}. Include which trending audios to use and how to adapt them.`);
  const runNewsjack = () => generate(`Create newsjacking content for trending topic: ${trendingTopic}. Brand: ${mjBrand}. Tone: ${mjTone}. Include multiple post variations.`);

  const tabs = [
    { id: 'concept', label: 'Meme concept' },
    { id: 'audio', label: 'Trending audio' },
    { id: 'newsjack', label: 'Newsjacking' },
  ] as const;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #a855f7' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#4ade80', marginBottom: '16px', padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: '8px' }}>
          🎯 Indian meme marketing done right — the Zomato, Swiggy, boAt playbook for your brand.
        </div>
        
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(168,85,247,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#a855f7' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'concept' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Brand / product</label><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. chai brand, fitness app" style={inputStyle} /></div>
              <div><label style={labelStyle}>Meme style</label><select value={memeStyle} onChange={(e) => setMemeStyle(e.target.value)} style={inputStyle}><option>Relatable situational (Indian office/family)</option><option>Trending format adaptation</option><option>Brand vs competitor (subtle)</option><option>Self-deprecating brand humour</option><option>Bollywood / pop culture reference</option><option>Cricket / IPL angle</option></select></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Topic or product to promote</label><input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Monday morning without our coffee, exam season" style={inputStyle} /></div>
            <button onClick={runConcept} disabled={loading || !brand} style={btnStyle}>{loading ? 'Generating...' : 'Generate Meme Concepts ✦'}</button>
          </>
        )}

        {activeTab === 'audio' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Your niche</label><input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. fashion, food, finance" style={inputStyle} /></div>
              <div><label style={labelStyle}>Platform</label><select value={maPlatform} onChange={(e) => setMaPlatform(e.target.value)} style={inputStyle}><option>Instagram Reels</option><option>YouTube Shorts</option></select></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Content type</label><select value={contentType} onChange={(e) => setContentType(e.target.value)} style={inputStyle}><option>Product showcase</option><option>Tutorial / educational</option><option>Transformation / before-after</option><option>Behind the scenes</option><option>Trending challenge adaptation</option></select></div>
            <button onClick={runAudio} disabled={loading || !niche} style={btnStyle}>{loading ? 'Finding...' : 'Find Trending Audio Strategy ✦'}</button>
          </>
        )}

        {activeTab === 'newsjack' && (
          <>
            <div style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '16px', padding: '12px', background: 'rgba(251,191,36,0.05)', borderRadius: '8px' }}>
              ⚡ Newsjacking = jumping on trending news/events with your brand angle. Golden window is 2-6 hours.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Current trending topic / news</label><input value={trendingTopic} onChange={(e) => setTrendingTopic(e.target.value)} placeholder="e.g. IPL final, Bollywood release" style={inputStyle} /></div>
              <div><label style={labelStyle}>Your brand</label><input value={mjBrand} onChange={(e) => setMjBrand(e.target.value)} placeholder="e.g. chai brand, fintech app" style={inputStyle} /></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Tone</label><select value={mjTone} onChange={(e) => setMjTone(e.target.value)} style={inputStyle}><option>Witty & clever</option><option>Informative tie-in</option><option>Celebratory</option><option>Empathetic</option></select></div>
            <button onClick={runNewsjack} disabled={loading || !trendingTopic} style={btnStyle}>{loading ? 'Generating...' : 'Generate Newsjack Content ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }}></span>Meme Concepts</div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{result}</div>
        </div>
      )}
    </div>
  );
}