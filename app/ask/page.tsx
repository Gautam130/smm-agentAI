'use client';

import { useState, useRef, useEffect } from 'react';
import { useMaya } from '@/lib/maya';

const suggestions = [
  'Best Instagram strategy for D2C India',
  '5 hooks for skincare brand India',
  'Research boAt marketing',
  'Diwali campaign 50k budget',
];

export default function AskMayaPage() {
  const { messages, isLoading, sendMessage, clearChat } = useMaya();
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="content-area" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="module-tile">
        {/* Suggestions */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)', marginBottom: '16px' }}>
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => setInput(s)}
              className="btn"
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              {s}
            </button>
          ))}
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              style={{ 
                fontSize: '11px', 
                padding: '6px 12px', 
                borderRadius: '14px', 
                border: '1px solid rgba(255,100,100,0.2)',
                background: 'rgba(255,100,100,0.1)',
                color: '#f87171',
                cursor: 'pointer',
              }}
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div ref={chatRef} className="chat-wrap">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              Ask Maya anything about your social media strategy
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className={`chat-avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
                  {msg.role === 'user' ? 'U' : 'M'}
                </div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'} ${msg.streaming ? 'typing' : ''}`}>
                  {msg.text}
                  {msg.streaming && <span style={{ color: 'var(--accent)' }}>▋</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Row */}
        <div className="chat-input-row">
          <button id="chat-upload-btn" title="Attach file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <button id="chat-upload-btn" title="Voice input" style={{ marginRight: '0' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={2}
          />
          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send ↑
          </button>
        </div>
      </div>
    </div>
  );
}