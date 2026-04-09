'use client';

import { useState } from 'react';

interface QueuedPost {
  id: number;
  content: string;
  platform: string;
  scheduledTime: string;
  status: 'queued' | 'scheduled';
}

export default function QueuePage() {
  const [posts, setPosts] = useState<QueuedPost[]>([
    { id: 1, content: 'New summer collection launching soon! ☀️', platform: 'Instagram', scheduledTime: 'Today, 6PM', status: 'queued' },
    { id: 2, content: 'Behind the scenes of our photoshoot', platform: 'Instagram', scheduledTime: 'Tomorrow, 12PM', status: 'scheduled' },
    { id: 3, content: 'Customer review spotlight - Sarah says...', platform: 'LinkedIn', scheduledTime: 'Feb 15, 9AM', status: 'queued' },
  ]);
  const [newPost, setNewPost] = useState('');
  const [platform, setPlatform] = useState('Instagram');

  const addPost = () => {
    if (!newPost.trim()) return;
    setPosts([...posts, { id: Date.now(), content: newPost, platform, scheduledTime: 'Not scheduled', status: 'queued' }]);
    setNewPost('');
  };

  const deletePost = (id: number) => setPosts(posts.filter(p => p.id !== id));

  const moveToScheduled = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: 'scheduled' } : p));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>📋 Content Queue</h2>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's on your mind?" style={{ flex: 1, background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' }} />
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '150px', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' }}>
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>Twitter/X</option>
          </select>
          <button onClick={addPost} style={{ padding: '14px 24px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Add to Queue</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post) => (
            <div key={post.id} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{post.content}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{post.platform} · {post.scheduledTime}</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: post.status === 'scheduled' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', color: post.status === 'scheduled' ? '#4ade80' : '#fbbf24' }}>
                {post.status}
              </span>
              {post.status === 'queued' && <button onClick={() => moveToScheduled(post.id)} style={{ padding: '6px 12px', background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.3)', borderRadius: '8px', color: '#00ffcc', fontSize: '12px', cursor: 'pointer' }}>Schedule</button>}
              <button onClick={() => deletePost(post.id)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}