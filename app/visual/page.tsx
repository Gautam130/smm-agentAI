'use client';

import { useState } from 'react';

type TabType = 'reel' | 'carousel' | 'thumbnail' | 'story';

export default function VisualPage() {
  const [activeTab, setActiveTab] = useState<TabType>('reel');
  
  const [vrTopic, setVrTopic] = useState('');
  const [vrDuration, setVrDuration] = useState('30 seconds');
  const [vrVibe, setVrVibe] = useState('Clean & minimal');
  const [vrMessage, setVrMessage] = useState('');
  
  const [vcTopic, setVcTopic] = useState('');
  const [vcSlides, setVcSlides] = useState('5 slides');
  const [vcStyle, setVcStyle] = useState('Bold typography on solid colors');
  const [vcColors, setVcColors] = useState('');
  
  const [vtTopic, setVtTopic] = useState('');
  const [vtPlatform, setVtPlatform] = useState('YouTube thumbnail');
  const [vtStyle, setVtStyle] = useState('Face + bold text (MrBeast style)');
  
  const [vsPurpose, setVsPurpose] = useState('Product launch announcement');
  const [vsPersonality, setVsPersonality] = useState('Fun & casual');
  const [vsMessage, setVsMessage] = useState('');
  
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

  const runReel = () => generate(`Generate a shot list for Reel. Product: ${vrTopic}. Duration: ${vrDuration}. Vibe: ${vrVibe}. Key message: ${vrMessage}.`);
  const runCarousel = () => generate(`Generate carousel design brief. Topic: ${vcTopic}. Slides: ${vcSlides}. Style: ${vcStyle}. Colors: ${vcColors}.`);
  const runThumbnail = () => generate(`Generate thumbnail concept. Topic: ${vtTopic}. Platform: ${vtPlatform}. Style: ${vtStyle}.`);
  const runStory = () => generate(`Generate story template. Purpose: ${vsPurpose}. Personality: ${vsPersonality}. Message: ${vsMessage}.`);

  const tabs = [
    { id: 'reel', label: 'Reel shot list' },
    { id: 'carousel', label: 'Carousel brief' },
    { id: 'thumbnail', label: 'Thumbnail concept' },
    { id: 'story', label: 'Story template' },
  ] as const;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #a855f7' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#a855f7', marginBottom: '16px', padding: '12px', background: 'rgba(168,85,247,0.05)', borderRadius: '8px' }}>
          🎨 Brief your designers and videographers properly — no more vague "make something nice" requests.
        </div>
        
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(168,85,247,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#a855f7' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'reel' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Product / topic</label><input value={vrTopic} onChange={(e) => setVrTopic(e.target.value)} placeholder="e.g. new protein powder launch" style={inputStyle} /></div>
              <div><label style={labelStyle}>Reel duration</label><select value={vrDuration} onChange={(e) => setVrDuration(e.target.value)} style={inputStyle}><option>15 seconds</option><option>30 seconds</option><option>60 seconds</option><option>90 seconds</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Brand vibe</label><select value={vrVibe} onChange={(e) => setVrVibe(e.target.value)} style={inputStyle}><option>Clean & minimal</option><option>Energetic & fast-paced</option><option>Aesthetic & cinematic</option><option>Funny & relatable</option><option>Raw & authentic</option></select></div>
              <div><label style={labelStyle}>Key message</label><input value={vrMessage} onChange={(e) => setVrMessage(e.target.value)} placeholder="e.g. transforms your morning in 5 min" style={inputStyle} /></div>
            </div>
            <button onClick={runReel} disabled={loading || !vrTopic} style={btnStyle}>{loading ? 'Generating...' : 'Generate Shot List ✦'}</button>
          </>
        )}

        {activeTab === 'carousel' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Topic</label><input value={vcTopic} onChange={(e) => setVcTopic(e.target.value)} placeholder="e.g. 5 signs you need to rebrand" style={inputStyle} /></div>
              <div><label style={labelStyle}>Number of slides</label><select value={vcSlides} onChange={(e) => setVcSlides(e.target.value)} style={inputStyle}><option>5 slides</option><option>7 slides</option><option>10 slides</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Design style</label><select value={vcStyle} onChange={(e) => setVcStyle(e.target.value)} style={inputStyle}><option>Bold typography on solid colors</option><option>Photo + text overlay</option><option>Minimal clean white</option><option>Dark luxury feel</option></select></div>
              <div><label style={labelStyle}>Brand colors (optional)</label><input value={vcColors} onChange={(e) => setVcColors(e.target.value)} placeholder="e.g. Navy blue, gold" style={inputStyle} /></div>
            </div>
            <button onClick={runCarousel} disabled={loading || !vcTopic} style={btnStyle}>{loading ? 'Generating...' : 'Generate Design Brief ✦'}</button>
          </>
        )}

        {activeTab === 'thumbnail' && (
          <>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Video / post topic</label><input value={vtTopic} onChange={(e) => setVtTopic(e.target.value)} placeholder="e.g. How I made ₹1 lakh in 30 days" style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>Platform</label><select value={vtPlatform} onChange={(e) => setVtPlatform(e.target.value)} style={inputStyle}><option>YouTube thumbnail</option><option>Instagram Reel cover</option><option>LinkedIn document cover</option></select></div>
              <div><label style={labelStyle}>Style</label><select value={vtStyle} onChange={(e) => setVtStyle(e.target.value)} style={inputStyle}><option>Face + bold text</option><option>Text-only typographic</option><option>Product showcase</option><option>Before/after split</option></select></div>
            </div>
            <button onClick={runThumbnail} disabled={loading || !vtTopic} style={btnStyle}>{loading ? 'Generating...' : 'Generate Thumbnail Concept ✦'}</button>
          </>
        )}

        {activeTab === 'story' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Story purpose</label><select value={vsPurpose} onChange={(e) => setVsPurpose(e.target.value)} style={inputStyle}><option>Product launch announcement</option><option>Poll / engagement story</option><option>Behind the scenes</option><option>Sale / offer announcement</option></select></div>
              <div><label style={labelStyle}>Brand personality</label><select value={vsPersonality} onChange={(e) => setVsPersonality(e.target.value)} style={inputStyle}><option>Fun & casual</option><option>Premium & elegant</option><option>Bold & loud</option><option>Minimal & clean</option></select></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Core message</label><input value={vsMessage} onChange={(e) => setVsMessage(e.target.value)} placeholder="e.g. 50% off ends tonight" style={inputStyle} /></div>
            <button onClick={runStory} disabled={loading || !vsMessage} style={btnStyle}>{loading ? 'Generating...' : 'Generate Story Brief ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', marginBottom: '16px' }}>Generated Brief</div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>{result}</div>
        </div>
      )}
    </div>
  );
}