'use client';

import { useState, useEffect } from 'react';

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
      { id: 'research', label: 'Research', icon: '🔍' },
      { id: 'listen', label: 'Social Listen', icon: '👂' },
      { id: 'engage', label: 'Engage', icon: '💬' },
      { id: 'ads', label: 'Ads Manager', icon: '📢' },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { id: 'report', label: 'Report', icon: '📊' },
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
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#080808',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* SIDEBAR */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Brand */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #00ffcc, #00ccaa)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
            color: '#080808'
          }}>
            SMM
          </div>
          <div style={{ fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>
            SMM Agent
          </div>
        </div>

        {/* Client Switcher */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active client
          </div>
          <select style={{
            width: '100%',
            backgroundColor: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#a1a1aa',
            fontSize: '13px',
            cursor: 'pointer'
          }}>
            <option value="">— No client selected —</option>
          </select>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '4px' }}>
              <button
                onClick={() => toggleGroup(group.label)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer'
                }}
              >
                {group.label}
                <span style={{
                  transform: collapsedGroups.has(group.label) ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  fontSize: '10px'
                }}>
                  ▼
                </span>
              </button>
              
              {!collapsedGroups.has(group.label) && (
                <div style={{ padding: '0 8px' }}>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        background: currentPage === item.id ? 'rgba(0,255,204,0.08)' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: currentPage === item.id ? '#00ffcc' : '#a1a1aa',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 600,
                          background: item.badge === 'Live' ? 'rgba(0,255,204,0.2)' :
                                     item.badge === 'AI' ? 'rgba(74,222,128,0.2)' :
                                     item.badge === 'New' ? 'rgba(168,85,247,0.2)' :
                                     item.badge === '0' ? 'rgba(255,185,71,0.2)' : 'rgba(255,255,255,0.1)',
                          color: item.badge === 'Live' ? '#00ffcc' :
                                 item.badge === 'AI' ? '#4ade80' :
                                 item.badge === 'New' ? '#a855f7' :
                                 item.badge === '0' ? '#ffb947' : '#ffffff'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Settings */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setCurrentPage('settings')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: currentPage === 'settings' ? '#00ffcc' : '#a1a1aa',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '16px' }}>⚙️</span>
            Settings
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <header style={{
          height: '60px',
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa' }}>
            {navGroups.flatMap(g => g.items).find(i => i.id === currentPage)?.label || 'Home'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              color: '#a1a1aa',
              fontSize: '13px',
              cursor: 'pointer'
            }}>
              👤 User
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <PageContent page={currentPage} />
        </div>
      </main>
    </div>
  );
}

function PageContent({ page }: { page: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults('');
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: query }] 
        })
      });
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setResults(prev => prev + chunk);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults('Error connecting to API');
    } finally {
      setLoading(false);
    }
  };

  switch (page) {
    case 'home':
      return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            Welcome to SMM Agent
          </h1>
          <p style={{ color: '#71717a', marginBottom: '32px' }}>
            Your AI-powered social media manager
          </p>

          {/* Search Box */}
          <div style={{
            backgroundColor: '#111111',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '32px'
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask anything about marketing, brands, or trends in India..."
              style={{
                width: '100%',
                backgroundColor: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px 20px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                marginBottom: '16px'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#00ffcc',
                color: '#080808',
                borderRadius: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

            {results && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '12px',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {results}
              </div>
            )}
          </div>

          {/* Quick Access Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[
              { title: 'Content Generator', desc: 'AI-powered content creation', icon: '📝', color: '#00ffcc' },
              { title: 'Ask Maya', desc: 'Chat with your AI assistant', icon: '💬', color: '#4ade80' },
              { title: 'Influencer Search', desc: 'Find the right creators', icon: '👥', color: '#a855f7' },
              { title: 'Strategy Planner', desc: 'Plan your campaigns', icon: '🎯', color: '#ffb947' },
            ].map((card) => (
              <div key={card.title} style={{
                backgroundColor: '#111111',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{card.title}</div>
                <div style={{ fontSize: '13px', color: '#71717a' }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'maya':
      return <MayaChat />;
    
    default:
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: '#71717a'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
            </div>
            <div style={{ fontSize: '14px' }}>Coming soon...</div>
          </div>
        </div>
      );
  }
}

function MayaChat() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...chatHistory, { role: 'user', content: userMessage }] })
      });
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          setChatHistory(prev => {
            const newHistory = [...prev];
            if (newHistory[newHistory.length - 1]?.role === 'user') {
              newHistory.push({ role: 'assistant', content: assistantMessage });
            } else {
              newHistory[newHistory.length - 1].content = assistantMessage;
            }
            return newHistory;
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>💬 Ask Maya</h2>
      
      <div style={{ 
        flex: 1, 
        backgroundColor: '#111111', 
        borderRadius: '16px', 
        padding: '16px',
        overflowY: 'auto',
        marginBottom: '16px'
      }}>
        {chatHistory.length === 0 ? (
          <div style={{ color: '#71717a', textAlign: 'center', marginTop: '40%' }}>
            Start a conversation with Maya...
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} style={{ marginBottom: '16px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px',
                background: msg.role === 'user' 
                  ? 'rgba(0,255,204,0.1)' 
                  : '#1a1a1a',
                color: msg.role === 'user' ? '#00ffcc' : '#ffffff',
                border: msg.role === 'user' ? '1px solid rgba(0,255,204,0.3)' : 'none',
                fontSize: '14px'
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && <div style={{ color: '#00ffcc' }}>Maya is thinking...</div>}
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Maya anything..."
          style={{
            flex: 1,
            backgroundColor: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '14px 20px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: '14px 28px',
            backgroundColor: '#00ffcc',
            color: '#080808',
            borderRadius: '12px',
            fontWeight: 600,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}