'use client';

import { useState } from 'react';

interface EnvVar {
  key: string;
  label: string;
  description: string;
  current: string;
}

const envVars: EnvVar[] = [
  { key: 'GROQ_API_KEY', label: 'Groq API Key', description: 'For fast AI responses', current: '' },
  { key: 'MISTRAL_API_KEY', label: 'Mistral API Key', description: 'Alternative AI provider', current: '' },
  { key: 'GEMINI_API_KEY', label: 'Gemini API Key', description: 'Google AI provider', current: '' },
  { key: 'SERPER_API_KEY', label: 'Serper API Key', description: 'Web search functionality', current: '' },
  { key: 'EXA_API_KEY', label: 'Exa API Key', description: 'AI-powered search', current: '' },
  { key: 'GNEWS_API_KEY', label: 'GNews API Key', description: 'News aggregation', current: '' },
  { key: 'INSTAGRAM_TOKEN', label: 'Instagram Access Token', description: 'For Instagram API access', current: '' },
];

export default function SettingsPage() {
  const [vars, setVars] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('smm_settings', JSON.stringify(vars));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          Configure your API keys. These are stored locally in your browser.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {envVars.map((v) => (
            <div key={v.key}>
              <label style={{ display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {v.label}
              </label>
              <input
                type="password"
                value={vars[v.key] || ''}
                onChange={(e) => setVars({ ...vars, [v.key]: e.target.value })}
                placeholder={`Enter your ${v.label.toLowerCase()}`}
                style={{
                  width: '100%',
                  background: '#111111',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '14px',
                  color: '#ffffff',
                  outline: 'none',
                  fontFamily: 'var(--mono)',
                }}
              />
              <span style={{ fontSize: '11px', color: '#52525b', marginTop: '4px', display: 'block' }}>
                {v.description}
              </span>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleSave}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            background: saved ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)',
            color: saved ? '#4ade80' : '#080808',
            border: saved ? '1px solid rgba(74,222,128,0.3)' : 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: '24px',
          }}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
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
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#71717a' }}></span>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Groq API - Not configured</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#71717a' }}></span>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Mistral API - Not configured</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#71717a' }}></span>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Search APIs - Not configured</span>
          </div>
        </div>
      </div>
    </div>
  );
}