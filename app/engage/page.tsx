'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';
import { saveOutput } from '@/lib/save';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

type TabType = 'comments' | 'dm' | 'crisis' | 'community';

export default function EngagePage() {
  const [activeTab, setActiveTab] = useState<TabType>('comments');
  
  const [brand, setBrand] = useState('');
  const [commentType, setCommentType] = useState('Mix of all types');
  const [tone, setTone] = useState('Friendly & warm');
  
  const [dmPurpose, setDmPurpose] = useState('Welcome new followers');
  const [dmProduct, setDmProduct] = useState('');
  
  const [crisisSituation, setCrisisSituation] = useState('');
  const [crisisPlatform, setCrisisPlatform] = useState('Instagram comment');
  
  const [comBrand, setComBrand] = useState('');
  const [comType, setComType] = useState('Strategy to identify & nurture top fans');
  
  const { response: result, isLoading: loading, sendMessage, clearHistory } = useModuleMaya({ enableHistory: true });
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !result || saved) return;
    const res = await saveOutput({
      module: 'engage',
      title: `Engage ${activeTab}: ${brand || dmProduct || crisisSituation || comBrand}`,
      content: result,
      metadata: { tab: activeTab },
      userId: user.id,
    });
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const runComments = () => sendMessage([
    { role: 'user', content: `Generate reply templates for ${brand}. Comment type: ${commentType}. Brand tone: ${tone}. Include multiple variations.` }
  ], { task: 'content', temperature: 0.7 });

  const runDM = () => sendMessage([
    { role: 'user', content: `Generate DM flow. Purpose: ${dmPurpose}. What you sell: ${dmProduct}. Include the full sequence.` }
  ], { task: 'content', temperature: 0.7 });

  const runCrisis = () => sendMessage([
    { role: 'user', content: `Generate crisis response for situation: ${crisisSituation}. Platform: ${crisisPlatform}. Handle with care.` }
  ], { task: 'strategy', temperature: 0.4 });

  const runCommunity = () => sendMessage([
    { role: 'user', content: `Generate community management strategy for ${comBrand}. What you need: ${comType}.` }
  ], { task: 'strategy', temperature: 0.5 });

  const tabs = [
    { id: 'comments', label: 'Comment replies' },
    { id: 'dm', label: 'DM flows' },
    { id: 'crisis', label: 'Crisis response' },
    { id: 'community', label: 'Community mgmt' },
  ] as const;

  return (
    <>
      <h2 className="module-title">💬 Engage</h2>
      
      <div className="tabs mb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); clearHistory(); }} className={`tab-btn ${activeTab === tab.id ? 'active-pur' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'comments' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">Brand / niche</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. sustainable fashion brand" />
            </div>
            <div className="field">
              <label className="lbl">Comment type</label>
              <select value={commentType} onChange={(e) => setCommentType(e.target.value)}>
                <option>Mix of all types</option>
                <option>Positive comments</option>
                <option>Product questions</option>
                <option>Price queries</option>
                <option>Complaints</option>
                <option>Trolls & negative</option>
              </select>
            </div>
          </div>
          <div className="field mb-4">
            <label className="lbl">Brand tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Friendly & warm</option>
              <option>Professional</option>
              <option>Witty & playful</option>
              <option>Hinglish</option>
            </select>
          </div>
          <button onClick={runComments} disabled={loading || !brand} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate reply templates ✦'}</button>
        </>
      )}

      {activeTab === 'dm' && (
        <>
          <div className="g2 mb-4">
            <div className="field">
              <label className="lbl">DM purpose</label>
              <select value={dmPurpose} onChange={(e) => setDmPurpose(e.target.value)}>
                <option>Welcome new followers</option>
                <option>Convert leads to buyers</option>
                <option>Follow up after story reply</option>
                <option>Recover cold leads</option>
                <option>Ask for a testimonial</option>
                <option>Referral request</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">What you sell</label>
              <input value={dmProduct} onChange={(e) => setDmProduct(e.target.value)} placeholder="e.g. online nutrition coaching" />
            </div>
          </div>
          <button onClick={runDM} disabled={loading || !dmProduct} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate DM flow ✦'}</button>
        </>
      )}

      {activeTab === 'crisis' && (
        <>
          <div className="info-box mb-4">
            ⚠️ Handle negative PR without damaging the brand.
          </div>
          <div className="field mb-4">
            <label className="lbl">Describe the situation</label>
            <textarea value={crisisSituation} onChange={(e) => setCrisisSituation(e.target.value)} placeholder="e.g. Customer posted that our product broke in 2 days. Comment has 60+ likes." rows={3} />
          </div>
          <div className="field mb-4">
            <label className="lbl">Platform</label>
            <select value={crisisPlatform} onChange={(e) => setCrisisPlatform(e.target.value)}>
              <option>Instagram comment</option>
              <option>Facebook review</option>
              <option>Twitter / X reply</option>
              <option>Google review</option>
              <option>LinkedIn</option>
            </select>
          </div>
          <button onClick={runCrisis} disabled={loading || !crisisSituation} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate crisis response ✦'}</button>
        </>
      )}

      {activeTab === 'community' && (
        <>
          <div className="field mb-4">
            <label className="lbl">Brand & community size</label>
            <input value={comBrand} onChange={(e) => setComBrand(e.target.value)} placeholder="e.g. FitFuel — 8k Instagram followers, active comment section" />
          </div>
          <div className="field mb-4">
            <label className="lbl">What you need</label>
            <select value={comType} onChange={(e) => setComType(e.target.value)}>
              <option>Strategy to identify & nurture top fans</option>
              <option>Pinned comment strategy for viral posts</option>
              <option>UGC outreach — ask customers for video reviews</option>
              <option>Community engagement post ideas</option>
              <option>How to build a brand ambassador program</option>
            </select>
          </div>
          <button onClick={runCommunity} disabled={loading || !comBrand} className="run-btn btn-purple">{loading ? 'Generating...' : 'Generate strategy ✦'}</button>
        </>
      )}
      
      {result && (
        <div className="output-wrap" style={{ borderLeft: '2px solid var(--accent-purple)' }}>
          <div className="output-header">
            <div className="output-label text-purple">
              {activeTab === 'comments' && 'Reply Templates'}
              {activeTab === 'dm' && 'DM Flow'}
              {activeTab === 'crisis' && 'Crisis Response'}
              {activeTab === 'community' && 'Community Strategy'}
            </div>
          <div className="output-actions">
            <button className="save-output-btn" onClick={handleSave} disabled={saved}>
              {saved ? 'Saved ✓' : 'Save'}
            </button>
            <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
          </div>
          </div>
          <div className="output-box">
            {result}
          </div>
        </div>
      )}
    </>
  );
}
