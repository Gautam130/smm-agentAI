'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { detectIntent, getTemperature, type IntentResult } from '@/lib/intent';
import { classifyQuery, getQueryTier, getTierParams } from '@/lib/classify';
import { buildPrompt, CORE_IDENTITY, getBrandContext } from '@/lib/prompt';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface SearchResult {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

const quickPrompts = [
  { label: 'Reel caption', prompt: 'Write a catchy Instagram Reel caption for my product' },
  { label: '7-day content plan', prompt: 'Create a 7-day content plan for my business' },
  { label: '10 viral hooks', prompt: 'Generate 10 viral hooks for my content' },
  { label: 'Competitor analysis', prompt: 'Analyze my competitors on social media' },
  { label: 'DM flow', prompt: 'Create a DM outreach sequence' },
  { label: 'Festive campaign', prompt: 'Plan a festive campaign for upcoming festival' },
  { label: 'Research market', prompt: 'Research my market and audience' },
  { label: 'Competitor audit', prompt: 'Do a competitor audit' },
];

const templateCards = [
  { icon: '✍️', title: 'Content', desc: 'Captions, hooks, threads' },
  { icon: '📅', title: 'Calendar', desc: 'Full month content plan' },
  { icon: '🤝', title: 'Influencers', desc: 'Find, pitch, track' },
  { icon: '📊', title: 'Strategy', desc: 'Audit, trends, growth' },
  { icon: '⚡', title: 'Bulk Generate', desc: '10 posts in one shot' },
  { icon: '🌐', title: 'Listening', desc: 'Monitor, newsjack' },
  { icon: '💬', title: 'Engagement', desc: 'Replies, DMs, crisis' },
  { icon: '🔬', title: 'Diagnosis', desc: 'Why did this flop?' },
];

const recentWork = [
  { title: 'boAt Marketing Strategy', date: '2 hours ago' },
  { title: 'Mamaearth Festive Campaign', date: 'Yesterday' },
  { title: 'D2C Content Calendar', date: '3 days ago' },
  { title: 'Competitor Analysis Report', date: '1 week ago' },
];

const megaMenuColumns = [
  {
    title: 'Create',
    items: [
      { label: 'Content', href: '/content' },
      { label: 'Calendar', href: '/calendar' },
      { label: 'Festive Campaigns', href: '/festive' },
      { label: 'Meme & Viral', href: '/meme' },
      { label: 'Visual Direction', href: '/visual' },
      { label: 'Repurpose', href: '/repurpose' },
    ]
  },
  {
    title: 'Manage',
    items: [
      { label: 'Schedule', href: '/schedule' },
      { label: 'Queue', href: '/queue' },
      { label: 'Post History', href: '/history' },
      { label: 'Idea Bank', href: '/ideas' },
      { label: 'Bulk Generate', href: '/bulk' },
      { label: 'Influencer Tracker', href: '/influencer' },
    ]
  },
  {
    title: 'Strategy',
    items: [
      { label: 'Strategy', href: '/strategy' },
      { label: 'Research Intel', href: '/research' },
      { label: 'Social Listening', href: '/listen' },
      { label: 'Engagement', href: '/engage' },
      { label: 'Ads & Collab', href: '/ads' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reporting', href: '/report' },
      { label: 'Post Diagnosis', href: '/diagnose' },
      { label: 'Profile Optimizer', href: '/profile' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'A/B Testing', href: '/ab-testing' },
    ]
  },
  {
    title: 'Brand',
    items: [
      { label: 'Brand Kit', href: '/brand' },
      { label: 'Saved Outputs', href: '/saved' },
    ]
  },
];

export default function HomePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [hasResults, setHasResults] = useState(false);
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [deepResearch, setDeepResearch] = useState(false);
  const [liveSearchEnabled, setLiveSearchEnabled] = useState(true);
  const [showWorkDropdown, setShowWorkDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputScrollRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workDropdownRef.current && !workDropdownRef.current.contains(e.target as Node)) {
        setShowWorkDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWorkDropdown(false);
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const cleanText = (text: string) => {
    return text.replace(/(━+[^━]+━+)/g, '\n\n$1\n\n');
  };

  const performLiveSearch = async (searchQuery: string): Promise<string> => {
    if (!liveSearchEnabled) return '';
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, maxResults: deepResearch ? 12 : 8 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results
            .slice(0, deepResearch ? 8 : 5)
            .map((r: SearchResult) => `- ${r.title}: ${r.snippet || ''} (source: ${r.domain})`)
            .join('\n');
        }
      }
    } catch (e) {
      console.warn('Live search failed:', e);
    }
    return '';
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setStreamingText('');
    setIntentResult(null);
    setHasResults(true);

    try {
      const intent = detectIntent(query);
      setIntentResult(intent);

      const classification = classifyQuery(query);
      const tier = deepResearch ? 3 : getQueryTier(query);
      const tierParams = getTierParams(tier);

      let liveContext = '';
      if (liveSearchEnabled && classification.useLiveSearch) {
        liveContext = await performLiveSearch(query);
      }

      const brandCtx = getBrandContext();
      const finalPrompt = buildPrompt({
        query,
        intent,
        liveContext,
        knowledgeContext: '',
        brandCtx
      });

      let taskType = 'general';
      if (intent.isContent) taskType = 'content';
      else if (intent.isStrategy) taskType = 'strategy';
      else if (intent.isResearch || intent.isTrend) taskType = 'research';

      const temperature = getTemperature(intent);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [
            { role: 'system', content: CORE_IDENTITY },
            { role: 'user', content: finalPrompt }
          ],
          taskType,
          temperature,
          maxTokens: tierParams.maxTokens
        })
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
                setStreamingText(text);
              }
            } catch {}
          }
        }
      }
    } catch (e: any) {
      setStreamingText(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  const handleNewQuery = () => {
    setQuery('');
    setStreamingText('');
    setIntentResult(null);
    setHasResults(false);
    inputRef.current?.focus();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamingText);
  };

  const handleSave = () => {
    if (streamingText.trim()) {
      const saved = localStorage.getItem('smm_saved') || '[]';
      try {
        const arr = JSON.parse(saved);
        arr.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          text: streamingText,
          query: query
        });
        localStorage.setItem('smm_saved', JSON.stringify(arr));
      } catch {
        localStorage.setItem('smm_saved', JSON.stringify([{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          text: streamingText,
          query: query
        }]));
      }
    }
  };

  return (
    <div className="home-main">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="home-nav-brand">SMM Agent</div>
        <div className="home-nav-links">
          <a href="/" className="active">Home</a>
          <div ref={workDropdownRef} style={{ position: 'relative' }}>
            <a 
              href="#" 
              className="dropdown-trigger"
              onClick={(e) => { e.preventDefault(); setShowWorkDropdown(!showWorkDropdown); }}
            >
              Work
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '4px', transition: 'transform 0.2s', transform: showWorkDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M2 4l4 4 4-4" />
              </svg>
            </a>
            {showWorkDropdown && (
              <div className="mega-dropdown">
                <div className="mega-dropdown-inner">
                  {megaMenuColumns.map((col, colIdx) => (
                    <div key={colIdx} className="mega-column">
                      <div className="mega-column-title">{col.title}</div>
                      {col.items.map((item, itemIdx) => (
                        <a key={itemIdx} href={item.href} className="mega-item" onClick={() => setShowWorkDropdown(false)}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <a href="/client">Clients</a>
          <a href="/ask">Maya</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/settings" className="home-nav-settings" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </a>
          <div ref={userDropdownRef} style={{ position: 'relative' }}>
            <button 
              className="home-nav-avatar"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="avatar-circle">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
            </button>
            {showUserDropdown && (
              <div className="user-dropdown">
                <a href="/profile" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile
                </a>
                <a href="/settings" className="user-dropdown-item" onClick={() => setShowUserDropdown(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                  </svg>
                  Settings
                </a>
                <button className="user-dropdown-item danger" onClick={handleSignOut}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <h1 className="home-hero-title">
          Your AI Social<br /><span>Media Partner</span>
        </h1>
        <p className="home-hero-subtitle">
          Create, schedule, and analyze — all in one place
        </p>

        {/* Search Box */}
        <div className="home-search-container">
          <div className="home-search-box">
            <textarea
              ref={inputRef}
              className="home-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
              placeholder="What do you need? (e.g. a week of Instagram posts for my cafe)"
              rows={1}
            />
            <button className="home-search-btn" onClick={handleSearch} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
          <div className="home-search-hint">Press Enter to send · Shift+Enter for new line</div>
        </div>

        {/* Toggles */}
        <div className="home-toggles">
          <label className="home-toggle">
            <input type="checkbox" checked={deepResearch} onChange={(e) => setDeepResearch(e.target.checked)} />
            Deep Research
          </label>
          <label className="home-toggle">
            <input type="checkbox" checked={liveSearchEnabled} onChange={(e) => setLiveSearchEnabled(e.target.checked)} />
            Live Search
          </label>
        </div>

        {/* Quick Prompts */}
        <div className="home-prompts">
          {quickPrompts.map((qp, i) => (
            <button key={i} className="home-prompt-btn" onClick={() => handleQuickPrompt(qp.prompt)}>
              {qp.label}
            </button>
          ))}
        </div>

        {/* Response Section */}
        {hasResults && (
          <div className="home-response">
            <div className="home-response-header">
              <div className="home-response-label">
                <span className="home-response-dot"></span>
                AGENT RESPONSE
              </div>
              <div className="home-response-actions">
                <button className="home-response-btn" onClick={handleCopy}>Copy</button>
                <button className="home-response-btn" onClick={handleSave}>Save</button>
                <button className="home-response-btn" onClick={handleNewQuery}>New query</button>
              </div>
            </div>

            <div className="home-response-content" ref={outputScrollRef}>
              {loading && !streamingText && (
                <div className="home-loading">
                  <div className="home-spinner"></div>
                  Thinking<span className="home-cursor">▊</span>
                </div>
              )}
              {streamingText && (
                <div className="home-response-text">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {cleanText(streamingText)}
                  </ReactMarkdown>
                  {loading && <span className="home-cursor">▊</span>}
                </div>
              )}

              {streamingText && !loading && (
                <div className="home-reactions">
                  <button className="home-reaction-btn">👍</button>
                  <button className="home-reaction-btn">👎</button>
                  <button className="home-reaction-btn" onClick={handleCopy}>Copy</button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Template Cards */}
      <section className="home-templates">
        <div className="home-section-title">Quick Actions</div>
        <div className="home-templates-grid">
          {templateCards.map((card, i) => (
            <a key={i} href={`/${card.title.toLowerCase().replace(' ', '-')}`} className="home-template-card">
              <div className="home-template-icon">{card.icon}</div>
              <div className="home-template-title">{card.title}</div>
              <div className="home-template-desc">{card.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Recent Work */}
      <section className="home-recent-work">
        <div className="home-section-title">Recent Work</div>
        <div className="home-work-list">
          {recentWork.map((item, i) => (
            <div key={i} className="home-work-item">
              <span className="home-work-title">{item.title}</span>
              <span className="home-work-meta">{item.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-links">
          <a href="/settings">Settings</a>
          <a href="/help">Help</a>
          <a href="/privacy">Privacy</a>
        </div>
        <div className="home-footer-copy">© 2026 SMM Agent</div>
      </footer>

      <style jsx>{`
        .dropdown-trigger {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .mega-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          background: #111113;
          border: 1px solid #1E1E20;
          border-radius: 16px;
          padding: 24px;
          z-index: 1000;
          min-width: 600px;
        }
        
        .mega-dropdown-inner {
          display: flex;
          gap: 40px;
        }
        
        .mega-column {
          min-width: 100px;
        }
        
        .mega-column-title {
          color: #fff;
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 12px;
        }
        
        .mega-item {
          display: block;
          color: #717068;
          font-size: 13px;
          padding: 4px 0;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .mega-item:hover {
          color: #F2F1ED;
        }
        
        .home-nav-settings {
          color: #666;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        
        .home-nav-settings:hover {
          color: #fff;
        }
        
        .home-nav-avatar {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #14B8A6;
          color: #0A0A0B;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: #111113;
          border: 1px solid #1E1E20;
          border-radius: 10px;
          padding: 6px;
          min-width: 140px;
          z-index: 1000;
        }
        
        .user-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          color: #717068;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          text-align: left;
        }
        
        .user-dropdown-item:hover {
          background: #1a1a1a;
          color: #fff;
        }
        
        .user-dropdown-item.danger:hover {
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
        }
      `}</style>
    </div>
  );
}
