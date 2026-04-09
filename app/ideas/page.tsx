'use client';

import { useState } from 'react';

interface Idea {
  id: number;
  title: string;
  description: string;
  platform: string;
  category: string;
  status: 'raw' | 'developed' | 'scheduled';
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([
    { id: 1, title: 'Summer collection teaser', description: 'Behind the scenes of our summer shoot', platform: 'Instagram', category: 'Product', status: 'raw' },
    { id: 2, title: 'Customer testimonial series', description: 'Interview top 3 customers', platform: 'LinkedIn', category: 'Social Proof', status: 'developed' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [category, setCategory] = useState('Content');

  const addIdea = () => {
    if (!newTitle.trim()) return;
    setIdeas([...ideas, { id: Date.now(), title: newTitle, description: newDesc, platform: 'Instagram', category, status: 'raw' }]);
    setNewTitle('');
    setNewDesc('');
  };

  const deleteIdea = (id: number) => setIdeas(ideas.filter(i => i.id !== id));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>💡 Idea Bank</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Idea title" style={{ background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none' }}>
              <option>Content</option><option>Product</option><option>Campaign</option><option>Engagement</option>
            </select>
            <button onClick={addIdea} style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Add</button>
          </div>
        </div>
        <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2} style={{ width: '100%', background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', color: '#ffffff', outline: 'none', marginBottom: '20px', resize: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ideas.map((idea) => (
            <div key={idea.id} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{idea.title}</div>
                <button onClick={() => deleteIdea(idea.id)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>🗑️</button>
              </div>
              <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>{idea.description}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11px', background: 'rgba(0,255,204,0.1)', color: '#00ffcc', padding: '2px 8px', borderRadius: '10px' }}>{idea.platform}</span>
                <span style={{ fontSize: '11px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 8px', borderRadius: '10px' }}>{idea.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}