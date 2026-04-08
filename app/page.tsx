'use client';

import { useState } from 'react';

type Tab = 'home' | 'maya' | 'content' | 'hooks' | 'hashtags' | 'influencer' | 'research' | 'calendar' | 'audit' | 'trends';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400">🤖 Maya - SMM Agent</h1>
          <button className="text-sm text-gray-400 hover:text-white">⚙️ Settings</button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 overflow-x-auto">
        <div className="flex space-x-1 px-4 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4">
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

// Placeholder components - will build each one
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">🏠 Home Search</h2>
      <p className="text-gray-400 text-sm">Ask anything about marketing, brands, or trends in India</p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g., Best Instagram strategy for D2C India"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {results && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <pre className="whitespace-pre-wrap text-sm">{results}</pre>
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">💬 Maya Chat</h2>
      
      <div className="h-96 bg-gray-800 rounded-lg p-4 overflow-y-auto border border-gray-700">
        {chatHistory.length === 0 ? (
          <p className="text-gray-500 text-center">Start a conversation with Maya...</p>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-gray-700 text-gray-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && <p className="text-cyan-400">Maya is thinking...</p>}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Maya anything..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function ContentGenerator() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">📝 Content Generator</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}

function HookGenerator() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">🪝 Hook Generator</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}

function HashtagGenerator() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">#️⃣ Hashtag Generator</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}

function InfluencerSearch() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">👥 Influencer Search</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}

function Research() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">📊 Research</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}

function Calendar() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">📅 Calendar</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}

function Audit() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">🔎 Audit</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}

function Trends() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-4">📈 Trends</h2>
      <p className="text-gray-400">Coming soon...</p>
    </div>
  );
}