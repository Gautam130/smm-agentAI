'use client';

import { useState, useEffect, useRef } from 'react';

type NavPage = 'home' | 'maya' | 'client' | 'content' | 'visual' | 'meme' | 'calendar' | 'festive' | 'repurpose' | 'schedule' | 'queue' | 'history' | 'ideas' | 'bulk' | 'influencer' | 'strategy' | 'research' | 'listen' | 'engage' | 'ads' | 'report' | 'diagnose' | 'profile' | 'analytics-dashboard' | 'ab-testing' | 'brand' | 'saved' | 'settings';

interface NavItem {
  id: NavPage;
  label: string;
  icon: string;
  badge?: string;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Quick Access',
    items: [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'maya', label: 'Ask Maya', icon: '💬', badge: 'Live' },
      { id: 'client', label: 'Client', icon: '👤' },
    ]
  },
  {
    label: 'Create',
    items: [
      { id: 'content', label: 'Content', icon: '📝', badge: 'AI' },
      { id: 'visual', label: 'Visual Direction', icon: '🎨', badge: 'New' },
      { id: 'meme', label: 'Meme & Viral', icon: '😂', badge: 'New' },
      { id: 'calendar', label: 'Calendar', icon: '📅', badge: 'AI' },
      { id: 'festive', label: 'Festive Campaigns', icon: '🎉', badge: 'New' },
      { id: 'repurpose', label: 'Repurpose', icon: '♻️', badge: 'AI' },
    ]
  },
  {
    label: 'Manage',
    items: [
      { id: 'schedule', label: 'Schedule', icon: '⏰' },
      { id: 'queue', label: 'Queue', icon: '📋', badge: '0' },
      { id: 'history', label: 'Post History', icon: '📜', badge: '0' },
      { id: 'ideas', label: 'Idea Bank', icon: '💡', badge: '0' },
      { id: 'bulk', label: 'Bulk Generate', icon: '⚡', badge: 'New' },
      { id: 'influencer', label: 'Influencer', icon: '👥' },
    ]
  },
  {
    label: 'Strategy',
    items: [
      { id: 'strategy', label: 'Strategy', icon: '🎯' },
      { id: 'research', label: 'Research', icon: '🔍', badge: 'AI' },
      { id: 'listen', label: 'Social Listen', icon: '👂' },
      { id: 'engage', label: 'Engage', icon: '💬' },
      { id: 'ads', label: 'Ads Manager', icon: '📢' },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { id: 'report', label: 'Report', icon: '📊', badge: 'AI' },
      { id: 'diagnose', label: 'Post Diagnosis', icon: '🔎' },
      { id: 'profile', label: 'Profile Optimizer', icon: '👤' },
      { id: 'analytics-dashboard', label: 'Dashboard', icon: '📈' },
      { id: 'ab-testing', label: 'A/B Testing', icon: '🧪' },
    ]
  },
  {
    label: 'Brand',
    items: [
      { id: 'brand', label: 'Brand', icon: '🏷️' },
      { id: 'saved', label: 'Saved', icon: '⭐' },
    ]
  }
];

const quickPrompts = [
  { label: '🎬 Reel caption', prompt: 'Write a viral Reel caption for' },
  { label: '📅 7-day plan', prompt: 'Create a 7-day content calendar for' },
  { label: '🎯 10 hooks', prompt: 'Generate 10 engaging hooks for' },
  { label: ' Competitor analysis', prompt: 'Do a competitor analysis for' },
  { label: '💬 DM flow', prompt: 'Write a DM outreach sequence for' },
  { label: '🪔 Festive campaign', prompt: 'Create a festive campaign for' },
  { label: '🔍 Research', prompt: 'Research market trends for' },
  { label: '📊 Audit', prompt: 'Audit social media presence of' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080808', color: '#ffffff', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <aside style={{ width: '280px', backgroundColor: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, #0a0a0a 0%, rgba(10,10,10,0.5) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #00ffcc, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px', color: '#080808', boxShadow: '0 4px 20px rgba(0,255,204,0.2)' }}>SMM</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>SMM Agent</div>
          </div>
        </div>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,10,10,0.5)' }}>
          <div style={{ fontSize: '10px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px' }}>Active client</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select style={{ flex: 1, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>
              <option value="">— No client selected —</option>
            </select>
            <button style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.3)', color: '#00ffcc', fontSize: '20px', cursor: 'pointer' }}>+</button>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '4px' }}>
              <button onClick={() => toggleGroup(group.label)} style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#71717a', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '8px' }}>
                {group.label}
                <span style={{ transform: collapsedGroups.has(group.label) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '10px' }}>▼</span>
              </button>
              {!collapsedGroups.has(group.label) && (
                <div style={{ overflow: 'hidden' }}>
                  {group.items.map((item) => (
                    <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: currentPage === item.id ? 'rgba(0,255,204,0.08)' : 'transparent', border: 'none', borderRadius: '8px', color: currentPage === item.id ? '#00ffcc' : '#a1a1aa', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontWeight: currentPage === item.id ? 600 : 500, transition: 'all 0.15s', marginBottom: '2px' }}>
                      <span style={{ width: '18px', height: '18px', opacity: currentPage === item.id ? 1 : 0.7 }}>{item.icon}</span>
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                      {item.badge && <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, background: item.badge === 'Live' ? 'rgba(0,255,204,0.2)' : item.badge === 'AI' ? 'rgba(74,222,128,0.2)' : item.badge === 'New' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.1)', color: item.badge === 'Live' ? '#00ffcc' : item.badge === 'AI' ? '#4ade80' : item.badge === 'New' ? '#a855f7' : '#ffffff' }}>{item.badge}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>{navGroups.flatMap(g => g.items).find(i => i.id === currentPage)?.label || 'Home'}</div>
            <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>Your AI-powered social media agent</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.3)', borderRadius: '24px', fontSize: '12px', color: '#00ffcc', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ffcc', animation: 'pulse 2s infinite' }}></span>
              Live Search ON
            </div>
            <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>👤 User</button>
          </div>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', maxWidth: '1800px', margin: '0 auto', width: '100%' }}>
          <PageContent page={currentPage} />
        </div>
      </main>
    </div>
  );
}

function PageContent({ page }: { page: string }) {
  switch (page) {
    case 'home': return <HomePage />;
    case 'maya': return <MayaChat />;
    case 'content': return <ContentPage />;
    case 'research': return <ResearchPage />;
    case 'influencer': return <InfluencerPage />;
    case 'calendar': return <CalendarPage />;
    case 'strategy': return <StrategyPage />;
    case 'settings': return <SettingsPage />;
    default: return <ComingSoon page={page} />;
  }
}

function HomePage() {
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
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: query }] }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; setResults(prev => prev + decoder.decode(value, { stream: true })); } }
    } catch { setResults('Error connecting to API'); }
    finally { setLoading(false); }
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '32px', padding: '48px 20px', position: 'relative', overflow: 'hidden', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,204,0.2) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-150px', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }}></div>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.3)', borderRadius: '24px', fontSize: '12px', color: '#00ffcc', fontWeight: 600, marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ffcc', animation: 'pulse 2s infinite' }}></span>
          Live web intelligence · 2026
        </div>
        
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '42px', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
          What do you want to <span style={{ background: 'linear-gradient(90deg, #00ffcc, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>create today?</span>
        </h1>
        
        <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '32px', position: 'relative', zIndex: 1 }}>Your AI social media agent — just describe what you need</p>
        
        <div style={{ marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }} placeholder="e.g. I run a cafe in Jaipur — what should I post this week?
e.g. Write 5 Instagram Reels hooks for my skincare brand
e.g. Find yoga influencers in Delhi for my brand" rows={3} style={{ width: '100%', background: '#111111', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 56px 16px 18px', fontSize: '14px', color: '#ffffff', resize: 'none', outline: 'none', lineHeight: 1.6, transition: 'border 0.2s' }} />
          <button onClick={handleSearch} disabled={loading} style={{ position: 'absolute', right: '12px', bottom: '12px', width: '36px', height: '36px', borderRadius: '9px', background: '#00ffcc', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: loading ? 0.5 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#000" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
          {quickPrompts.map((qp, i) => (
            <button key={i} onClick={() => handleQuickPrompt(qp.prompt)} style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#a1a1aa', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{qp.label}</button>
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
          <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', fontSize: '13px', lineHeight: 1.8, color: '#ffffff', borderLeft: '2px solid #00ffcc' }}>
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
          { title: 'Content', desc: 'Captions, hooks, threads', icon: '✍️', tag: 'AI', tagColor: 'rgba(0,255,204,0.2)', tagText: '#00ffcc', page: 'content' },
          { title: 'Calendar', desc: 'Full month content plan', icon: '📅', tag: 'AI', tagColor: 'rgba(0,255,204,0.2)', tagText: '#00ffcc', page: 'calendar' },
          { title: 'Influencers', desc: 'Find, pitch, track', icon: '🤝', tag: 'Live', tagColor: 'rgba(168,85,247,0.2)', tagText: '#a855f7', page: 'influencer' },
          { title: 'Strategy', desc: 'Audit, trends, growth', icon: '📊', tag: 'Live', tagColor: 'rgba(168,85,247,0.2)', tagText: '#a855f7', page: 'strategy' },
          { title: 'Bulk Generate', desc: '10 posts in one shot', icon: '⚡', tag: 'New', tagColor: 'rgba(251,191,36,0.1)', tagText: '#fbbf24', page: 'bulk' },
          { title: 'Listening', desc: 'Monitor, newsjack', icon: '🌐', tag: 'Live', tagColor: 'rgba(0,255,204,0.2)', tagText: '#00ffcc', page: 'listen' },
          { title: 'Engagement', desc: 'Replies, DMs, crisis', icon: '💬', tag: 'AI', tagColor: 'rgba(168,85,247,0.2)', tagText: '#a855f7', page: 'engage' },
          { title: 'Post Diagnosis', desc: 'Why did this flop?', icon: '🔬', tag: 'AI', tagColor: 'rgba(239,68,68,0.1)', tagText: '#ef4444', page: 'diagnose' },
        ].map((card, i) => (
          <button key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left', backdropFilter: 'blur(15px)' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,204,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,204,0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: '28px', marginBottom: '16px' }}>{card.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '8px' }}>{card.title}</div>
            <div style={{ fontSize: '13px', color: '#71717a', marginBottom: '14px' }}>{card.desc}</div>
            <span style={{ fontSize: '10px', padding: '5px 12px', borderRadius: '20px', fontWeight: 700, background: card.tagColor, color: card.tagText, border: '1px solid transparent' }}>{card.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ContentPage() {
  const [format, setFormat] = useState('Reel caption');
  const [platform, setPlatform] = useState('Instagram');
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Conversational & fun');
  const [variations, setVariations] = useState('1 version');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const generateContent = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setContent('');
    setShowOutput(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'system', content: `You are an expert social media content creator. Create ${format} for ${platform}. Tone: ${tone}. Niche: ${niche}. Audience: ${audience}.` }, { role: 'user', content: `Create ${variations} for: ${topic}. Include hashtags and caption.` }] }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; setContent(prev => prev + decoder.decode(value, { stream: true })); } }
    } catch { setContent('Error generating content'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {['Write content', '10 hooks', 'Hashtags', 'LinkedIn / Thread'].map((tab, i) => (
          <button key={tab} style={{ flex: 1, padding: '10px 16px', background: i === 0 ? 'rgba(0,255,204,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: i === 0 ? '#00ffcc' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff', fontSize: '14px' }}>
            <option>Reel caption</option><option>Carousel script</option><option>Static post caption</option><option>Story text / poll</option><option>Twitter / X thread</option><option>LinkedIn post</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff', fontSize: '14px' }}>
            <option>Instagram</option><option>Facebook</option><option>LinkedIn</option><option>Twitter/X</option><option>YouTube</option>
          </select>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Niche / industry</label>
          <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. organic skincare, fitness coaching" style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff', fontSize: '14px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Target audience</label>
          <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Indian women 25-35, startup founders" style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff', fontSize: '14px' }} />
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Topic / key message</label>
        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is this post about? Any specific angle, offer, or CTA?" rows={2} style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff', fontSize: '14px', resize: 'none' }} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff', fontSize: '14px' }}>
            <option>Conversational &amp; fun</option><option>Professional &amp; authoritative</option><option>Inspirational</option><option>Educational</option><option>Bold &amp; edgy</option><option>Hinglish (Hindi + English)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Variations</label>
          <select value={variations} onChange={(e) => setVariations(e.target.value)} style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', color: '#ffffff', fontSize: '14px' }}>
            <option>1 version</option><option>2 versions (A/B test)</option><option>3 versions</option>
          </select>
        </div>
      </div>
      
      <button onClick={generateContent} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(0,255,204,0.2)', opacity: loading ? 0.5 : 1 }}>
        {loading ? <><span className="spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#080808', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></span> Generating...</> : 'Generate content ✦'}
      </button>
      
      {showOutput && (
        <div style={{ marginTop: '24px', animation: 'fadeSlideIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#00ffcc', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00ffcc', boxShadow: '0 0 10px rgba(0,255,204,0.2)' }}></span>
              Generated Content
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ padding: '8px 16px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', color: '#a855f7', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#a1a1aa', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Copy</button>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', fontSize: '14px', lineHeight: 1.85, borderLeft: '2px solid #00ffcc' }}>
            {content || 'Generating...'}
          </div>
        </div>
      )}
    </div>
  );
}

function ResearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{title: string; snippet: string; url: string; domain: string}[]>([]);
  const [aiSummary, setAiSummary] = useState('');

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setAiSummary('');
    try {
      const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, provider: 'serper', maxResults: 8 }) });
      const data = await res.json();
      setResults(data.results || []);
      if (data.results?.length > 0) {
        const summaryRes = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'system', content: 'You are a research assistant. Summarize the search results concisely.' }, { role: 'user', content: `Summarize these search results about "${query}":\n\n${data.results.slice(0,5).map((r: unknown) => `- ${(r as {title: string}).title}: ${(r as {snippet: string}).snippet}`).join('\n')}` }] }) });
        const reader = summaryRes.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; setAiSummary(prev => prev + decoder.decode(value, { stream: true })); } }
      }
    } catch { console.error('Search error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="Research any topic, brand, competitor..." style={{ flex: 1, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 20px', color: '#ffffff', fontSize: '16px' }} />
          <button onClick={doSearch} disabled={loading} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', color: '#080808', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Searching...' : '🔍 Search'}</button>
        </div>
      </div>
      {aiSummary && <div style={{ background: '#0a0a0a', borderRadius: '12px', padding: '20px', marginBottom: '16px', borderLeft: '3px solid #00ffcc' }}><div style={{ fontSize: '12px', color: '#00ffcc', marginBottom: '8px', fontWeight: 700 }}>AI SUMMARY</div><div style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{aiSummary}</div></div>}
      {results.map((r, i) => <a key={i} href={r.url} target="_blank" rel="noopener" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '12px' }}><div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: '#00ffcc' }}>{r.title}</div><div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>{r.snippet?.substring(0, 200)}...</div><div style={{ fontSize: '12px', color: '#71717a' }}>{r.domain}</div></a>)}
    </div>
  );
}

function InfluencerPage() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('India');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{title: string; snippet: string; url: string}[]>([]);

  const searchInfluencers = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: `${niche} influencer ${city}`, provider: 'serper', maxResults: 10 }) });
      const data = await res.json();
      setResults(data.results || []);
    } catch { console.error('Error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Niche / Category</label>
            <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Fashion, Tech, Food" style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Location</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="India" style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px' }} />
          </div>
        </div>
        <button onClick={searchInfluencers} disabled={loading} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: '#ffffff', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Searching...' : '🔍 Find Influencers'}</button>
      </div>
      {results.map((r, i) => <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}><div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{r.title || 'Influencer'}</div><div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '12px' }}>{r.snippet?.substring(0, 100)}...</div><a href={r.url} target="_blank" rel="noopener" style={{ color: '#00ffcc', fontSize: '13px' }}>View Profile →</a></div>)}
    </div>
  );
}

function CalendarPage() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const generateCalendar = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSchedule('');
    setShowOutput(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'system', content: 'Create a 7-day social media content calendar with dates, post ideas, and timing recommendations.' }, { role: 'user', content: `Create a content calendar for ${platform}. Topic: ${prompt}. Include specific dates and times.` }] }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; setSchedule(prev => prev + decoder.decode(value, { stream: true })); } }
    } catch { setSchedule('Error generating calendar'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Campaign / Topic</label>
            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. Product launch, festival sale" style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px' }}>
              <option>Instagram</option><option>LinkedIn</option><option>Twitter/X</option><option>YouTube</option><option>Facebook</option>
            </select>
          </div>
        </div>
        <button onClick={generateCalendar} disabled={loading} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', color: '#080808', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Generating...' : '📅 Generate Calendar'}</button>
      </div>
      {showOutput && schedule && <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}><h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Your 7-Day Calendar</h3><div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.6 }}>{schedule}</div></div>}
    </div>
  );
}

function StrategyPage() {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const generateStrategy = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setStrategy('');
    setShowOutput(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'system', content: 'You are a social media strategy expert. Create comprehensive marketing strategies with actionable steps.' }, { role: 'user', content: `Create a detailed social media strategy for: ${goal}. Include target audience, content pillars, posting strategy, and KPIs.` }] }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; setStrategy(prev => prev + decoder.decode(value, { stream: true })); } }
    } catch { setStrategy('Error generating strategy'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Marketing Goal</label>
          <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Increase brand awareness, drive sales, launch new product" style={{ width: '100%', background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px' }} />
        </div>
        <button onClick={generateStrategy} disabled={loading} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #ffb947 0%, #f59e0b 100%)', color: '#080808', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Generating...' : '🎯 Create Strategy'}</button>
      </div>
      {showOutput && strategy && <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}><h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Your Strategy</h3><div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.6 }}>{strategy}</div></div>}
    </div>
  );
}

function SettingsPage() {
  const [apiStatus, setApiStatus] = useState<Record<string, string>>({});

  const testApi = async (name: string, endpoint: string) => {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'test' }) });
      setApiStatus(prev => ({ ...prev, [name]: res.ok ? '✅ Connected' : '❌ Error' }));
    } catch {
      setApiStatus(prev => ({ ...prev, [name]: '❌ Not configured' }));
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>API Status</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[{ name: 'Chat (Mistral)', endpoint: '/api/chat' }, { name: 'Search (Serper)', endpoint: '/api/search' }].map(api => (
            <div key={api.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#0a0a0a', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px' }}>{api.name}</span>
              <button onClick={() => testApi(api.name, api.endpoint)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#a1a1aa', fontSize: '12px', cursor: 'pointer' }}>Test</button>
            </div>
          ))}
          {Object.entries(apiStatus).map(([name, status]) => <div key={name} style={{ fontSize: '13px', color: status.includes('Connected') ? '#4ade80' : '#ffb947' }}>{name}: {status}</div>)}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Environment Variables</h3>
        <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '12px' }}>These are configured in Vercel.</p>
        <div style={{ background: '#0a0a0a', borderRadius: '8px', padding: '16px', fontSize: '12px', fontFamily: 'monospace', color: '#a1a1aa', overflow: 'auto' }}>
          <div>GROQ_API_KEY / MISTRAL_API_KEY</div>
          <div>SERPER_API_KEY / EXA_KEY / GNEWS_KEY</div>
          <div>FINNHUB_KEY / INSTAGRAM_ACCESS_TOKEN</div>
          <div>SUPABASE_URL / SUPABASE_SERVICE_KEY</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>About</h3>
        <p style={{ fontSize: '13px', color: '#71717a' }}>SMM Agent v2.0 - Built with Next.js 16, React 19, and AI-powered features.</p>
      </div>
    </div>
  );
}

function MayaChat() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...chatHistory, { role: 'user', content: userMessage }] }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; assistantMessage += decoder.decode(value, { stream: true }); setChatHistory(prev => [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }]); } }
    } catch { console.error('Chat error'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px' }}>Ask Maya</div>
      </div>
      <div style={{ background: '#0a0a0a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', minHeight: '400px', maxHeight: '520px', overflowY: 'auto', padding: '16px 12px' }}>
        {chatHistory.length === 0 ? (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
            {['Best Instagram strategy for D2C India', '5 hooks for skincare brand', 'Research boAt marketing', 'Diwali campaign 50k budget'].map((s, i) => (
              <button key={i} onClick={() => setMessage(s)} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#a1a1aa', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        ) : null}
        {chatHistory.map((msg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', animation: 'msgFadeIn 0.25s ease', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, background: msg.role === 'assistant' ? 'linear-gradient(135deg, #00ffcc, #a855f7)' : 'rgba(255,255,255,0.06)', border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.08)' : 'none', color: msg.role === 'assistant' ? '#080808' : '#71717a' }}>
              {msg.role === 'assistant' ? 'AI' : 'U'}
            </div>
            <div style={{ maxWidth: '78%', minWidth: '120px', padding: '12px 16px', borderRadius: '16px', fontSize: '13px', lineHeight: 1.7, wordBreak: 'break-word', background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(0,255,204,0.12) 0%, rgba(168,85,247,0.08) 100%)' : '#111111', border: msg.role === 'user' ? '1px solid rgba(0,255,204,0.2)' : '1px solid rgba(255,255,255,0.08)', borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px', borderTopRightRadius: msg.role === 'user' ? '4px' : '16px', color: '#ffffff' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#00ffcc' }}>▋</div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a', borderRadius: '0 0 16px 16px', marginTop: '-1px' }}>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask anything..." rows={2} style={{ flex: 1, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '13px', resize: 'none', minHeight: '44px', maxHeight: '120px' }} />
        <button onClick={handleSend} disabled={loading} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', border: 'none', borderRadius: '12px', color: '#080808', fontWeight: 600, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer' }}>Send ↑</button>
      </div>
    </div>
  );
}

function ComingSoon({ page }: { page: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#71717a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}</div>
        <div style={{ fontSize: '14px' }}>Coming soon...</div>
      </div>
    </div>
  );
}