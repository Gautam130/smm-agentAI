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
  const [hasResults, setHasResults] = useState(false);
  const [userName, setUserName] = useState('');
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [deepResearch, setDeepResearch] = useState(false);
  const [liveSearchEnabled, setLiveSearchEnabled] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamingText && outputScrollRef.current) {
      outputScrollRef.current.scrollTop = 0;
    }
  }, [streamingText]);

  useEffect(() => {
    if (loading) {
      setHasResults(true);
    }
  }, [loading]);

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
    setShowResults(true);
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
    setShowResults(false);
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
    <div className="content-area" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Hero Card - Always visible, expands when hasResults */}
      <div className="home-hero" style={{ 
        textAlign: 'center',
        overflow: 'hidden',
        transition: 'max-height 0.5s ease',
        maxHeight: hasResults ? '1200px' : '800px'
      }}>
        
        {/* Greeting + Headline */}
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot"></span>
          AI Social Media Agent · 2026
        </div>
        
        <h1 className="hero-h1">
          {greeting && <span style={{ display: 'block', fontSize: '18px', fontWeight: 500, color: '#00ffcc', marginBottom: '8px' }}>{greeting}</span>}
          What do you want to <span>create today?</span>
        </h1>
        
        <p className="hero-p">Your AI social media agent — just describe what you need</p>
        
        {/* Input Box */}
        <div style={{ position: 'relative', marginBottom: '12px', maxWidth: '720px', margin: '0 auto 12px' }}>
          <textarea 
            ref={inputRef}
            id="agent-input"
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }} 
            placeholder={hasResults ? "Ask another question..." : "e.g. I run a cafe in Jaipur — what should I post this week?"}
            rows={hasResults ? 1 : 3}
            style={{ 
              width: '100%', 
              paddingRight: '50px',
              fontSize: '14px'
            }}
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
        
        {/* Toggles */}
        {hasResults ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px', fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={deepResearch} onChange={(e) => setDeepResearch(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#00ffcc' }} />
              🔬 Deep Research
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={liveSearchEnabled} onChange={(e) => setLiveSearchEnabled(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#00ffcc' }} />
              🌐 Live Search
            </label>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={deepResearch} onChange={(e) => setDeepResearch(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#00ffcc' }} />
              🔬 Deep Research
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={liveSearchEnabled} onChange={(e) => setLiveSearchEnabled(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#00ffcc' }} />
              🌐 Live Search
            </label>
          </div>
        )}
        
        {/* Quick Prompts - Always visible */}
        <div id="quick-prompts" style={{ marginBottom: '8px' }}>
          {quickPrompts.map((qp, i) => (
            <button key={i} onClick={() => handleQuickPrompt(qp.prompt)}>
              {qp.label}
            </button>
          ))}
        </div>
        
        {!hasResults && (
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Press Enter to send · Shift+Enter for new line</div>
        )}
        
        {/* RESPONSE SECTION - Expands below */}
        {hasResults && (
          <div style={{ 
            borderTop: '1px solid #1a3a2a',
            marginTop: '16px',
            paddingTop: '16px',
            maxHeight: '600px',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease'
          }}>
            {/* Header: Agent response + New query button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ffcc' }}></span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Agent response</span>
              </div>
              <button 
                onClick={handleNewQuery}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '16px',
                  color: '#888',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                + New query
              </button>
            </div>
            
            {/* Meta badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', padding: '0 12px', flexWrap: 'wrap' }}>
              {intentResult && (
                <>
                  <span style={{ padding: '4px 10px', background: 'rgba(0,255,204,0.1)', border: '0.5px solid rgba(0,255,204,0.3)', borderRadius: '12px', fontSize: '11px', color: '#00ffcc' }}>
                    {intentResult.isContent ? 'Content' : intentResult.isResearch ? 'Research' : intentResult.isStrategy ? 'Strategy' : intentResult.isTrend ? 'Trend' : 'General'}
                  </span>
                  <span style={{ padding: '4px 10px', background: intentResult.confidence === 'HIGH' ? 'rgba(0,255,204,0.1)' : 'rgba(255,200,0,0.1)', border: `0.5px solid ${intentResult.confidence === 'HIGH' ? 'rgba(0,255,204,0.3)' : 'rgba(255,200,0,0.3)'}`, borderRadius: '12px', fontSize: '11px', color: intentResult.confidence === 'HIGH' ? '#00ffcc' : '#ffc800' }}>
                    {intentResult.confidence}
                  </span>
                </>
              )}
              <span style={{ padding: '4px 10px', background: liveSearchEnabled ? 'rgba(0,255,204,0.1)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${liveSearchEnabled ? 'rgba(0,255,204,0.3)' : '#333'}`, borderRadius: '12px', fontSize: '11px', color: liveSearchEnabled ? '#00ffcc' : '#666' }}>
                🌐 {liveSearchEnabled ? 'Live Search' : 'OFF'}
              </span>
              {deepResearch && (
                <span style={{ padding: '4px 10px', background: 'rgba(168,85,247,0.1)', border: '0.5px solid rgba(168,85,247,0.3)', borderRadius: '12px', fontSize: '11px', color: '#a855f7' }}>
                  🔬 Deep
                </span>
              )}
            </div>
            
            {/* Response content - scrollable */}
            <div 
              ref={outputScrollRef}
              style={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                padding: '0 12px',
                scrollBehavior: 'smooth'
              }}
            >
              {loading && !streamingText && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666', fontSize: '14px', padding: '12px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #333', borderTopColor: '#00ffcc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  <span>Thinking</span>
                  <span style={{ animation: 'blink 1s infinite' }}>▊</span>
                </div>
              )}
              {streamingText && (
                <div className="markdown-content" style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanText(streamingText)}
                  </ReactMarkdown>
                  {loading && <span style={{ animation: 'blink 1s infinite', color: '#00ffcc' }}>▊</span>}
                </div>
              )}
              
              {/* Copy/Save buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingBottom: '12px' }}>
                <button 
                  onClick={handleCopy} 
                  disabled={!streamingText.trim()}
                  style={{ 
                    padding: '6px 12px', 
                    background: '#111', 
                    border: '1px solid #222', 
                    borderRadius: '8px', 
                    color: streamingText.trim() ? '#888' : '#444', 
                    fontSize: '12px', 
                    cursor: streamingText.trim() ? 'pointer' : 'not-allowed' 
                  }}
                >Copy</button>
                <button 
                  onClick={handleSave} 
                  disabled={!streamingText.trim()}
                  style={{ 
                    padding: '6px 12px', 
                    background: '#111', 
                    border: '1px solid #222', 
                    borderRadius: '8px', 
                    color: streamingText.trim() ? '#888' : '#444', 
                    fontSize: '12px', 
                    cursor: streamingText.trim() ? 'pointer' : 'not-allowed' 
                  }}
                >Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading indicator (when not in expanded response) */}
      {loading && hasResults && streamingText && (
        <div className="thinking-state">
          <div className="thinking-spinner"></div>
          <span>Thinking</span>
          <span className="blink-cursor">▊</span>
        </div>
      )}
      
      {/* Stats Row - Show when no results */}
      {!hasResults && (
        <>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <div className="hbadge"><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>0</span> queued today</div>
            <div className="hbadge"><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>0</span> saved outputs</div>
          </div>
          
          <div className="section-header">
            <div className="section-title">Or go directly to a module</div>
            <div className="section-line"></div>
          </div>
          
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
        </>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}