'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
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

export default function HomePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [hasResults, setHasResults] = useState(false);
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [deepResearch, setDeepResearch] = useState(false);
  const [liveSearchEnabled, setLiveSearchEnabled] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputScrollRef = useRef<HTMLDivElement>(null);

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
          <a href="/content">Work</a>
          <a href="/client">Clients</a>
          <a href="/ask">Maya</a>
        </div>
        <a href="/ask" className="home-nav-cta">Try Maya →</a>
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
    </div>
  );
}
