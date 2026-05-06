'use client';

import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  outputRefinement: false,
  deepThink: false,
  darkMode: true,
  qualityMode: 'balanced',
  framework: 'none',
  expertPrompt: '',
  userName: '',
  platform: '',
  tone: '',
  setupComplete: false,
};

export default function SettingsPage() {
  const [outputRefinement, setOutputRefinement] = useState(false);
  const [deepThink, setDeepThink] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [qualityMode, setQualityMode] = useState('balanced');
  const [framework, setFramework] = useState('none');
  const [expertPrompt, setExpertPrompt] = useState('');
  const [promptSaved, setPromptSaved] = useState('');
  const [userName, setUserName] = useState('');
  const [platform, setPlatform] = useState('');
  const [tone, setTone] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smm_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setOutputRefinement(settings.outputRefinement ?? false);
        setDeepThink(settings.deepThink ?? false);
        setDarkMode(settings.darkMode ?? true);
        setQualityMode(settings.qualityMode ?? 'balanced');
        setFramework(settings.framework ?? 'none');
        setExpertPrompt(settings.expertPrompt ?? '');
        setUserName(settings.userName ?? '');
        setPlatform(settings.platform ?? '');
        setTone(settings.tone ?? '');
        setSetupComplete(settings.setupComplete ?? false);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (updates: Partial<typeof DEFAULT_SETTINGS> & { [key: string]: any }) => {
    if (typeof window !== 'undefined') {
      const current = {
        outputRefinement,
        deepThink,
        darkMode,
        qualityMode,
        framework,
        expertPrompt,
        userName,
        platform,
        tone,
        setupComplete,
      };
      const newSettings = { ...current, ...updates };
      localStorage.setItem('smm_settings', JSON.stringify(newSettings));
    }
  };

  const handleDarkMode = (val: boolean) => {
    setDarkMode(val);
    saveSettings({ darkMode: val });
    if (typeof window !== 'undefined') {
      const bg = val ? '#080808' : '#ffffff';
      document.body.style.background = bg;
      document.documentElement.style.background = bg;
      document.querySelectorAll('.shell, .content-area').forEach(el => {
        (el as HTMLElement).style.background = bg;
      });
      if (val) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  };

  const handleOutputRefinement = (val: boolean) => {
    setOutputRefinement(val);
    saveSettings({ outputRefinement: val });
  };

  const handleDeepThink = (val: boolean) => {
    setDeepThink(val);
    saveSettings({ deepThink: val });
  };

  const handleUserName = (val: string) => {
    setUserName(val);
    saveSettings({ userName: val });
  };

  const handlePlatform = (val: string) => {
    setPlatform(val);
    saveSettings({ platform: val });
  };

  const handleTone = (val: string) => {
    setTone(val);
    saveSettings({ tone: val });
  };

  const completeSetup = () => {
    setSetupComplete(true);
    saveSettings({ setupComplete: true });
  };

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
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '14px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '14px',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '14px',
  };

  const smallInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    height: '80px',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12px',
    resize: 'vertical',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <>
      <h2 className="module-title">⚙️ Settings</h2>

      {/* Maya Setup - First time user */}
      {!setupComplete && (
        <div style={{ ...cardStyle, border: '1px solid rgba(0,255,204,0.3)' }} className="settings-card settings-card-accent">
          <div className="settings-card-title settings-card-title-accent">👋 Welcome! Set up Maya</div>
          <div className="settings-card-subtitle">Personalize your AI assistant</div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle} className="settings-label">What should Maya call you?</label>
            <input 
              value={userName}
              onChange={(e) => handleUserName(e.target.value)}
              placeholder="e.g. Gautam"
              style={inputStyle}
              className="settings-input"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle} className="settings-label">Your primary platform</label>
            <select 
              value={platform}
              onChange={(e) => handlePlatform(e.target.value)}
              style={selectStyle}
              className="settings-select"
            >
              <option value="">Select platform...</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter/X">Twitter/X</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle} className="settings-label">Default tone</label>
            <select 
              value={tone}
              onChange={(e) => handleTone(e.target.value)}
              style={selectStyle}
              className="settings-select"
            >
              <option value="">Select tone...</option>
              <option value="Conversational & fun">Conversational & fun</option>
              <option value="Professional & authoritative">Professional & authoritative</option>
              <option value="Hinglish (Hindi + English)">Hinglish (Hindi + English)</option>
              <option value="Inspirational">Inspirational</option>
              <option value="Bold & edgy">Bold & edgy</option>
            </select>
          </div>

          <button 
            onClick={completeSetup}
            disabled={!userName}
            className="settings-save-btn"
          >
            Save & Continue →
          </button>
        </div>
      )}

      {/* Agent Settings */}
      <div style={cardStyle} className="settings-card">
        <div className="settings-card-title">⚙️ Agent Settings</div>
        <div className="settings-card-subtitle">Customize agent behavior</div>

        <div className="settings-row">
          <div>
            <div className="settings-row-title">Output Refinement</div>
            <div className="settings-row-desc">Auto-critique and improve outputs</div>
          </div>
          <label style={toggleStyle}>
            <input type="checkbox" checked={outputRefinement} onChange={(e) => handleOutputRefinement(e.target.checked)} style={toggleInputStyle} />
            <span style={toggleSliderStyle(outputRefinement)}></span>
            <span style={toggleThumbStyle(outputRefinement)}></span>
          </label>
        </div>

        <div className="settings-row settings-row-no-border">
          <div>
            <div className="settings-row-title">Deep Think Mode</div>
            <div className="settings-row-desc">Chain-of-thought reasoning</div>
          </div>
          <label style={toggleStyle}>
            <input type="checkbox" checked={deepThink} onChange={(e) => handleDeepThink(e.target.checked)} style={toggleInputStyle} />
            <span style={toggleSliderStyle(deepThink)}></span>
            <span style={toggleThumbStyle(deepThink)}></span>
          </label>
        </div>

        <div className="settings-hint">⌨️ Keyboard: Ctrl+Enter to submit · Escape to clear</div>
      </div>

      {/* Appearance */}
      <div style={cardStyle} className="settings-card">
        <div className="settings-card-title">🎨 Appearance</div>
        <div className="settings-row settings-row-no-border">
          <div>
            <div className="settings-row-title">Dark Mode</div>
            <div className="settings-row-desc">Switch between dark and light theme</div>
          </div>
          <label style={toggleStyle}>
            <input type="checkbox" checked={darkMode} onChange={(e) => handleDarkMode(e.target.checked)} style={toggleInputStyle} />
            <span style={toggleSliderStyle(darkMode)}></span>
            <span style={toggleThumbStyle(darkMode)}></span>
          </label>
        </div>
      </div>

      {/* Quality Mode */}
      <div style={cardStyle} className="settings-card">
        <div className="settings-card-title">⚖️ Quality Mode</div>
        <div className="settings-card-subtitle">Balance between creativity and consistency</div>
        <select 
          value={qualityMode} 
          onChange={(e) => setQualityMode(e.target.value)}
          style={smallInputStyle}
          className="settings-select"
        >
          <option value="balanced">Balanced (Recommended)</option>
          <option value="consistent">Consistent (Same results every time)</option>
          <option value="creative">Creative (More variety, less predictable)</option>
        </select>
      </div>

      {/* Proprietary Frameworks */}
      <div style={cardStyle} className="settings-card">
        <div className="settings-card-title">🎯 Proprietary Frameworks</div>
        <div className="settings-card-subtitle">Apply our proprietary methodologies</div>
        <select 
          value={framework} 
          onChange={(e) => setFramework(e.target.value)}
          style={smallInputStyle}
          className="settings-select"
        >
          <option value="none">None (Use default)</option>
          <option value="5-HOOK FORMULA">The 5-Hook Formula</option>
          <option value="FESTIVAL RUSH PLAYBOOK">Festival Rush Playbook</option>
          <option value="TIER-2 PENETRATION">Tier-2 City Penetration</option>
        </select>
        <div className="settings-hint">Framework applies to all content generation</div>
      </div>

      {/* Expert Mode */}
      <div style={cardStyle} className="settings-card">
        <div className="settings-card-title">🔧 Expert Mode (Advanced)</div>
        <div className="settings-card-subtitle">Write your own system prompt</div>
        <textarea 
          value={expertPrompt}
          onChange={(e) => setExpertPrompt(e.target.value)}
          placeholder="Enter custom system prompt..."
          style={textareaStyle}
          className="settings-textarea"
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button 
            onClick={() => setPromptSaved('Saved successfully!')}
            className="settings-save-btn settings-save-btn-primary"
          >
            Save as Active
          </button>
          <button 
            onClick={() => { setExpertPrompt(''); setPromptSaved(''); }}
            className="settings-save-btn settings-save-btn-secondary"
          >
            Clear
          </button>
        </div>
        {promptSaved && <div className="settings-saved-msg">{promptSaved}</div>}
      </div>
    </>
  );
}