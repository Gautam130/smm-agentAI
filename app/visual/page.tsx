'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';
import { saveOutput } from '@/lib/save';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
  
  const { response: result, isLoading: loading, sendMessage } = useModuleMaya();
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !result || saved) return;
    const res = await saveOutput({
      module: 'visual',
      title: `Visual brief: ${activeTab}`,
      content: result,
      metadata: { tab: activeTab },
      userId: user.id,
    });
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const runReel = () => sendMessage([
    { role: 'user', content: `Generate a shot list for Reel. Product: ${vrTopic}. Duration: ${vrDuration}. Vibe: ${vrVibe}. Key message: ${vrMessage}.` }
  ], { task: 'content', temperature: 0.7 });

  const runCarousel = () => sendMessage([
    { role: 'user', content: `Generate carousel design brief. Topic: ${vcTopic}. Slides: ${vcSlides}. Style: ${vcStyle}. Colors: ${vcColors}.` }
  ], { task: 'content', temperature: 0.7 });

  const runThumbnail = () => sendMessage([
    { role: 'user', content: `Generate thumbnail concept. Topic: ${vtTopic}. Platform: ${vtPlatform}. Style: ${vtStyle}.` }
  ], { task: 'content', temperature: 0.75 });

  const runStory = () => sendMessage([
    { role: 'user', content: `Generate story template. Purpose: ${vsPurpose}. Personality: ${vsPersonality}. Message: ${vsMessage}.` }
  ], { task: 'content', temperature: 0.7 });

  const tabs = [
    { id: 'reel', label: 'Reel shot list' },
    { id: 'carousel', label: 'Carousel brief' },
    { id: 'thumbnail', label: 'Thumbnail concept' },
    { id: 'story', label: 'Story template' },
  ] as const;

  return (
    <>
      <div className="module-subtitle-purple">
        🎨 Brief your designers and videographers properly — no more vague "make something nice" requests.
      </div>
      
      <div className="stabs">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); sendMessage([], { task: 'chat' }); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
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

      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Generated Brief
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'chat' })} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="save-output-btn" onClick={handleSave} disabled={saved}>
                {saved ? 'Saved ✓' : 'Save'}
              </button>
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
