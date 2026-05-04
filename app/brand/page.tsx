'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';
import { saveOutput } from '@/lib/save';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

type TabType = 'identity' | 'guidelines' | 'assets';

export default function BrandPage() {
  const [activeTab, setActiveTab] = useState<TabType>('identity');
  
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [values, setValues] = useState('');
  const [voice, setVoice] = useState('');
  
  const [colors, setColors] = useState('');
  const [fonts, setFonts] = useState('');
  const [dos, setDos] = useState('');
  const [donts, setDonts] = useState('');
  
  const { response: result, isLoading: loading, sendMessage, clearHistory } = useModuleMaya({ enableHistory: true });
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !result || saved) return;
    const res = await saveOutput({
      module: 'brand',
      title: `Brand ${activeTab}: ${brandName || colors || activeTab}`,
      content: result,
      metadata: { tab: activeTab, brandName },
      userId: user.id,
    });
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const runIdentity = () => sendMessage([
    { role: 'user', content: `Create a brand identity for ${brandName}. Tagline: ${tagline}. Values: ${values}. Voice: ${voice}.` }
  ], { task: 'strategy', temperature: 0.6 });

  const runGuidelines = () => sendMessage([
    { role: 'user', content: `Create brand guidelines. Colors: ${colors}. Fonts: ${fonts}. Do's: ${dos}. Don'ts: ${donts}.` }
  ], { task: 'strategy', temperature: 0.5 });

  const tabs = [
    { id: 'identity', label: 'Brand Identity' },
    { id: 'guidelines', label: 'Guidelines' },
    { id: 'assets', label: 'Assets' },
  ] as const;

  return (
    <>
      <div className="stabs">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); clearHistory(); }} className={`stab ${activeTab === tab.id ? 'active-purple' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'identity' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Brand name</label>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. FreshBrew" />
            </div>
            <div className="field">
              <label className="lbl">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Sip the difference" />
            </div>
          </div>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Brand values</label>
              <input value={values} onChange={(e) => setValues(e.target.value)} placeholder="e.g. Quality, Innovation, Sustainability" />
            </div>
            <div className="field">
              <label className="lbl">Brand voice</label>
              <input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="e.g. Friendly, professional, educational" />
            </div>
          </div>
          <button onClick={runIdentity} disabled={loading || !brandName} className="run-btn btn-purple">
            {loading ? 'Generating...' : 'Generate Identity ✦'}
          </button>
        </>
      )}

      {activeTab === 'guidelines' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Brand colors</label>
              <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="e.g. Navy blue, gold, white" />
            </div>
            <div className="field">
              <label className="lbl">Fonts</label>
              <input value={fonts} onChange={(e) => setFonts(e.target.value)} placeholder="e.g. Plus Jakarta Sans, Inter" />
            </div>
          </div>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Do's</label>
              <input value={dos} onChange={(e) => setDos(e.target.value)} placeholder="e.g. Use high-res images, consistent colors" />
            </div>
            <div className="field">
              <label className="lbl">Don'ts</label>
              <input value={donts} onChange={(e) => setDonts(e.target.value)} placeholder="e.g. Use competitor logos, overused stock photos" />
            </div>
          </div>
          <button onClick={runGuidelines} disabled={loading || !colors} className="run-btn btn-purple">
            {loading ? 'Generating...' : 'Generate Guidelines ✦'}
          </button>
        </>
      )}

      {activeTab === 'assets' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>🎨 Brand Assets</div>
          <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>Upload and manage your brand assets</div>
          <div className="notice n-purple">⚡ Coming Soon</div>
        </div>
      )}
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Brand Kit
              <button className="clear-btn" onClick={clearHistory} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="save-output-btn" onClick={handleSave} disabled={saved}>
                {saved ? 'Saved ✓' : 'Save'}
              </button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box output-purple">
            {result}
          </div>
        </div>
      )}
    </>
  );
}
