'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { detectIntent, getTemperature, type IntentResult } from '@/lib/intent';
import { classifyQuery, getQueryTier, getTierParams, type ClassificationResult, type QueryTier } from '@/lib/classify';
import { buildPrompt, CORE_IDENTITY, getBrandContext } from '@/lib/prompt';

interface Section {
  emoji: string;
  title: string;
  content: string;
}

interface StructuredResponse {
  intent: string;
  confidence: string;
  warnings: string[];
  sections: Section[];
  feedback: boolean;
}

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
  const [processingSteps, setProcessingSteps] = useState<string>('');
  const [rawResponse, setRawResponse] = useState('');
  const [structuredData, setStructuredData] = useState<StructuredResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState('');
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  
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

  const parseStructuredResponse = (text: string): StructuredResponse | null => {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.sections && Array.isArray(parsed.sections)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Parse error:', e);
    }
    return null;
  };

  const performLiveSearch = async (searchQuery: string): Promise<string> => {
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, maxResults: 8 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results
            .slice(0, 5)
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
    setRawResponse('');
    setStructuredData(null);
    setIntentResult(null);
    setShowResults(true);
    setProcessingSteps('Detecting intent...');

    try {
      // Step 1: Detect intent (LLM + fallback)
      const intent = await detectIntent(query);
      setIntentResult(intent);
      setProcessingSteps('Classifying query...');

      // Step 2: Classify query
      const classification = classifyQuery(query);
      const tier = getQueryTier(query);
      const tierParams = getTierParams(tier);

      setProcessingSteps(`Processing (Tier ${tier})...`);

      // Step 3: Live search if needed (Tier > 1 and useLiveSearch)
      let liveContext = '';
      if (classification.useLiveSearch && tier > 1) {
        liveContext = await performLiveSearch(query);
      }

      // Step 4: Build prompt
      setProcessingSteps('Building prompt...');
      const brandCtx = getBrandContext();
      const finalPrompt = buildPrompt({
        query,
        intent,
        liveContext,
        knowledgeContext: '',
        brandCtx
      });

      // Step 5: Determine taskType based on intent
      let taskType = 'general';
      if (intent.isContent) taskType = 'content';
      else if (intent.isStrategy) taskType = 'strategy';
      else if (intent.isResearch) taskType = 'research';
      else if (intent.isTrend) taskType = 'research';

      const temperature = getTemperature(intent);

      // Step 6: Call API with assembled prompt
      setProcessingSteps('Getting response...');
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
              }
            } catch {}
          }
        }
      }
      
      setRawResponse(text);
      const structured = parseStructuredResponse(text);
      setStructuredData(structured);
    } catch (e: any) {
      setRawResponse(`Error: ${e.message}`);
    }
    setLoading(false);
    setProcessingSteps('');
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  const handleNewQuery = () => {
    setQuery('');
    setRawResponse('');
    setStructuredData(null);
    setIntentResult(null);
    setShowResults(false);
    setProcessingSteps('');
  };

  const handleCopy = () => {
    const textToCopy = structuredData 
      ? structuredData.sections.map(s => `${s.emoji} ${s.title}\n${s.content}`).join('\n\n')
      : rawResponse;
    navigator.clipboard.writeText(textToCopy);
  };

  const renderSectionContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('* ')) {
        return <div key={i} className="section-bullet">• {line.slice(2)}</div>;
      }
      if (line.startsWith('The gap:') || line.startsWith('The uncomfortable truth:')) {
        return <div key={i} className="section-subhead">{line}</div>;
      }
      if (line.startsWith('This week:') || line.startsWith('In 30 days:') || line.startsWith('Longer bet:') || line.startsWith('⚡ Start')) {
        return <div key={i} className="section-timeline">{line}</div>;
      }
      if (line.trim() === '') return null;
      return <div key={i}>{line}</div>;
    });
  };

  return (
    <div className="content-area" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div className="home-hero" style={{ textAlign: 'center' }}>
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot"></span>
          Live web intelligence · 2026
        </div>
        
        <h1 className="hero-h1">
          {greeting && <span style={{ display: 'block', fontSize: '18px', fontWeight: 500, color: '#00ffcc', marginBottom: '8px' }}>{greeting}</span>}
          What do you want to <span>create today?</span>
        </h1>
        
        <p className="hero-p">Your AI social media agent — just describe what you need</p>
        
        {/* Agent Input */}
        <div style={{ position: 'relative', marginBottom: '12px', maxWidth: '720px', margin: '0 auto 12px' }}>
          <textarea 
            id="agent-input"
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }} 
            placeholder="e.g. I run a cafe in Jaipur — what should I post this week?
e.g. Write 5 Instagram Reels hooks for my skincare brand
e.g. Find yoga influencers in Delhi for my brand" 
            rows={3}
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
        
        {/* Quick Prompts */}
        <div id="quick-prompts" style={{ marginBottom: '8px' }}>
          {quickPrompts.map((qp, i) => (
            <button key={i} onClick={() => handleQuickPrompt(qp.prompt)}>
              {qp.label}
            </button>
          ))}
        </div>
        
        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Press Enter to send · Shift+Enter for new line · <b>Ctrl+Enter</b> works too</div>
      </div>
      
      {/* Processing Steps */}
      {loading && processingSteps && (
        <div className="thinking-state">
          <div className="thinking-spinner"></div>
          <span>{processingSteps}</span>
        </div>
      )}
      
      {/* Output */}
      {showResults && !loading && (
        <div className="output-wrap show">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Agent response
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="copy-output" onClick={handleCopy}>Copy</button>
              <button className="save-output-btn">Save</button>
              <button className="copy-output" onClick={() => setShowResults(false)} style={{ border: 'none', background: 'transparent' }}>✕ Clear</button>
              <button className="new-query-btn" onClick={handleNewQuery}>New query</button>
            </div>
          </div>
          
          {/* Intent Result Display */}
          {intentResult && (
            <div className="response-meta">
              <span className="meta-intent">
                Intent: {intentResult.isContent ? 'Content' : intentResult.isResearch ? 'Research' : intentResult.isStrategy ? 'Strategy' : intentResult.isTrend ? 'Trend' : 'General'}
              </span>
              <span className={`meta-confidence ${intentResult.confidence.toLowerCase()}`}>
                Confidence: {intentResult.confidence}
              </span>
              <span className="meta-warning">Source: {intentResult.source}</span>
            </div>
          )}
          
          {/* Meta Info from structured response */}
          {structuredData && (
            <div className="response-meta">
              <span className="meta-intent">Intent: {structuredData.intent}</span>
              <span className={`meta-confidence ${structuredData.confidence.toLowerCase()}`}>Confidence: {structuredData.confidence}</span>
              {structuredData.warnings?.map((warning, i) => (
                <span key={i} className="meta-warning">⚠️ {warning}</span>
              ))}
            </div>
          )}
          
          <div id="agent-output-box" className="output-box">
            {structuredData ? (
              <div className="structured-output">
                {structuredData.sections.map((section, i) => (
                  <div key={i} className="output-section">
                    <div className="section-title">
                      <span className="section-emoji">{section.emoji}</span>
                      {section.title}
                    </div>
                    <div className="section-content">
                      {renderSectionContent(section.content)}
                    </div>
                  </div>
                ))}
                {structuredData.feedback && (
                  <div className="feedback-section">
                    <span>Was this helpful?</span>
                    <div className="feedback-buttons">
                      <button className="feedback-btn">👍 Good</button>
                      <button className="feedback-btn">👎 Needs work</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              rawResponse
            )}
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
        <div className="hbadge">
          No client selected
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