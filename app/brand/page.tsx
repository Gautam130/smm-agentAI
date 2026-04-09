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

  const runIdentity = () => generate(`Create a brand identity for ${brandName}. Tagline: ${tagline}. Values: ${values}. Voice: ${voice}.`);
  const runGuidelines = () => generate(`Create brand guidelines. Colors: ${colors}. Fonts: ${fonts}. Do's: ${dos}. Don'ts: ${donts}.`);

  const tabs = [
    { id: 'identity', label: 'Brand Identity' },
    { id: 'guidelines', label: 'Guidelines' },
    { id: 'assets', label: 'Assets' },
  ] as const;

  return (
    <>
      <div className="stabs">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'identity' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Brand name</label>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. FreshBrew" />
            </div>
            <div className="field">
              <label className="lbl">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Sip the difference" />
            </div>
          </div>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Brand values</label>
              <input value={values} onChange={(e) => setValues(e.target.value)} placeholder="e.g. Quality, Innovation, Sustainability" />
            </div>
            <div className="field">
              <label className="lbl">Brand voice</label>
              <input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="e.g. Friendly, professional, educational" />
            </div>
          </div>
          <button onClick={runIdentity} disabled={loading || !brandName} className="run-btn btn-purple">
            {loading ? 'Generating...' : 'Generate Identity ✦'}
          </button>
        </>
      )}

      {activeTab === 'guidelines' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Brand colors</label>
              <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="e.g. Navy blue, gold, white" />
            </div>
            <div className="field">
              <label className="lbl">Fonts</label>
              <input value={fonts} onChange={(e) => setFonts(e.target.value)} placeholder="e.g. Plus Jakarta Sans, Inter" />
            </div>
          </div>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Do's</label>
              <input value={dos} onChange={(e) => setDos(e.target.value)} placeholder="e.g. Use high-res images, consistent colors" />
            </div>
            <div className="field">
              <label className="lbl">Don'ts</label>
              <input value={donts} onChange={(e) => setDonts(e.target.value)} placeholder="e.g. Use competitor logos, overused stock photos" />
            </div>
          </div>
          <button onClick={runGuidelines} disabled={loading || !colors} className="run-btn btn-purple">
            {loading ? 'Generating...' : 'Generate Guidelines ✦'}
          </button>
        </>
      )}

      {activeTab === 'assets' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>🎨 Brand Assets</div>
          <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>Upload and manage your brand assets</div>
          <div className="notice n-purple">⚡ Coming Soon</div>
        </div>
      )}
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Brand Kit
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box output-purple">
            {result}
          </div>
        </div>
      )}
    </>
  );
}