'use client';

import { useState } from 'react';

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
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setResult(prev => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch { setResult('Error generating content'); }
    setLoading(false);
  };

  const runComments = () => generate(`Generate reply templates for ${brand}. Comment type: ${commentType}. Brand tone: ${tone}. Include multiple variations.`);
  const runDM = () => generate(`Generate DM flow. Purpose: ${dmPurpose}. What you sell: ${dmProduct}. Include the full sequence.`);
  const runCrisis = () => generate(`Generate crisis response for situation: ${crisisSituation}. Platform: ${crisisPlatform}. Handle with care.`);
  const runCommunity = () => generate(`Generate community management strategy for ${comBrand}. What you need: ${comType}.`);

  const tabs = [
    { id: 'comments', label: 'Comment replies' },
    { id: 'dm', label: 'DM flows' },
    { id: 'crisis', label: 'Crisis response' },
    { id: 'community', label: 'Community mgmt' },
  ] as const;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const selectStyle: React.CSSProperties = { width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' };
  const btnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' };
  const resultStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', borderLeft: '2px solid #a855f7' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '24px', border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(''); }} style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(168,85,247,0.1)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab.id ? '#a855f7' : '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'comments' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>Brand / niche</label><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. sustainable fashion brand" style={inputStyle} /></div>
              <div><label style={labelStyle}>Comment type</label><select value={commentType} onChange={(e) => setCommentType(e.target.value)} style={selectStyle}><option>Mix of all types</option><option>Positive comments</option><option>Product questions</option><option>Price queries</option><option>Complaints</option><option>Trolls & negative</option></select></div>
            </div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Brand tone</label><select value={tone} onChange={(e) => setTone(e.target.value)} style={selectStyle}><option>Friendly & warm</option><option>Professional</option><option>Witty & playful</option><option>Hinglish</option></select></div>
            <button onClick={runComments} disabled={loading || !brand} style={btnStyle}>{loading ? 'Generating...' : 'Generate reply templates ✦'}</button>
          </>
        )}

        {activeTab === 'dm' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={labelStyle}>DM purpose</label><select value={dmPurpose} onChange={(e) => setDmPurpose(e.target.value)} style={selectStyle}><option>Welcome new followers</option><option>Convert leads to buyers</option><option>Follow up after story reply</option><option>Recover cold leads</option><option>Ask for a testimonial</option><option>Referral request</option></select></div>
              <div><label style={labelStyle}>What you sell</label><input value={dmProduct} onChange={(e) => setDmProduct(e.target.value)} placeholder="e.g. online nutrition coaching" style={inputStyle} /></div>
            </div>
            <button onClick={runDM} disabled={loading || !dmProduct} style={btnStyle}>{loading ? 'Generating...' : 'Generate DM flow ✦'}</button>
          </>
        )}

        {activeTab === 'crisis' && (
          <>
            <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '16px', padding: '12px', background: 'rgba(248,113,113,0.05)', borderRadius: '8px' }}>
              ⚠️ Handle negative PR without damaging the brand.
            </div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Describe the situation</label><textarea value={crisisSituation} onChange={(e) => setCrisisSituation(e.target.value)} placeholder="e.g. Customer posted that our product broke in 2 days. Comment has 60+ likes." rows={3} style={{ ...inputStyle, resize: 'none' }} /></div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Platform</label><select value={crisisPlatform} onChange={(e) => setCrisisPlatform(e.target.value)} style={selectStyle}><option>Instagram comment</option><option>Facebook review</option><option>Twitter / X reply</option><option>Google review</option><option>LinkedIn</option></select></div>
            <button onClick={runCrisis} disabled={loading || !crisisSituation} style={btnStyle}>{loading ? 'Generating...' : 'Generate crisis response ✦'}</button>
          </>
        )}

        {activeTab === 'community' && (
          <>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Brand & community size</label><input value={comBrand} onChange={(e) => setComBrand(e.target.value)} placeholder="e.g. FitFuel — 8k Instagram followers, active comment section" style={inputStyle} /></div>
            <div style={{ marginBottom: '20px' }}><label style={labelStyle}>What you need</label><select value={comType} onChange={(e) => setComType(e.target.value)} style={selectStyle}><option>Strategy to identify & nurture top fans</option><option>Pinned comment strategy for viral posts</option><option>UGC outreach — ask customers for video reviews</option><option>Community engagement post ideas</option><option>How to build a brand ambassador program</option></select></div>
            <button onClick={runCommunity} disabled={loading || !comBrand} style={btnStyle}>{loading ? 'Generating...' : 'Generate strategy ✦'}</button>
          </>
        )}
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7' }}>
              {activeTab === 'comments' && 'Reply Templates'}
              {activeTab === 'dm' && 'DM Flow'}
              {activeTab === 'crisis' && 'Crisis Response'}
              {activeTab === 'community' && 'Community Strategy'}
            </div>
            <button style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}>Copy</button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}