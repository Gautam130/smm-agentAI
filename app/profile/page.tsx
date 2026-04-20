'use client';

import { useState } from 'react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { useSearch } from '@/lib/hooks/useSearch';

type TabType = 'analyze' | 'bio' | 'ideas';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('analyze');
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [currentBio, setCurrentBio] = useState('');

  const { response, isLoading, sendMessage } = useStreamingChat();
  const { data: searchData, execute: doSearch, isLoading: searchLoading } = useSearch();

  const analyze = async () => {
    if (!username) return;
    
    try {
      await doSearch('socialblade', username.replace('@', ''), { niche, limit: 5 });
      
      const prompt = `Analyze Instagram profile @${username}.

 Nic: ${niche || 'general'}
Target audience: ${audience || 'Indian consumers'}

SEARCH RESULTS:
${searchData?.results?.slice(0, 5).map((r: any) => `${r.title}: ${r.snippet}`).join('\n') || 'No profile data found'}

Provide:
- Profile strengths and weaknesses
- Bio optimization tips
- Highlight reel category ideas
- Content pillars suggestion
- CTA recommendations`;

      await sendMessage([
        { role: 'user', content: prompt }
      ], { task: 'content' });
    } catch (err) {
      console.error(err);
    }
  };

  const generateBio = async () => {
    if (!bio) return;
    
    const prompt = `Generate 5 optimized Instagram bio options for: ${bio}.
Niche: ${niche || 'general'}
Target audience: ${audience || 'Indian consumers'}

For each bio include:
- Line 1: Identity (what you do)
- Line 2: Social proof or differentiation  
- Line 3: CTA (DM, link, etc.)
- Emojis where appropriate
- Keep under 150 characters total`;

    await sendMessage([
      { role: 'user', content: prompt }
    ], { task: 'content' });
  };

  const generateIdeas = async () => {
    if (!niche || !audience) return;
    
    const prompt = `Generate highlight reel category ideas for Instagram profile.

Niche: ${niche}
Target audience: ${audience}

Provide 6-8 highlight categories with:
- Category name
- Type of content (Reel, Story, Static)
- Example topic for each`;

    await sendMessage([
      { role: 'user', content: prompt }
    ], { task: 'content' });
  };

  const tabs = [
    { id: 'analyze', label: 'Analyze Profile' },
    { id: 'bio', label: 'Generate Bio' },
    { id: 'ideas', label: 'Highlight Ideas' },
  ] as const;

  return (
    <>
      <h2 className="module-title">👤 Profile Optimizer</h2>
      
      <div className="stabs mb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analyze' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Instagram username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
            </div>
            <div className="field">
              <label className="lbl">Your niche</label>
              <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. skincare, fitness" />
            </div>
          </div>
          <div className="field mb-4">
            <label className="lbl">Target audience</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. women 25-35, students" />
          </div>
          <button onClick={analyze} disabled={isLoading || searchLoading || !username} className="run-btn btn-purple">
            {isLoading || searchLoading ? 'Analyzing...' : 'Analyze profile ✦'}
          </button>
        </>
      )}

      {activeTab === 'bio' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">What you do / brand</label>
              <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g. Ayurvedic skincare for sensitive skin" />
            </div>
            <div className="field">
              <label className="lbl">Your niche</label>
              <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. beauty, wellness" />
            </div>
          </div>
          <div className="field mb-4">
            <label className="lbl">Target audience</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. women 25-35" />
          </div>
          <button onClick={generateBio} disabled={isLoading || !bio} className="run-btn btn-purple">
            {isLoading ? 'Generating...' : 'Generate bio ✦'}
          </button>
        </>
      )}

      {activeTab === 'ideas' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Your niche</label>
              <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. fitness, food, fashion" />
            </div>
            <div className="field">
              <label className="lbl">Target audience</label>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. gym-goers, foodies" />
            </div>
          </div>
          <button onClick={generateIdeas} disabled={isLoading || !niche} className="run-btn btn-purple">
            {isLoading ? 'Generating...' : 'Generate ideas ✦'}
          </button>
        </>
      )}

      {searchData?.results && (
        <div className="output-wrap mb-4">
          <div className="output-header">
            <div className="output-label text-purple">🔍 Profile Data</div>
          </div>
          <div className="output-box" style={{ background: 'var(--bg-card)', maxHeight: '150px', overflow: 'auto' }}>
            {searchData.results.slice(0, 3).map((r: any, i: number) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                {r.title}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {response && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Results
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'content' })} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(response)}>Copy</button>
            </div>
          </div>
          <div className="output-box output-purple">
            {response}
          </div>
        </div>
      )}
    </>
  );
}