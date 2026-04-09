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

  return (
    <div className="w900">
      <div className="module-card">
        <div className="module-subtitle-purple">
          🎨 Brief your designers and videographers properly — no more vague "make something nice" requests.
        </div>
        
        <div className="stabs">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'reel' && (
          <>
            <div className="g2 mb-4">
              <div className="field">
                <label className="lbl">Product / topic</label>
                <input value={vrTopic} onChange={(e) => setVrTopic(e.target.value)} placeholder="e.g. new protein powder launch" />
              </div>
              <div className="field">
                <label className="lbl">Reel duration</label>
                <select value={vrDuration} onChange={(e) => setVrDuration(e.target.value)}>
                  <option>15 seconds</option>
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                  <option>90 seconds</option>
                </select>
              </div>
            </div>
            <div className="g2 mb-5">
              <div className="field">
                <label className="lbl">Brand vibe</label>
                <select value={vrVibe} onChange={(e) => setVrVibe(e.target.value)}>
                  <option>Clean & minimal</option>
                  <option>Energetic & fast-paced</option>
                  <option>Aesthetic & cinematic</option>
                  <option>Funny & relatable</option>
                  <option>Raw & authentic</option>
                </select>
              </div>
              <div className="field">
                <label className="lbl">Key message</label>
                <input value={vrMessage} onChange={(e) => setVrMessage(e.target.value)} placeholder="e.g. transforms your morning in 5 min" />
              </div>
            </div>
            <button onClick={runReel} disabled={loading || !vrTopic} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate Shot List ✦'}</button>
          </>
        )}

        {activeTab === 'carousel' && (
          <>
            <div className="g2 mb-4">
              <div className="field">
                <label className="lbl">Topic</label>
                <input value={vcTopic} onChange={(e) => setVcTopic(e.target.value)} placeholder="e.g. 5 signs you need to rebrand" />
              </div>
              <div className="field">
                <label className="lbl">Number of slides</label>
                <select value={vcSlides} onChange={(e) => setVcSlides(e.target.value)}>
                  <option>5 slides</option>
                  <option>7 slides</option>
                  <option>10 slides</option>
                </select>
              </div>
            </div>
            <div className="g2 mb-5">
              <div className="field">
                <label className="lbl">Design style</label>
                <select value={vcStyle} onChange={(e) => setVcStyle(e.target.value)}>
                  <option>Bold typography on solid colors</option>
                  <option>Photo + text overlay</option>
                  <option>Minimal clean white</option>
                  <option>Dark luxury feel</option>
                </select>
              </div>
              <div className="field">
                <label className="lbl">Brand colors (optional)</label>
                <input value={vcColors} onChange={(e) => setVcColors(e.target.value)} placeholder="e.g. Navy blue, gold" />
              </div>
            </div>
            <button onClick={runCarousel} disabled={loading || !vcTopic} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate Design Brief ✦'}</button>
          </>
        )}

        {activeTab === 'thumbnail' && (
          <>
            <div className="field mb-4">
              <label className="lbl">Video / post topic</label>
              <input value={vtTopic} onChange={(e) => setVtTopic(e.target.value)} placeholder="e.g. How I made ₹1 lakh in 30 days" />
            </div>
            <div className="g2 mb-5">
              <div className="field">
                <label className="lbl">Platform</label>
                <select value={vtPlatform} onChange={(e) => setVtPlatform(e.target.value)}>
                  <option>YouTube thumbnail</option>
                  <option>Instagram Reel cover</option>
                  <option>LinkedIn document cover</option>
                </select>
              </div>
              <div className="field">
                <label className="lbl">Style</label>
                <select value={vtStyle} onChange={(e) => setVtStyle(e.target.value)}>
                  <option>Face + bold text</option>
                  <option>Text-only typographic</option>
                  <option>Product showcase</option>
                  <option>Before/after split</option>
                </select>
              </div>
            </div>
            <button onClick={runThumbnail} disabled={loading || !vtTopic} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate Thumbnail Concept ✦'}</button>
          </>
        )}

        {activeTab === 'story' && (
          <>
            <div className="g2 mb-4">
              <div className="field">
                <label className="lbl">Story purpose</label>
                <select value={vsPurpose} onChange={(e) => setVsPurpose(e.target.value)}>
                  <option>Product launch announcement</option>
                  <option>Poll / engagement story</option>
                  <option>Behind the scenes</option>
                  <option>Sale / offer announcement</option>
                </select>
              </div>
              <div className="field">
                <label className="lbl">Brand personality</label>
                <select value={vsPersonality} onChange={(e) => setVsPersonality(e.target.value)}>
                  <option>Fun & casual</option>
                  <option>Premium & elegant</option>
                  <option>Bold & loud</option>
                  <option>Minimal & clean</option>
                </select>
              </div>
            </div>
            <div className="field mb-5">
              <label className="lbl">Core message</label>
              <input value={vsMessage} onChange={(e) => setVsMessage(e.target.value)} placeholder="e.g. 50% off ends tonight" />
            </div>
            <button onClick={runStory} disabled={loading || !vsMessage} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate Story Brief ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Generated Brief
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="save-output-btn">Save</button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box output-purple">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}