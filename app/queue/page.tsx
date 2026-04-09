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
    <>
      <h2 className="module-title">📋 Content Queue</h2>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's on your mind?" className="field" />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '150px' }}>
          <option>Instagram</option>
          <option>LinkedIn</option>
          <option>Twitter/X</option>
        </select>
        <button onClick={addPost} className="run-btn">Add to Queue</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post) => (
          <div key={post.id} className="post-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{post.content}</div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>{post.platform} · {post.scheduledTime}</div>
            </div>
            <span className={`status-badge ${post.status}`}>
              {post.status}
            </span>
            {post.status === 'queued' && <button onClick={() => moveToScheduled(post.id)} className="action-btn-small">Schedule</button>}
            <button onClick={() => deletePost(post.id)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
          </div>
        ))}
      </div>
    </>
  );
}