'use client';

import { useState, useEffect, useRef } from 'react';

type NavPage = 'home' | 'maya' | 'client' | 'content' | 'visual' | 'meme' | 'calendar' | 'festive' | 'repurpose' | 'schedule' | 'queue' | 'history' | 'ideas' | 'bulk' | 'influencer' | 'strategy' | 'research' | 'listen' | 'engage' | 'ads' | 'report' | 'diagnose' | 'profile' | 'analytics-dashboard' | 'ab-testing' | 'brand' | 'saved' | 'settings';

interface NavItem {
  id: NavPage;
  label: string;
  icon: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
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
      <aside style={{ width: '260px', backgroundColor: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #00ffcc, #00ccaa)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: '#080808' }}>SMM</div>
          <div style={{ fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>SMM Agent</div>
        </div>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active client</div>
          <select style={{ width: '100%', backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>
            <option value="">— No client selected —</option>
          </select>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '4px' }}>
              <button onClick={() => toggleGroup(group.label)} style={{ width: '100%', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#71717a', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>
                {group.label}
                <span style={{ transform: collapsedGroups.has(group.label) ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '10px' }}>▼</span>
              </button>
              {!collapsedGroups.has(group.label) && (
                <div style={{ padding: '0 8px' }}>
                  {group.items.map((item) => (
                    <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: currentPage === item.id ? 'rgba(0,255,204,0.08)' : 'transparent', border: 'none', borderRadius: '8px', color: currentPage === item.id ? '#00ffcc' : '#a1a1aa', fontSize: '13px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && <span style={{ padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: item.badge === 'Live' ? 'rgba(0,255,204,0.2)' : item.badge === 'AI' ? 'rgba(74,222,128,0.2)' : item.badge === 'New' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.1)', color: item.badge === 'Live' ? '#00ffcc' : item.badge === 'AI' ? '#4ade80' : item.badge === 'New' ? '#a855f7' : '#ffffff' }}>{item.badge}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setCurrentPage('settings')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: currentPage === 'settings' ? '#00ffcc' : '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>
            <span style={{ fontSize: '16px' }}>⚙️</span>Settings
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '60px', backgroundColor: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa' }}>{navGroups.flatMap(g => g.items).find(i => i.id === currentPage)?.label || 'Home'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px 16px', backgroundColor: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '20px', fontSize: '12px', color: '#00ffcc' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00ffcc', marginRight: '6px', animation: 'pulse 2s infinite' }}></span>
              AI Active
            </div>
            <button style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>👤 User</button>
          </div>
        </header>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
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
    default: return <ComingSoon page={page} />;
  }
}

function HomePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults('');
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: query }] }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; setResults(prev => prev + decoder.decode(value, { stream: true })); } }
    } catch (error) { setResults('Error connecting to API'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Welcome to SMM Agent</h1>
      <p style={{ color: '#71717a', marginBottom: '32px' }}>Your AI-powered social media manager</p>
      <div style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '32px' }}>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Ask anything about marketing, brands, or trends..." style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 20px', color: '#ffffff', fontSize: '16px', outline: 'none', marginBottom: '16px' }} />
        <button onClick={handleSearch} disabled={loading} style={{ padding: '12px 24px', backgroundColor: '#00ffcc', color: '#080808', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Searching...' : 'Ask Maya'}</button>
        {results && <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#0a0a0a', borderRadius: '12px', whiteSpace: 'pre-wrap', fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", maxHeight: '400px', overflow: 'auto' }}>{results}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {[{ title: 'Content Generator', desc: 'AI-powered content creation', icon: '📝', page: 'content' }, { title: 'Ask Maya', desc: 'Chat with your AI assistant', icon: '💬', page: 'maya' }, { title: 'Research Intel', desc: 'Web research with AI', icon: '🔍', page: 'research' }, { title: 'Influencer Search', desc: 'Find the right creators', icon: '👥', page: 'influencer' }].map(c => (
          <div key={c.title} style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => window.location.hash = c.page}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{c.icon}</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{c.title}</div>
            <div style={{ fontSize: '13px', color: '#71717a' }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [variations, setVariations] = useState<string[]>([]);

  const generateContent = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setContent('');
    setVariations([]);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'system', content: `You are an expert social media content creator. Create engaging ${platform} content. Tone: ${tone}. Provide 3 variations.` }, { role: 'user', content: `Create content for: ${topic}. Include hashtags and caption.` }] }) });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; fullContent += decoder.decode(value, { stream: true }); setContent(fullContent); } }
    } catch (e) { setContent('Error generating content'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>📝 AI Content Generator</h2>
      <div style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px', textTransform: 'uppercase' }}>Topic / Idea</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Summer sale announcement" style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px', textTransform: 'uppercase' }}>Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none' }}>
              <option>Instagram</option><option>LinkedIn</option><option>Twitter/X</option><option>YouTube</option><option>Facebook</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px', textTransform: 'uppercase' }}>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none' }}>
              <option>Professional</option><option>Casual</option><option>Humorous</option><option>Inspirational</option><option>Hinglish</option>
            </select>
          </div>
        </div>
        <button onClick={generateContent} disabled={loading} style={{ padding: '14px 28px', backgroundColor: '#00ffcc', color: '#080808', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
          {loading ? 'Generating...' : '✨ Generate Content'}
        </button>
      </div>
      {content && (
        <div style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Generated Content</h3>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6', color: '#e4e4e7' }}>{content}</div>
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
        const summaryRes = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'system', content: 'You are a research assistant. Summarize the search results concisely.' }, { role: 'user', content: `Summarize these search results about "${query}":\n\n${data.results.slice(0,5).map((r: any) => `- ${r.title}: ${r.snippet}`).join('\n')}` }] }) });
        const reader = summaryRes.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; setAiSummary(prev => prev + decoder.decode(value, { stream: true })); } }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>🔍 Research Intelligence</h2>
      <div style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="Research any topic, brand, competitor..." style={{ flex: 1, backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 20px', color: '#ffffff', fontSize: '16px', outline: 'none' }} />
          <button onClick={doSearch} disabled={loading} style={{ padding: '14px 28px', backgroundColor: '#00ffcc', color: '#080808', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Searching...' : '🔍 Search'}</button>
        </div>
      </div>
      {aiSummary && (
        <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '20px', marginBottom: '16px', borderLeft: '3px solid #00ffcc' }}>
          <div style={{ fontSize: '12px', color: '#00ffcc', marginBottom: '8px', fontWeight: 600 }}>AI SUMMARY</div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>{aiSummary}</div>
        </div>
      )}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener" style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: '#00ffcc' }}>{r.title}</div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>{r.snippet?.substring(0, 200)}...</div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>{r.domain}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function InfluencerPage() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('India');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const searchInfluencers = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: `${niche} influencer ${city}`, provider: 'serper', maxResults: 10 }) });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>👥 Influencer Discovery</h2>
      <div style={{ backgroundColor: '#111111', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px', textTransform: 'uppercase' }}>Niche / Category</label>
            <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Fashion, Tech, Food" style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px', textTransform: 'uppercase' }}>Location</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="India" style={{ width: '100%', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', color: '#ffffff', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>
        <button onClick={searchInfluencers} disabled={loading} style={{ padding: '14px 28px', backgroundColor: '#a855f7', color: '#ffffff', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
          {loading ? 'Searching...' : '🔍 Find Influencers'}
        </button>
      </div>
      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {results.map((r, i) => (
            <div key={i} style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{r.title || 'Influencer'}</div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '12px' }}>{r.snippet?.substring(0, 100)}...</div>
              <a href={r.url} target="_blank" rel="noopener" style={{ color: '#00ffcc', fontSize: '13px' }}>View Profile →</a>
            </div>
          ))}
        </div>
      )}
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>💬 Ask Maya - Your AI Assistant</h2>
      <div style={{ flex: 1, backgroundColor: '#111111', borderRadius: '16px', padding: '16px', overflowY: 'auto', marginBottom: '16px' }}>
        {chatHistory.length === 0 ? (
          <div style={{ color: '#71717a', textAlign: 'center', marginTop: '40%' }}>Start a conversation with Maya...</div>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} style={{ marginBottom: '16px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{ display: 'inline-block', maxWidth: '80%', padding: '12px 16px', borderRadius: '16px', background: msg.role === 'user' ? 'rgba(0,255,204,0.1)' : '#1a1a1a', color: msg.role === 'user' ? '#00ffcc' : '#ffffff', border: msg.role === 'user' ? '1px solid rgba(0,255,204,0.3)' : 'none', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          ))
        )}
        {loading && <div style={{ color: '#00ffcc' }}>Maya is thinking...</div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask Maya anything..." style={{ flex: 1, backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 20px', color: '#ffffff', fontSize: '14px', outline: 'none' }} />
        <button onClick={handleSend} disabled={loading} style={{ padding: '14px 28px', backgroundColor: '#00ffcc', color: '#080808', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>Send</button>
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