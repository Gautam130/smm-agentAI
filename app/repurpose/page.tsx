'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';
import { saveOutput } from '@/lib/save';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RepurposePage() {
  const [content, setContent] = useState('');
  const [formats, setFormats] = useState('All 6 formats (Reel, Story, Thread, Carousel, LinkedIn, Email)');
  const [tone, setTone] = useState('Keep original tone');

  const { response: result, isLoading: loading, sendMessage } = useModuleMaya();
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !result || saved) return;
    const res = await saveOutput({
      module: 'repurpose',
      title: `Repurposed: ${content.substring(0, 40)}...`,
      content: result,
      metadata: { formats, tone },
      userId: user.id,
    });
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const generate = () => sendMessage([
    { role: 'user', content: `Repurpose the following content into ${formats}. Tone: ${tone}. Original content: ${content}` }
  ], { task: 'content', temperature: 0.7 });

  return (
    <>
      <div className="notice n-green">
        ♻️ Paste any content — blog post, video script, caption, article — and get it adapted for every platform.
      </div>
      
      <div className="field">
        <label className="lbl">Original content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your original content here..." rows={8} />
      </div>
      
      <div className="g2 mb-4">
        <div className="field">
          <label className="lbl">Repurpose into</label>
          <select value={formats} onChange={(e) => setFormats(e.target.value)}>
            <option>All 6 formats (Reel, Story, Thread, Carousel, LinkedIn, Email)</option>
            <option>Reel caption only</option>
            <option>Carousel script only</option>
            <option>Twitter/X thread only</option>
            <option>LinkedIn post only</option>
            <option>Email newsletter snippet</option>
          </select>
        </div>
        <div className="field">
          <label className="lbl">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Keep original tone</option>
            <option>Make more casual & fun</option>
            <option>Make more professional</option>
            <option>Make more punchy & short</option>
          </select>
        </div>
      </div>
      
      <button onClick={generate} disabled={loading || !content} className="run-btn">
        {loading ? 'Repurposing...' : 'Repurpose Now ✦'}
      </button>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Repurposed Content
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'chat' })} title="Clear">✕</button>
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
