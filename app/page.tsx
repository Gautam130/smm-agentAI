'use client';

import { useState } from 'react';

type Tab = 'home' | 'maya' | 'content' | 'hooks' | 'hashtags' | 'influencer' | 'research' | 'calendar' | 'audit' | 'trends';

const tabs: { id: Tab; label: string }[] = [
  { id: 'home', label: '🔍 Home' },
  { id: 'maya', label: '💬 Maya' },
  { id: 'content', label: '📝 Content' },
  { id: 'hooks', label: '🪝 Hooks' },
  { id: 'hashtags', label: '#️⃣ Hashtags' },
  { id: 'influencer', label: '👥 Influencer' },
  { id: 'research', label: '📊 Research' },
  { id: 'calendar', label: '📅 Calendar' },
  { id: 'audit', label: '🔎 Audit' },
  { id: 'trends', label: '📈 Trends' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080808',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#111111',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#00ffcc',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          🤖 Maya - SMM Agent
        </h1>
        <button style={{
          background: 'transparent',
          border: 'none',
          color: '#a1a1aa',
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          ⚙️ Settings
        </button>
      </header>

      {/* Tab Navigation */}
      <nav style={{
        backgroundColor: '#111111',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto',
        padding: '8px 16px'
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                whiteSpace: 'nowrap' as const,
                border: activeTab === tab.id 
                  ? '1px solid rgba(0,255,204,0.3)' 
                  : '1px solid transparent',
                background: activeTab === tab.id 
                  ? 'rgba(0,255,204,0.1)' 
                  : 'transparent',
                color: activeTab === tab.id ? '#00ffcc' : '#a1a1aa',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '16px' }}>
        {activeTab === 'home' && <HomeSearch />}
        {activeTab === 'maya' && <MayaChat />}
        {activeTab === 'content' && <ContentGenerator />}
        {activeTab === 'hooks' && <HookGenerator />}
        {activeTab === 'hashtags' && <HashtagGenerator />}
        {activeTab === 'influencer' && <InfluencerSearch />}
        {activeTab === 'research' && <Research />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'audit' && <Audit />}
        {activeTab === 'trends' && <Trends />}
      </main>
    </div>
  );
}

function HomeSearch() {
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
      setResults('Error connecting to API. Please check Vercel deployment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>🏠 Home Search</h2>
      <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Ask anything about marketing, brands, or trends in India</p>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g., Best Instagram strategy for D2C India"
          style={{
            flex: 1,
            backgroundColor: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#00ffcc',
            color: '#080808',
            borderRadius: '12px',
            fontWeight: 600,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {results && (
        <div style={{
          backgroundColor: '#111111',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '14px', 
            color: '#ffffff',
            margin: 0,
            fontFamily: "'JetBrains Mono', monospace"
          }}>{results}</pre>
        </div>
      )}
    </div>
  );
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>💬 Maya Chat</h2>
      
      <div style={{ 
        height: '400px', 
        backgroundColor: '#111111', 
        borderRadius: '12px', 
        padding: '16px',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {chatHistory.length === 0 ? (
          <p style={{ color: '#71717a', textAlign: 'center', marginTop: '40%' }}>Start a conversation with Maya...</p>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} style={{ marginBottom: '16px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '80%',
                padding: '12px',
                borderRadius: '12px',
                background: msg.role === 'user' 
                  ? 'rgba(0,255,204,0.1)' 
                  : '#1a1a1a',
                color: msg.role === 'user' ? '#00ffcc' : '#ffffff',
                border: msg.role === 'user' ? '1px solid rgba(0,255,204,0.3)' : 'none'
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && <p style={{ color: '#00ffcc' }}>Maya is thinking...</p>}
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
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
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: '12px 20px',
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

function ContentGenerator() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>📝 Content Generator</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}

function HookGenerator() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>🪝 Hook Generator</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}

function HashtagGenerator() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>#️⃣ Hashtag Generator</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}

function InfluencerSearch() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>👥 Influencer Search</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}

function Research() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>📊 Research</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}

function Calendar() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>📅 Calendar</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}

function Audit() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>🔎 Audit</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}

function Trends() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>📈 Trends</h2>
      <p style={{ color: '#a1a1aa' }}>Coming soon...</p>
    </div>
  );
}