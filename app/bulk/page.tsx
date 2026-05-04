'use client';

import { useState } from 'react';
import { useModuleMaya } from '@/lib/hooks/useModuleMaya';
import { saveOutput } from '@/lib/save';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function BulkPage() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);

  const { response: result, isLoading: loading, sendMessage } = useModuleMaya();
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !result || saved) return;
    const res = await saveOutput({
      module: 'bulk',
      title: `${count} posts: ${topic.substring(0, 50)}...`,
      content: result,
      metadata: { count, topic: topic.substring(0, 100) },
      userId: user.id,
    });
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const generate = () => sendMessage([
    { role: 'user', content: `Generate ${count} social media post ideas for: ${topic}. Include captions, hooks, and post types.` }
  ], { task: 'content', temperature: 0.75 });

  return (
    <>
      <h2 className="module-title">⚡ Bulk Generate</h2>
      
      <div className="field">
        <label className="lbl">Number of Posts</label>
        <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
          <option value={5}>5 Posts</option>
          <option value={10}>10 Posts</option>
          <option value={15}>15 Posts</option>
          <option value={20}>20 Posts</option>
        </select>
      </div>
      
      <div className="field mb-4">
        <label className="lbl">What do you want content about?</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Our new summer collection for women"
          rows={2}
        />
      </div>
      
      <button
        onClick={generate}
        disabled={loading || !topic.trim()}
        className="run-btn btn-yellow"
      >
        {loading ? 'Generating...' : `Generate ${count} Posts`}
      </button>
      
      {result && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label text-yellow">
              <span className="dot-yellow"></span>
              Generated Content
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'chat' })} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="save-output-btn" onClick={handleSave} disabled={saved}>
                {saved ? 'Saved ✓' : 'Save'}
              </button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(result)}>Copy All</button>
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
