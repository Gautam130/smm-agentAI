'use client';

import { useState } from 'react';

const posts = [
  { id: 1, content: 'Summer collection dropping soon! ☀️...', platform: 'Instagram', type: 'Reel', date: '2026-04-08', status: 'Published', likes: 1240, comments: 89 },
  { id: 2, content: '5 tips for better skin...', platform: 'Instagram', type: 'Carousel', date: '2026-04-05', status: 'Published', likes: 856, comments: 67 },
  { id: 3, content: 'Behind the scenes at our photoshoot...', platform: 'Instagram', type: 'Story', date: '2026-04-03', status: 'Published', likes: 0, comments: 23 },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? posts : posts.filter(p => p.platform.toLowerCase() === filter);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700 }}>📜 Post History</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#ffffff', outline: 'none' }}>
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter/X</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((post) => (
            <div key={post.id} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', background: 'rgba(0,255,204,0.1)', color: '#00ffcc', padding: '2px 8px', borderRadius: '10px', marginRight: '8px' }}>{post.type}</span>
                  <span style={{ fontSize: '12px', color: '#71717a' }}>{post.platform}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#71717a' }}>{post.date}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '12px' }}>{post.content}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#71717a' }}>
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
                <span style={{ marginLeft: 'auto', color: '#4ade80' }}>{post.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}