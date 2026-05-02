'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';

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
  
  const { response: result, isLoading: loading, sendMessage } = useModuleMaya();

  const runConcept = () => sendMessage([
    { role: 'user', content: `Generate meme concepts for ${brand}. Style: ${memeStyle}. Topic: ${topic}. Include 5 different meme formats with captions.` }
  ], { task: 'content', temperature: 0.8 });

  const runAudio = () => sendMessage([
    { role: 'user', content: `Suggest trending audio strategy for ${niche} on ${maPlatform}. Content type: ${contentType}. Include which trending audios to use and how to adapt them.` }
  ], { task: 'content', temperature: 0.7 });

  const runNewsjack = () => sendMessage([
    { role: 'user', content: `Create newsjacking content for trending topic: ${trendingTopic}. Brand: ${mjBrand}. Tone: ${mjTone}. Include multiple post variations.` }
  ], { task: 'content', temperature: 0.75 });

  const tabs = [
    { id: 'concept', label: 'Meme concept' },
    { id: 'audio', label: 'Trending audio' },
    { id: 'newsjack', label: 'Newsjacking' },
  ] as const;

  return (
    <>
      <div className="module-subtitle-green">
        🎯 Indian meme marketing done right — the Zomato, Swiggy, boAt playbook for your brand.
      </div>
      
      <div className="stabs">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); sendMessage([], { task: 'chat' }); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
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

      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Meme Concepts
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'chat' })} title="Clear">✕</button>
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
