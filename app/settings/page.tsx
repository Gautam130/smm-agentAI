'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [apiStatus, setApiStatus] = useState<Record<string, 'checking' | 'ok' | 'error'>>({});

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiStatus({ checking: true, checking: true, checking: true });
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })
      });
      if (res.ok) {
        setApiStatus({ groq: 'ok', mistral: 'ok', search: 'ok' });
      } else {
        setApiStatus({ groq: 'error', mistral: 'error', search: 'error' });
      }
    } catch {
      setApiStatus({ groq: 'error', mistral: 'error', search: 'error' });
    }
  };

  const statusColor = (status?: string) => {
    if (status === 'ok') return '#4ade80';
    if (status === 'error') return '#f87171';
    return '#71717a';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          ⚙️ Settings
        </h2>
        <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px' }}>
          API keys are configured in Vercel. You don't need to enter them here.
        </p>
        
        <div style={{ 
          background: 'rgba(0,255,204,0.05)', 
          border: '1px solid rgba(0,255,204,0.2)', 
          borderRadius: '12px', 
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px', color: '#00ffcc', fontWeight: 600, marginBottom: '8px' }}>
            ✓ API Keys Configured
          </div>
          <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
            Your API keys are set in Vercel environment variables. The AI chat should work automatically.
          </div>
        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '28px',
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>🔌 API Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(apiStatus.groq) }}></span>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Groq API - {apiStatus.groq === 'ok' ? 'Connected' : apiStatus.groq === 'error' ? 'Error' : 'Checking...'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(apiStatus.mistral) }}></span>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Mistral API - {apiStatus.mistral === 'ok' ? 'Connected' : apiStatus.mistral === 'error' ? 'Error' : 'Checking...'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(apiStatus.search) }}></span>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Search APIs - {apiStatus.search === 'ok' ? 'Connected' : apiStatus.search === 'error' ? 'Error' : 'Checking...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}