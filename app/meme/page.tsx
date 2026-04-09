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

  return (
    <div className="w900">
      <div className="module-card">
        <div className="module-subtitle-green">
          🎯 Indian meme marketing done right — the Zomato, Swiggy, boAt playbook for your brand.
        </div>
        
        <div className="stabs">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'concept' && (
          <>
            <div className="g2 mb-4">
              <div className="field">
                <label className="lbl">Brand / product</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. chai brand, fitness app" />
              </div>
              <div className="field">
                <label className="lbl">Meme style</label>
                <select value={memeStyle} onChange={(e) => setMemeStyle(e.target.value)}>
                  <option>Relatable situational (Indian office/family)</option>
                  <option>Trending format adaptation</option>
                  <option>Brand vs competitor (subtle)</option>
                  <option>Self-deprecating brand humour</option>
                  <option>Bollywood / pop culture reference</option>
                  <option>Cricket / IPL angle</option>
                </select>
              </div>
            </div>
            <div className="field mb-5">
              <label className="lbl">Topic or product to promote</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Monday morning without our coffee, exam season" />
            </div>
            <button onClick={runConcept} disabled={loading || !brand} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate Meme Concepts ✦'}</button>
          </>
        )}

        {activeTab === 'audio' && (
          <>
            <div className="g2 mb-4">
              <div className="field">
                <label className="lbl">Your niche</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. fashion, food, finance" />
              </div>
              <div className="field">
                <label className="lbl">Platform</label>
                <select value={maPlatform} onChange={(e) => setMaPlatform(e.target.value)}>
                  <option>Instagram Reels</option>
                  <option>YouTube Shorts</option>
                </select>
              </div>
            </div>
            <div className="field mb-5">
              <label className="lbl">Content type</label>
              <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                <option>Product showcase</option>
                <option>Tutorial / educational</option>
                <option>Transformation / before-after</option>
                <option>Behind the scenes</option>
                <option>Trending challenge adaptation</option>
              </select>
            </div>
            <button onClick={runAudio} disabled={loading || !niche} className="run-btn btn-purple">{loading ? 'Finding...' : 'Find Trending Audio Strategy ✦'}</button>
          </>
        )}

        {activeTab === 'newsjack' && (
          <>
            <div className="module-subtitle-yellow">
              ⚡ Newsjacking = jumping on trending news/events with your brand angle. Golden window is 2-6 hours.
            </div>
            <div className="g2 mb-4">
              <div className="field">
                <label className="lbl">Current trending topic / news</label>
                <input value={trendingTopic} onChange={(e) => setTrendingTopic(e.target.value)} placeholder="e.g. IPL final, Bollywood release" />
              </div>
              <div className="field">
                <label className="lbl">Your brand</label>
                <input value={mjBrand} onChange={(e) => setMjBrand(e.target.value)} placeholder="e.g. chai brand, fintech app" />
              </div>
            </div>
            <div className="field mb-5">
              <label className="lbl">Tone</label>
              <select value={mjTone} onChange={(e) => setMjTone(e.target.value)}>
                <option>Witty & clever</option>
                <option>Informative tie-in</option>
                <option>Celebratory</option>
                <option>Empathetic</option>
              </select>
            </div>
            <button onClick={runNewsjack} disabled={loading || !trendingTopic} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate Newsjack Content ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div className="output-box output-purple">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Meme Concepts
            </div>
            <button className="action-btn">Copy</button>
          </div>
          <div className="output-content">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}