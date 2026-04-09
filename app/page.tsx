'use client';

import { useState } from 'react';

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
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState('');
  const [showResults, setShowResults] = useState(false);

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
    <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ 
        marginBottom: '32px', 
        padding: '48px 20px', 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: '24px', 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        backdropFilter: 'blur(20px)' 
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,204,0.2) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-150px', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }}></div>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.3)', borderRadius: '24px', fontSize: '12px', color: '#00ffcc', fontWeight: 600, marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ffcc', animation: 'pulse 2s infinite' }}></span>
          Live web intelligence · 2026
        </div>
        
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '42px', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
          What do you want to <span style={{ background: 'linear-gradient(90deg, #00ffcc, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>create today?</span>
        </h1>
        
        <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '32px', position: 'relative', zIndex: 1 }}>Your AI social media agent — just describe what you need</p>
        
        <div style={{ marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <textarea 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }} 
            placeholder="e.g. I run a cafe in Jaipur — what should I post this week?
e.g. Write 5 Instagram Reels hooks for my skincare brand
e.g. Find yoga influencers in Delhi for my brand" 
            rows={3} 
            style={{ 
              width: '100%', 
              background: '#111111', 
              border: '1.5px solid rgba(255,255,255,0.08)', 
              borderRadius: '14px', 
              padding: '16px 56px 16px 18px', 
              fontSize: '14px', 
              color: '#ffffff', 
              resize: 'none', 
              outline: 'none', 
              lineHeight: 1.6, 
              transition: 'border 0.2s',
              fontFamily: 'var(--font)',
            }} 
          />
          <button 
            onClick={handleSearch} 
            disabled={loading} 
            style={{ 
              position: 'absolute', 
              right: '12px', 
              bottom: '12px', 
              width: '36px', 
              height: '36px', 
              borderRadius: '9px', 
              background: '#00ffcc', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              transition: 'all 0.2s', 
              opacity: loading ? 0.5 : 1 
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#000" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
          {quickPrompts.map((qp, i) => (
            <button 
              key={i} 
              onClick={() => handleQuickPrompt(qp.prompt)} 
              style={{ 
                fontSize: '11px', 
                padding: '6px 12px', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.08)', 
                background: 'rgba(255,255,255,0.03)', 
                color: '#a1a1aa', 
                cursor: 'pointer', 
                fontFamily: 'var(--font)', 
                transition: 'all 0.15s' 
              }}
            >
              {qp.label}
            </button>
          ))}
        </div>
        
        <div style={{ fontSize: '11px', color: '#71717a', position: 'relative', zIndex: 1 }}>Press Enter to send · Shift+Enter for new line</div>
      </div>
      
      {showResults && (
        <div style={{ marginBottom: '32px', textAlign: 'left', animation: 'fadeSlideIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ffcc' }}></span>
              Agent response
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
              <button onClick={() => setShowResults(false)} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#71717a', cursor: 'pointer' }}>✕ Clear</button>
            </div>
          </div>
          <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', fontSize: '13px', lineHeight: 1.8, color: '#ffffff', borderLeft: '2px solid #00ffcc', whiteSpace: 'pre-wrap' }}>
            {loading ? 'Thinking...' : results}
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '11px', color: '#a1a1aa' }}>
          <span style={{ fontWeight: 700, color: '#ffffff' }}>0</span> queued today
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '11px', color: '#a1a1aa' }}>
          <span style={{ fontWeight: 700, color: '#ffffff' }}>0</span> saved outputs
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
        <div style={{ fontSize: '11px', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Or go directly to a module</div>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {[
          { title: 'Content', desc: 'Captions, hooks, threads', icon: '✍️', tag: 'AI', tagColor: 'rgba(0,255,204,0.2)', tagText: '#00ffcc', href: '/content' },
          { title: 'Calendar', desc: 'Full month content plan', icon: '📅', tag: 'AI', tagColor: 'rgba(0,255,204,0.2)', tagText: '#00ffcc', href: '/calendar' },
          { title: 'Influencers', desc: 'Find, pitch, track', icon: '🤝', tag: 'Live', tagColor: 'rgba(168,85,247,0.2)', tagText: '#a855f7', href: '/influencer' },
          { title: 'Strategy', desc: 'Audit, trends, growth', icon: '📊', tag: 'Live', tagColor: 'rgba(168,85,247,0.2)', tagText: '#a855f7', href: '/strategy' },
          { title: 'Bulk Generate', desc: '10 posts in one shot', icon: '⚡', tag: 'New', tagColor: 'rgba(251,191,36,0.1)', tagText: '#fbbf24', href: '/bulk' },
          { title: 'Listening', desc: 'Monitor, newsjack', icon: '🌐', tag: 'Live', tagColor: 'rgba(0,255,204,0.2)', tagText: '#00ffcc', href: '/listen' },
          { title: 'Engagement', desc: 'Replies, DMs, crisis', icon: '💬', tag: 'AI', tagColor: 'rgba(168,85,247,0.2)', tagText: '#a855f7', href: '/engage' },
          { title: 'Post Diagnosis', desc: 'Why did this flop?', icon: '🔬', tag: 'AI', tagColor: 'rgba(239,68,68,0.1)', tagText: '#ef4444', href: '/diagnose' },
        ].map((card, i) => (
          <a key={i} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '16px', 
              padding: '24px', 
              cursor: 'pointer', 
              transition: 'all 0.4s ease', 
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(15px)',
            }}>
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(135deg, rgba(0,255,204,0.03) 0%, transparent 60%)', 
                opacity: 0, 
                transition: 'opacity 0.3s',
              }} 
              className="card-hover"
              />
              <span style={{ fontSize: '28px', marginBottom: '16px', display: 'block' }}>{card.icon}</span>
              <div style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{card.title}</div>
              <div style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.5 }}>{card.desc}</div>
              <span style={{ 
                display: 'inline-block', 
                fontSize: '10px', 
                padding: '5px 12px', 
                borderRadius: '20px', 
                marginTop: '14px', 
                fontWeight: 700, 
                background: card.tagColor, 
                border: `0.5px solid ${card.tagColor}`, 
                color: card.tagText 
              }}>{card.tag}</span>
            </div>
          </a>
        ))}
      </div>

      <style jsx global>{`
        .card-hover:hover {
          opacity: 1 !important;
        }
        a > div:hover {
          border-color: rgba(0,255,204,0.2) !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,204,0.1);
        }
      `}</style>
    </div>
  );
}