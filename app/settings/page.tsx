'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [outputRefinement, setOutputRefinement] = useState(false);
  const [deepThink, setDeepThink] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [qualityMode, setQualityMode] = useState('balanced');
  const [framework, setFramework] = useState('none');
  const [expertPrompt, setExpertPrompt] = useState('');
  const [promptSaved, setPromptSaved] = useState('');

  const toggleStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: '44px',
    height: '24px',
  };

  const toggleInputStyle: React.CSSProperties = {
    opacity: 0,
    width: 0,
    height: 0,
  };

  const toggleSliderStyle = (active: boolean): React.CSSProperties => ({
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: active ? '#00ffcc' : '#52525b',
    borderRadius: '24px',
    transition: '0.3s',
  });

  const toggleThumbStyle = (active: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '2px',
    left: active ? '22px' : '2px',
    width: '20px',
    height: '20px',
    background: 'white',
    borderRadius: '50%',
    transition: '0.3s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  });

  const cardStyle: React.CSSProperties = {
    background: '#111111',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '14px',
  };

  return (
    <>
      <h2 className="module-title">⚙️ Settings</h2>

      {/* Agent Settings */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#00ffcc', marginBottom: '4px' }}>⚙️ Agent Settings</div>
        <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '10px' }}>Customize agent behavior</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>Output Refinement</div>
            <div style={{ fontSize: '10px', color: '#71717a' }}>Auto-critique and improve outputs</div>
          </div>
          <label style={toggleStyle}>
            <input type="checkbox" checked={outputRefinement} onChange={(e) => setOutputRefinement(e.target.checked)} style={toggleInputStyle} />
            <span style={toggleSliderStyle(outputRefinement)}></span>
            <span style={toggleThumbStyle(outputRefinement)}></span>
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>Deep Think Mode</div>
            <div style={{ fontSize: '10px', color: '#71717a' }}>Chain-of-thought reasoning</div>
          </div>
          <label style={toggleStyle}>
            <input type="checkbox" checked={deepThink} onChange={(e) => setDeepThink(e.target.checked)} style={toggleInputStyle} />
            <span style={toggleSliderStyle(deepThink)}></span>
            <span style={toggleThumbStyle(deepThink)}></span>
          </label>
        </div>

        <div style={{ fontSize: '10px', color: '#71717a', marginTop: '8px' }}>⌨️ Keyboard: Ctrl+Enter to submit · Escape to clear</div>
      </div>

      {/* Appearance */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#00ffcc', marginBottom: '8px' }}>🎨 Appearance</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>Dark Mode</div>
            <div style={{ fontSize: '10px', color: '#71717a' }}>Switch between dark and light theme</div>
          </div>
          <label style={toggleStyle}>
            <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} style={toggleInputStyle} />
            <span style={toggleSliderStyle(darkMode)}></span>
            <span style={toggleThumbStyle(darkMode)}></span>
          </label>
        </div>
      </div>

      {/* Quality Mode */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#00ffcc', marginBottom: '4px' }}>⚖️ Quality Mode</div>
        <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '10px' }}>Balance between creativity and consistency</div>
        <select 
          value={qualityMode} 
          onChange={(e) => setQualityMode(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', fontSize: '13px' }}
        >
          <option value="balanced">Balanced (Recommended)</option>
          <option value="consistent">Consistent (Same results every time)</option>
          <option value="creative">Creative (More variety, less predictable)</option>
        </select>
      </div>

      {/* Proprietary Frameworks */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#00ffcc', marginBottom: '4px' }}>🎯 Proprietary Frameworks</div>
        <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '10px' }}>Apply our proprietary methodologies</div>
        <select 
          value={framework} 
          onChange={(e) => setFramework(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', fontSize: '13px' }}
        >
          <option value="none">None (Use default)</option>
          <option value="5-HOOK FORMULA">The 5-Hook Formula</option>
          <option value="FESTIVAL RUSH PLAYBOOK">Festival Rush Playbook</option>
          <option value="TIER-2 PENETRATION">Tier-2 City Penetration</option>
        </select>
        <div style={{ fontSize: '10px', color: '#71717a', marginTop: '6px' }}>Framework applies to all content generation</div>
      </div>

      {/* Expert Mode */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#00ffcc', marginBottom: '4px' }}>🔧 Expert Mode (Advanced)</div>
        <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '10px' }}>Write your own system prompt</div>
        <textarea 
          value={expertPrompt}
          onChange={(e) => setExpertPrompt(e.target.value)}
          placeholder="Enter custom system prompt..."
          style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', fontSize: '12px', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button 
            onClick={() => setPromptSaved('Saved successfully!')}
            style={{ padding: '8px 16px', background: '#00ffcc', color: '#080808', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Save as Active
          </button>
          <button 
            onClick={() => { setExpertPrompt(''); setPromptSaved(''); }}
            style={{ padding: '8px 16px', background: '#52525b', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
        {promptSaved && <div style={{ fontSize: '10px', color: '#00ffcc', marginTop: '6px' }}>{promptSaved}</div>}
      </div>
    </>
  );
}