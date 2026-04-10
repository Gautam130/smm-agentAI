'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

const quickPrompts = [
  { label: '🎬 Reel caption', prompt: 'Write a catchy Instagram Reel caption for my product' },
  { label: '📅 7-day content plan', prompt: 'Create a 7-day content plan for my business' },
  { label: '🎯 10 hooks', prompt: 'Generate 10 viral hooks for my content' },
  { label: '🏆 Competitor analysis', prompt: 'Analyze my competitors on social media' },
  { label: '💬 DM flow', prompt: 'Create a DM outreach sequence' },
  { label: '🪔 Festive campaign', prompt: 'Plan a festive campaign for upcoming festival' },
  { label: '🔍 Research market', prompt: 'Research my market and audience' },
  { label: '📊 Competitor audit', prompt: 'Do a competitor audit' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const userName = user?.email?.split('@')[0] || '';
  const greeting = userName ? `Hi ${userName},` : '';

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults('');
    setShowResults(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: query }] })
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
      setResults(text || 'No response');
    } catch (e: any) {
      setResults(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <div className="content-area" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div className="home-hero" style={{ textAlign: 'center' }}>
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot"></span>
          Live web intelligence · 2026
        </div>
        
        <h1 className="hero-h1">
          {greeting && <span style={{ display: 'block', fontSize: '18px', fontWeight: 500, color: '#00ffcc', marginBottom: '8px' }}>{greeting}</span>}
          What do you want to <span>create today?</span>
        </h1>
        
        <p className="hero-p">Your AI social media agent — just describe what you need</p>
        
        {/* Agent Input */}
        <div style={{ position: 'relative', marginBottom: '12px', maxWidth: '720px', margin: '0 auto 12px' }}>
          <textarea 
            id="agent-input"
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }} 
            placeholder="e.g. I run a cafe in Jaipur — what should I post this week?
e.g. Write 5 Instagram Reels hooks for my skincare brand
e.g. Find yoga influencers in Delhi for my brand" 
            rows={3}
          />
          <button 
            id="agent-send-btn"
            onClick={handleSearch} 
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </button>
        </div>
        
        {/* Quick Prompts */}
        <div id="quick-prompts" style={{ marginBottom: '8px' }}>
          {quickPrompts.map((qp, i) => (
            <button key={i} onClick={() => handleQuickPrompt(qp.prompt)}>
              {qp.label}
            </button>
          ))}
        </div>
        
        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Press Enter to send · Shift+Enter for new line · <b>Ctrl+Enter</b> works too</div>
      </div>
      
      {/* Output */}
      {showResults && (
        <div className="output-wrap show">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Agent response
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(results)}>Copy</button>
              <button className="save-output-btn">Save</button>
              <button className="copy-output" onClick={() => setShowResults(false)} style={{ border: 'none', background: 'transparent' }}>✕ Clear</button>
            </div>
          </div>
          <div id="agent-output-box" className="output-box">
            {loading ? 'Thinking...' : results}
          </div>
        </div>
      )}
      
      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div className="hbadge">
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>0</span> queued today
        </div>
        <div className="hbadge">
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>0</span> saved outputs
        </div>
        <div className="hbadge">
          No client selected
        </div>
      </div>
      
      {/* Section Divider */}
      <div className="section-header">
        <div className="section-title">Or go directly to a module</div>
        <div className="section-line"></div>
      </div>
      
      {/* Module Cards */}
      <div className="quick-grid">
        {[
          { title: 'Content', desc: 'Captions, hooks, threads', icon: '✍️', tag: 'AI', class: 'nb-green', href: '/content' },
          { title: 'Calendar', desc: 'Full month content plan', icon: '📅', tag: 'AI', class: 'nb-green', href: '/calendar' },
          { title: 'Influencers', desc: 'Find, pitch, track', icon: '🤝', tag: 'Live', class: 'nb-purple', href: '/influencer' },
          { title: 'Strategy', desc: 'Audit, trends, growth', icon: '📊', tag: 'Live', class: 'nb-purple', href: '/strategy' },
          { title: 'Bulk Generate', desc: '10 posts in one shot', icon: '⚡', tag: 'New', class: 'nb-amber', href: '/bulk' },
          { title: 'Listening', desc: 'Monitor, newsjack', icon: '🌐', tag: 'Live', class: 'nb-green', href: '/listen' },
          { title: 'Engagement', desc: 'Replies, DMs, crisis', icon: '💬', tag: 'AI', class: 'nb-purple', href: '/engage' },
          { title: 'Post Diagnosis', desc: 'Why did this flop?', icon: '🔬', tag: 'AI', class: 'nb-amber', href: '/diagnose' },
        ].map((card, i) => (
          <a key={i} href={card.href} className="q-card">
            <span className="q-icon">{card.icon}</span>
            <div className="q-title">{card.title}</div>
            <div className="q-desc">{card.desc}</div>
            <span className={`nbadge ${card.class}`}>{card.tag}</span>
          </a>
        ))}
      </div>
    </div>
  );
}