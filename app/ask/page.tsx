'use client';

import { useState } from 'react';

const suggestions = [
  'Best Instagram strategy for D2C India',
  '5 hooks for skincare brand India',
  'Research boAt marketing',
  'Diwali campaign 50k budget',
];

export default function AskMayaPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

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
                aiResponse += parsed.choices[0].delta.content;
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch {}
          }
        }
      }

      if (!aiResponse.trim()) {
        aiResponse = 'Got empty response. Try again.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg = err.name === 'AbortError' ? 'Request timed out' : (err.message || 'Failed to connect');
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}` }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Suggestions */}
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
        </div>

        {/* Chat History */}
        <div style={{ 
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
                }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00ffcc 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                M
              </div>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: '#111111',
                color: '#a1a1aa',
              }}>
                ▋
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'flex-end',
          padding: '14px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#0a0a0a',
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything... e.g. I run a chai brand in Jaipur targeting 18-30 year olds. What should I post this week?"
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
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 20px',
              background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)',
              border: 'none',
              borderRadius: '12px',
              color: loading ? '#71717a' : '#080808',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Send ↑
          </button>
        </div>
      </div>
    </div>
  );
}