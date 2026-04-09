'use client';

import { useState } from 'react';

interface ScheduledPost {
  id: number;
  content: string;
  platform: string;
  time: string;
  status: 'scheduled' | 'published';
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([
    { id: 1, content: 'New summer collection launching soon!', platform: 'Instagram', time: 'Today, 6PM', status: 'scheduled' },
    { id: 2, content: 'Behind the scenes of our photoshoot', platform: 'Instagram', time: 'Tomorrow, 12PM', status: 'scheduled' },
    { id: 3, content: 'Customer review spotlight', platform: 'LinkedIn', time: 'Feb 15, 9AM', status: 'scheduled' },
  ]);
  const [newPost, setNewPost] = useState('');

  const addPost = () => {
    if (!newPost.trim()) return;
    setPosts([...posts, { id: Date.now(), content: newPost, platform: 'Instagram', time: 'Not scheduled', status: 'scheduled' }]);
    setNewPost('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>
          ⏰ Schedule Posts
        </h2>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              flex: 1,
              background: '#111111',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
              color: '#ffffff',
              outline: 'none',
            }}
          />
          <button
            onClick={addPost}
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)',
              color: '#080808',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Add Post
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{post.content}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{post.platform} · {post.time}</div>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                background: post.status === 'published' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                color: post.status === 'published' ? '#4ade80' : '#fbbf24',
              }}>
                {post.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}