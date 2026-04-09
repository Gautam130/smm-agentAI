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
    <>
      <h2 className="module-title">⏰ Schedule Posts</h2>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="field"
        />
        <button onClick={addPost} className="run-btn">Add Post</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post) => (
          <div key={post.id} className="post-row">
            <div>
              <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{post.content}</div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>{post.platform} · {post.time}</div>
            </div>
            <span className={`status-badge ${post.status}`}>
              {post.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}