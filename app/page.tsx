'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { detectIntent, getTemperature, type IntentResult } from '@/lib/intent';
import { classifyQuery, getQueryTier, getTierParams, type QueryTier } from '@/lib/classify';
import { buildPrompt, CORE_IDENTITY, getBrandContext } from '@/lib/prompt';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SearchResult {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

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
  const [streamingText, setStreamingText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState('');
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [deepResearch, setDeepResearch] = useState(false);
  const [liveSearchEnabled, setLiveSearchEnabled] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to output when streaming starts
  useEffect(() => {
    if (streamingText && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [streamingText]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smm_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setUserName(settings.userName || '');
      }
    }
  }, []);

  const greeting = userName ? `Hi ${userName},` : '';

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
    setShowResults(true);

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
    setShowResults(false);
    // Scroll back to input
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    inputRef.current?.focus();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamingText);
  };

  return (
    <div className="content-area" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div className="home-hero" style={{ textAlign: 'center' }}>
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot"></span>
          AI Social Media Agent · 2026
        </div>
        
        <h1 className="hero-h1">
          {greeting && <span style={{ display: 'block', fontSize: '18px', fontWeight: 500, color: '#00ffcc', marginBottom: '8px' }}>{greeting}</span>}
          What do you want to <span>create today?</span>
        </h1>
        
        <p className="hero-p">Your AI social media agent — just describe what you need</p>
        
        {/* Agent Input */}
        <div style={{ position: 'relative', marginBottom: '12px', maxWidth: '720px', margin: '0 auto 12px' }}>
          <textarea 
            ref={inputRef}
            id="agent-input"
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }} 
            placeholder="e.g. I run a cafe in Jaipur — what should I post this week?
e.g. Write 5 Instagram Reels hooks for my skincare brand
e.g. Find yoga influencers in Delhi for my brand" 
            rows={3}
            style={{ width: '100%', paddingRight: '50px' }}
          />
          <button 
            id="agent-send-btn"
            onClick={handleSearch} 
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
        
        {/* Deep Research Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={deepResearch} 
              onChange={(e) => setDeepResearch(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#00ffcc' }}
            />
            🔬 Deep Research (more thorough, uses live data)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={liveSearchEnabled} 
              onChange={(e) => setLiveSearchEnabled(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#00ffcc' }}
            />
            🌐 Live Search
          </label>
        </div>
        
        {/* Quick Prompts */}
        <div id="quick-prompts" style={{ marginBottom: '8px' }}>
          {quickPrompts.map((qp, i) => (
            <button key={i} onClick={() => handleQuickPrompt(qp.prompt)}>
              {qp.label}
            </button>
          ))}
        </div>
        
        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Press Enter to send · Shift+Enter for new line</div>
      </div>
      
      {/* Loading State with Blinking Cursor */}
      {loading && (
        <div className="thinking-state">
          <div className="thinking-spinner"></div>
          <span>Thinking</span>
          <span className="blink-cursor">▊</span>
        </div>
      )}
      
      {/* Output */}
      {showResults && (
        <div className="output-container" ref={outputRef} style={{ position: 'relative' }}>
          {/* Sticky New Query Button */}
          <div style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10, 
            display: 'flex', 
            justifyContent: 'center',
            padding: '12px 0',
            background: 'linear-gradient(180deg, #080808 60%, transparent)',
          }}>
            <button 
              onClick={handleNewQuery}
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 255, 204, 0.1)',
                border: '0.5px solid rgba(0, 255, 204, 0.3)',
                borderRadius: '20px',
                color: '#00ffcc',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New query
            </button>
          </div>
          
          <div className="output-wrap show">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Agent response
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="copy-output" onClick={handleCopy}>Copy</button>
              <button className="save-output-btn">Save</button>
              <button className="new-query-btn" onClick={handleNewQuery}>New query</button>
            </div>
          </div>
          
          {/* Meta Row with Intent + Live Search Badge */}
          <div className="response-meta">
            {intentResult && (
              <>
                <span className="meta-intent">
                  Intent: {intentResult.isContent ? 'Content' : intentResult.isResearch ? 'Research' : intentResult.isStrategy ? 'Strategy' : intentResult.isTrend ? 'Trend' : 'General'}
                </span>
                <span className={`meta-confidence ${intentResult.confidence.toLowerCase()}`}>
                  {intentResult.confidence}
                </span>
              </>
            )}
            <span className={`meta-badge ${liveSearchEnabled ? 'badge-green' : 'badge-gray'}`}>
              {liveSearchEnabled ? '🌐 Live Search ON' : '🌐 Live Search OFF'}
            </span>
            {deepResearch && (
              <span className="meta-badge badge-purple">🔬 Deep Research</span>
            )}
          </div>
          
          {/* Progressive Markdown Rendering */}
          <div id="agent-output-box" className="output-box" ref={outputRef}>
            {streamingText ? (
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingText}
                </ReactMarkdown>
                {loading && <span className="blink-cursor">▊</span>}
              </div>
            ) : null}
          </div>
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