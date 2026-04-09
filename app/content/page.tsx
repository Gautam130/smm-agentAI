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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: activeTab === tab.id ? 'rgba(0,255,204,0.1)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === tab.id ? '#00ffcc' : '#71717a',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'write' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} style={inputStyle}>
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
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={inputStyle}>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>YouTube</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Niche / industry</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. organic skincare, fitness coaching" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Target audience</label>
                <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Indian women 25-35, startup founders" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Topic / key message</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is this post about? Any specific angle, offer, or CTA?" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} style={inputStyle}>
                  <option>Conversational & fun</option>
                  <option>Professional & authoritative</option>
                  <option>Inspirational</option>
                  <option>Educational</option>
                  <option>Bold & edgy</option>
                  <option>Humble & personal</option>
                  <option>Hinglish (Hindi + English)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Variations</label>
                <select value={variations} onChange={(e) => setVariations(e.target.value)} style={inputStyle}>
                  <option>1 version</option>
                  <option>2 versions (A/B test)</option>
                  <option>3 versions</option>
                </select>
              </div>
            </div>
            <button onClick={runWrite} disabled={loading || !topic} style={btnStyle}>
              {loading ? 'Generating...' : 'Generate content ✦'}
            </button>
          </>
        )}

        {activeTab === 'hooks' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Topic</label>
                <input value={hookTopic} onChange={(e) => setHookTopic(e.target.value)} placeholder="e.g. why most diets fail after 3 weeks" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Format</label>
                <select value={hookFormat} onChange={(e) => setHookFormat(e.target.value)} style={inputStyle}>
                  <option>Reel opening line</option>
                  <option>Carousel cover slide</option>
                  <option>Post opening sentence</option>
                  <option>YouTube title</option>
                  <option>Email subject line</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Niche</label>
              <input value={hookNiche} onChange={(e) => setHookNiche(e.target.value)} placeholder="e.g. nutrition, personal finance, fashion" style={inputStyle} />
            </div>
            <button onClick={runHooks} disabled={loading || !hookTopic} style={btnStyle}>
              {loading ? 'Generating...' : 'Generate 10 hooks ✦'}
            </button>
          </>
        )}

        {activeTab === 'hashtags' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Niche</label>
                <input value={htNiche} onChange={(e) => setHtNiche(e.target.value)} placeholder="e.g. sustainable fashion India" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Platform</label>
                <select value={htPlatform} onChange={(e) => setHtPlatform(e.target.value)} style={inputStyle}>
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Twitter / X</option>
                  <option>TikTok</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Post topic</label>
              <input value={htTopic} onChange={(e) => setHtTopic(e.target.value)} placeholder="e.g. new collection launch, styling tips" style={inputStyle} />
            </div>
            <button onClick={runHashtags} disabled={loading || !htNiche} style={btnStyle}>
              {loading ? 'Generating...' : 'Generate hashtag set ✦'}
            </button>
          </>
        )}

        {activeTab === 'thread' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Platform</label>
                <select value={thPlatform} onChange={(e) => setThPlatform(e.target.value)} style={inputStyle}>
                  <option>LinkedIn post</option>
                  <option>Twitter / X thread</option>
                  <option>LinkedIn carousel document</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Industry / role</label>
                <input value={thIndustry} onChange={(e) => setThIndustry(e.target.value)} placeholder="e.g. SaaS founder, marketing consultant, CA" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Topic / insight to share</label>
              <textarea value={thTopic} onChange={(e) => setThTopic(e.target.value)} placeholder="e.g. Why I shut down my startup after 2 years — 5 lessons. Or: How I grew from 0 to 10k followers in 90 days." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Writing style</label>
              <select value={thStyle} onChange={(e) => setThStyle(e.target.value)} style={inputStyle}>
                <option>Storytelling (personal experience)</option>
                <option>Educational (tips & frameworks)</option>
                <option>Controversial opinion</option>
                <option>Data-driven insights</option>
                <option>Behind-the-scenes</option>
              </select>
            </div>
            <button onClick={runThread} disabled={loading || !thTopic} style={btnStyle}>
              {loading ? 'Generating...' : 'Write post ✦'}
            </button>
          </>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ffcc' }}></span>
              Generated Content
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={actionBtnStyle}>Save</button>
              <button style={actionBtnStyle}>Copy</button>
            </div>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111111',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '14px 18px',
  fontSize: '14px',
  color: '#ffffff',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)',
  color: '#080808',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const resultStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '24px',
  borderLeft: '2px solid #00ffcc',
};

const actionBtnStyle: React.CSSProperties = {
  fontSize: '11px',
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(168,85,247,0.1)',
  color: '#a855f7',
  cursor: 'pointer',
};