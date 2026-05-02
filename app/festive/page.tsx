'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';

const festivals = [
  { name: 'Diwali', emoji: '🪔' },
  { name: 'Holi', emoji: '🎨' },
  { name: 'IPL Season', emoji: '🏏' },
  { name: 'Eid', emoji: '🌙' },
  { name: 'Navratri', emoji: '💃' },
  { name: 'Republic Day', emoji: '🇮🇳' },
  { name: 'Independence Day', emoji: '🎉' },
  { name: 'Raksha Bandhan', emoji: '🎀' },
];

export default function FestivePage() {
  const [selectedFest, setSelectedFest] = useState('Diwali');
  const [brand, setBrand] = useState('');
  const [campaignType, setCampaignType] = useState('Full 7-day content series');
  const [offer, setOffer] = useState('');

  const { response: result, isLoading: loading, sendMessage } = useModuleMaya();

  const generate = () => sendMessage([
    { role: 'user', content: `Create a ${selectedFest} festive campaign for ${brand}. Type: ${campaignType}. Offer: ${offer}. Include post ideas, captions, and timing.` }
  ], { task: 'strategy', temperature: 0.7 });

  return (
    <>
      <div className="module-subtitle-yellow">
        🇮🇳 India's festive calendar is your biggest marketing opportunity. Plan campaigns that actually land.
      </div>
      
      <div className="field mb-5">
          <label className="lbl">Select festival</label>
          <div className="festival-pills">
            {festivals.map((f) => (
              <button key={f.name} onClick={() => setSelectedFest(f.name)} className={`festival-pill ${selectedFest === f.name ? 'active' : ''}`}>
                {f.emoji} {f.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="g2 mb-4">
          <div className="field">
            <label className="lbl">Brand & product</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. FreshBrew teas — gifting hampers" />
          </div>
          <div className="field">
            <label className="lbl">Campaign type</label>
            <select value={campaignType} onChange={(e) => setCampaignType(e.target.value)}>
              <option>Full 7-day content series</option>
              <option>Single hero post + caption</option>
              <option>Offer / sale campaign</option>
              <option>Gifting campaign</option>
            </select>
          </div>
        </div>
        <div className="field mb-5">
          <label className="lbl">Offer / angle (optional)</label>
          <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. 30% off, free gifting, limited edition packaging" />
        </div>
        <button onClick={generate} disabled={loading || !brand} className="run-btn btn-yellow">{loading ? 'Generating...' : 'Generate Festive Campaign ✦'}</button>

      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-yellow">
              <span className="dot-yellow"></span>
              Festive Campaign
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'chat' })} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
            </div>
          </div>
          <div className="output-box output-yellow">
            {result}
          </div>
        </div>
      )}
    </>
  );
}
