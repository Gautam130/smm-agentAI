'use client';

import { useState } from 'react';

const posts = [
  { id: 1, content: 'Summer collection dropping soon! ☀️', platform: 'Instagram', type: 'Reel', date: '2026-04-08', status: 'Published', likes: 1240, comments: 89 },
  { id: 2, content: '5 tips for better skin', platform: 'Instagram', type: 'Carousel', date: '2026-04-05', status: 'Published', likes: 856, comments: 67 },
  { id: 3, content: 'Behind the scenes at our photoshoot', platform: 'Instagram', type: 'Story', date: '2026-04-03', status: 'Published', likes: 0, comments: 23 },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? posts : posts.filter(p => p.platform.toLowerCase() === filter);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="module-title">📜 Post History</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Platforms</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter/X</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((post) => (
          <div key={post.id} className="post-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{post.content}</div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>{post.platform} · {post.type} · {post.date}</div>
            </div>
            <span className="status-badge published">Published</span>
          </div>
        ))}
      </div>
    </>
  );
}