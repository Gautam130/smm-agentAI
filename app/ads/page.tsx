'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';

type TabType = 'copy' | 'strategy' | 'audience';

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('copy');
  
  const [adType, setAdType] = useState('Instagram Reel');
  const [product, setProduct] = useState('');
  const [offer, setOffer] = useState('');
  const [cta, setCta] = useState('Shop Now');
  
  const [campaignGoal, setCampaignGoal] = useState('Brand Awareness');
  const [budget, setBudget] = useState('50000');
  const [duration, setDuration] = useState('30');
  
  const [targetDemographic, setTargetDemographic] = useState('');
  const [interests, setInterests] = useState('');
  
  const { response: result, isLoading: loading, sendMessage, clearHistory } = useModuleMaya({ enableHistory: true });

  const runCopy = () => sendMessage([
    { role: 'user', content: `Generate ad copy for ${adType}. Product: ${product}. Offer: ${offer}. CTA: ${cta}. Include multiple variations.` }
  ], { task: 'content', temperature: 0.75 });

  const runStrategy = () => sendMessage([
    { role: 'user', content: `Create a complete ad campaign strategy. Goal: ${campaignGoal}. Budget: ₹${budget}. Duration: ${duration} days. Include targeting, bidding strategy, and creative recommendations.` }
  ], { task: 'strategy', temperature: 0.5 });

  const runAudience = () => sendMessage([
    { role: 'user', content: `Suggest target audience segments for ${targetDemographic}. Interests: ${interests}. Include lookalike audiences and retargeting strategies.` }
  ], { task: 'strategy', temperature: 0.5 });

  const tabs = [
    { id: 'copy', label: 'Ad Copy' },
    { id: 'strategy', label: 'Campaign Strategy' },
    { id: 'audience', label: 'Targeting' },
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

      {activeTab === 'copy' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Ad format</label>
              <select value={adType} onChange={(e) => setAdType(e.target.value)}>
                <option>Instagram Reel</option>
                <option>Instagram Carousel</option>
                <option>Instagram Story</option>
                <option>Facebook Feed</option>
                <option>LinkedIn Sponsored</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">Call to action</label>
              <select value={cta} onChange={(e) => setCta(e.target.value)}>
                <option>Shop Now</option>
                <option>Learn More</option>
                <option>Sign Up</option>
                <option>Book Now</option>
              </select>
            </div>
          </div>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Product / service</label>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Organic face serum" />
            </div>
            <div className="field">
              <label className="lbl">Offer / USP</label>
              <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="e.g. 30% off, free shipping" />
            </div>
          </div>
          <button onClick={runCopy} disabled={loading || !product} className="run-btn btn-purple">
            {loading ? 'Generating...' : 'Generate Ad Copy ✦'}
          </button>
        </>
      )}

      {activeTab === 'strategy' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Campaign goal</label>
              <select value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)}>
                <option>Brand Awareness</option>
                <option>Lead Generation</option>
                <option>Sales / Conversions</option>
                <option>Traffic / Clicks</option>
                <option>Engagement</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">Budget (₹)</label>
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option>10000</option>
                <option>25000</option>
                <option>50000</option>
                <option>100000</option>
                <option>250000</option>
              </select>
            </div>
          </div>
          <div className="field mb-5">
            <label className="lbl">Campaign duration (days)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <button onClick={runStrategy} disabled={loading} className="run-btn btn-purple">
            {loading ? 'Creating...' : 'Generate Campaign Strategy ✦'}
          </button>
        </>
      )}

      {activeTab === 'audience' && (
        <>
          <div className="g2 mb-5">
            <div className="field">
              <label className="lbl">Demographics</label>
              <input value={targetDemographic} onChange={(e) => setTargetDemographic(e.target.value)} placeholder="e.g. Women 25-45, Tier 1 cities" />
            </div>
            <div className="field">
              <label className="lbl">Interests</label>
              <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. skincare, wellness, fitness" />
            </div>
          </div>
          <button onClick={runAudience} disabled={loading || !targetDemographic} className="run-btn btn-purple">
            {loading ? 'Researching...' : 'Get Targeting Suggestions ✦'}
          </button>
        </>
      )}
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-purple">
              <span className="dot-purple"></span>
              Results
              <button className="clear-btn" onClick={clearHistory} title="Clear">✕</button>
            </div>
            <div className="output-actions">
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
