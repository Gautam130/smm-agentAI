'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const analyze = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Analyze Instagram profile @${username} and provide optimization suggestions. Include bio recommendations, highlight reel ideas, and content strategy.` }] })
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

  const generateBio = async () => {
    if (!bio.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Generate 5 optimized Instagram bio options for: ${bio}. Include emojis and CTAs.` }] })
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

  return (
    <>
      <h2 className="module-title">👤 Profile Optimizer</h2>
      
      <div className="g2 mb-4">
        <div className="field">
          <label className="lbl">Analyze profile</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
            <button onClick={analyze} disabled={loading || !username} className="run-btn btn-purple">Analyze</button>
          </div>
        </div>
        <div className="field">
          <label className="lbl">Or generate bio</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your brand" />
            <button onClick={generateBio} disabled={loading || !bio} className="run-btn btn-purple">Generate</button>
          </div>
        </div>
      </div>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Optimization Suggestions
              <button className="clear-btn" onClick={() => setResult('')} title="Clear">✕</button>
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