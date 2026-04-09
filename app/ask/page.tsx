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
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
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
    <div style={{ maxWidth: '900px' }}>
      <div className="panel-header">
        <div style={{ fontWeight: 600, fontSize: '14px' }}>Ask Maya</div>
      </div>
      
      <div className="notice n-green">Ask your agent anything — it remembers the conversation within this session.</div>
      
      <div className="chat-suggestions">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => setInput(s)} className="suggestion-btn">
            {s}
          </button>
        ))}
      </div>

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
                {msg.streaming && <span className="cursor-blink">▋</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {attachedFile && (
        <div className="file-context">
          <span>{attachedFile.name}</span> — <span>{attachedFile.size}</span> attached
          <button onClick={() => setAttachedFile(null)} className="file-remove">✕ remove</button>
        </div>
      )}

      <div className="chat-input-row">
        <div style={{ position: 'relative' }}>
          <button className="chat-upload" title="Attach file">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... e.g. I run a chai brand in Jaipur targeting 18-30 year olds. What should I post this week?"
          rows={2}
        />
        <button className="voice-btn" title="Voice input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>
        </button>
        <button className="chat-send" onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send ↑
        </button>
      </div>

      <div className="input-hint">
        <span>Press Enter to send • Shift+Enter for new line</span>
        {messages.length > 0 && (
          <button onClick={clearChat} className="clear-chat-btn">Clear chat</button>
        )}
      </div>
    </div>
  );
}