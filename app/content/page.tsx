'use client';

import { useState } from 'react';

type TabType = 'write' | 'hooks' | 'hashtags' | 'thread';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('write');
  
  const [format, setFormat] = useState('Reel caption');
  const [platform, setPlatform] = useState('Instagram');
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Conversational & fun');
  const [variations, setVariations] = useState('1 version');
  
  const [hookTopic, setHookTopic] = useState('');
  const [hookFormat, setHookFormat] = useState('Reel opening line');
  const [hookNiche, setHookNiche] = useState('');
  
  const [htNiche, setHtNiche] = useState('');
  const [htPlatform, setHtPlatform] = useState('Instagram');
  const [htTopic, setHtTopic] = useState('');
  
  const [thPlatform, setThPlatform] = useState('LinkedIn post');
  const [thIndustry, setThIndustry] = useState('');
  const [thTopic, setThTopic] = useState('');
  const [thStyle, setThStyle] = useState('Storytelling (personal experience)');
  
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

  const runWrite = () => generate(`Generate a ${format} for ${platform}. Niche: ${niche}. Audience: ${audience}. Topic: ${topic}. Tone: ${tone}. Create ${variations}.`);
  const runHooks = () => generate(`Generate 10 ${hookFormat} for: ${hookTopic}. Niche: ${hookNiche}.`);
  const runHashtags = () => generate(`Generate hashtag set for ${htPlatform}. Niche: ${htNiche}. Topic: ${htTopic}.`);
  const runThread = () => generate(`Write a ${thPlatform} about: ${thTopic}. Industry: ${thIndustry}. Style: ${thStyle}.`);

  const tabs = [
    { id: 'write', label: 'Write content' },
    { id: 'hooks', label: '10 hooks' },
    { id: 'hashtags', label: 'Hashtags' },
    { id: 'thread', label: 'LinkedIn / Thread' },
  ] as const;

  return (
    <div className="content-area" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="module-tile">
        {/* Sub-tabs */}
        <div className="stabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`stab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setResult(''); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'write' && (
          <>
            <div className="g2">
              <div className="field">
                <label className="lbl">Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option>Reel caption</option>
                  <option>Carousel script (slide by slide)</option>
                  <option>Static post caption</option>
                  <option>Story text / poll</option>
                  <option>Twitter / X thread</option>
                  <option>LinkedIn post</option>
                  <option>YouTube description</option>
                  <option>Instagram bio</option>
                </select>
              </div>
              <div className="field">
                <label className="lbl">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>YouTube</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field">
                <label className="lbl">Niche / industry</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. organic skincare, fitness coaching" />
              </div>
              <div className="field">
                <label className="lbl">Target audience</label>
                <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Indian women 25-35, startup founders" />
              </div>
            </div>
            <div className="field">
              <label className="lbl">Topic / key message</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is this post about? Any specific angle, offer, or CTA?" rows={2} />
            </div>
            <div className="g2">
              <div className="field">
                <label className="lbl">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option>Conversational & fun</option>
                  <option>Professional & authoritative</option>
                  <option>Inspirational</option>
                  <option>Educational</option>
                  <option>Bold & edgy</option>
                  <option>Humble & personal</option>
                  <option>Hinglish (Hindi + English)</option>
                </select>
              </div>
              <div className="field">
                <label className="lbl">Variations</label>
                <select value={variations} onChange={(e) => setVariations(e.target.value)}>
                  <option>1 version</option>
                  <option>2 versions (A/B test)</option>
                  <option>3 versions</option>
                </select>
              </div>
            </div>
            <button className="run-btn" onClick={runWrite} disabled={loading || !topic}>
              {loading ? <>Generating...</> : 'Generate content ✦'}
            </button>
          </>
        )}

        {activeTab === 'hooks' && (
          <>
            <div className="g2">
              <div className="field">
                <label className="lbl">Topic</label>
                <input value={hookTopic} onChange={(e) => setHookTopic(e.target.value)} placeholder="e.g. why most diets fail after 3 weeks" />
              </div>
              <div className="field">
                <label className="lbl">Format</label>
                <select value={hookFormat} onChange={(e) => setHookFormat(e.target.value)}>
                  <option>Reel opening line</option>
                  <option>Carousel cover slide</option>
                  <option>Post opening sentence</option>
                  <option>YouTube title</option>
                  <option>Email subject line</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="lbl">Niche</label>
              <input value={hookNiche} onChange={(e) => setHookNiche(e.target.value)} placeholder="e.g. nutrition, personal finance, fashion" />
            </div>
            <button className="run-btn" onClick={runHooks} disabled={loading || !hookTopic}>
              {loading ? <>Generating...</> : 'Generate 10 hooks ✦'}
            </button>
          </>
        )}

        {activeTab === 'hashtags' && (
          <>
            <div className="g2">
              <div className="field">
                <label className="lbl">Niche</label>
                <input value={htNiche} onChange={(e) => setHtNiche(e.target.value)} placeholder="e.g. sustainable fashion India" />
              </div>
              <div className="field">
                <label className="lbl">Platform</label>
                <select value={htPlatform} onChange={(e) => setHtPlatform(e.target.value)}>
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>TikTok</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="lbl">Post topic</label>
              <input value={htTopic} onChange={(e) => setHtTopic(e.target.value)} placeholder="e.g. new collection launch, styling tips" />
            </div>
            <button className="run-btn" onClick={runHashtags} disabled={loading || !htNiche}>
              {loading ? <>Generating...</> : 'Generate hashtag set ✦'}
            </button>
          </>
        )}

        {activeTab === 'thread' && (
          <>
            <div className="g2">
              <div className="field">
                <label className="lbl">Platform</label>
                <select value={thPlatform} onChange={(e) => setThPlatform(e.target.value)}>
                  <option>LinkedIn post</option>
                  <option>Twitter / X thread</option>
                  <option>LinkedIn carousel document</option>
                </select>
              </div>
              <div className="field">
                <label className="lbl">Industry / role</label>
                <input value={thIndustry} onChange={(e) => setThIndustry(e.target.value)} placeholder="e.g. SaaS founder, marketing consultant, CA" />
              </div>
            </div>
            <div className="field">
              <label className="lbl">Topic / insight to share</label>
              <textarea value={thTopic} onChange={(e) => setThTopic(e.target.value)} placeholder="e.g. Why I shut down my startup after 2 years — 5 lessons. Or: How I grew from 0 to 10k followers in 90 days." rows={2} />
            </div>
            <div className="field">
              <label className="lbl">Writing style</label>
              <select value={thStyle} onChange={(e) => setThStyle(e.target.value)}>
                <option>Storytelling (personal experience)</option>
                <option>Educational (tips & frameworks)</option>
                <option>Controversial opinion</option>
                <option>Data-driven insights</option>
                <option>Behind-the-scenes</option>
              </select>
            </div>
            <button className="run-btn" onClick={runThread} disabled={loading || !thTopic}>
              {loading ? <>Generating...</> : 'Write post ✦'}
            </button>
          </>
        )}
      </div>
      
      {result && (
        <div className="output-wrap show">
          <div className="output-header">
            <div className="output-label">Generated Content</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="save-output-btn">Save</button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}