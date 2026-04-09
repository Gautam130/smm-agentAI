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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          flexWrap: 'wrap', 
          padding: '12px 16px', 
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => setInput(s)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              {s}
            </button>
          ))}
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,100,100,0.1)',
                color: '#f87171',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              Clear Chat
            </button>
          )}
        </div>

        <div ref={chatRef} style={{ 
          minHeight: '400px', 
          maxHeight: '520px', 
          overflowY: 'auto', 
          padding: '16px 12px',
          background: '#0a0a0a',
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>
              Ask Maya anything about your social media strategy
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '10px', 
                marginBottom: '12px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                  background: msg.role === 'user' 
                    ? 'rgba(255,255,255,0.06)' 
                    : 'linear-gradient(135deg, #00ffcc 0%, #a855f7 100%)',
                  color: msg.role === 'user' ? '#71717a' : '#080808',
                }}>
                  {msg.role === 'user' ? 'U' : 'M'}
                </div>
                <div style={{
                  maxWidth: '78%',
                  minWidth: '120px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(0,255,204,0.12) 0%, rgba(168,85,247,0.08) 100%)'
                    : '#111111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                  {msg.streaming && <span style={{ animation: 'pulse 1s infinite' }}>▋</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'flex-end',
          padding: '14px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#0a0a0a',
        }}>
          <div style={{ display: 'flex', gap: '6px', paddingBottom: '8px' }}>
            <button title="Attach file" style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#111111',
              color: '#71717a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <button title="Voice input" style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#111111',
              color: '#71717a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={2}
            style={{
              flex: 1,
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#ffffff',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 20px',
              background: isLoading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)',
              border: 'none',
              borderRadius: '12px',
              color: isLoading ? '#71717a' : '#080808',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            Send ↑
          </button>
        </div>
      </div>
    </div>
  );
}