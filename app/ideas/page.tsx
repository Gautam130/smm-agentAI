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
    <>
      <h2 className="module-title">💡 Idea Bank</h2>
      
      <div className="g2 mb-4">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Idea title" className="field" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1 }}>
            <option>Content</option>
            <option>Product</option>
            <option>Campaign</option>
            <option>Engagement</option>
          </select>
          <button onClick={addIdea} className="run-btn btn-yellow">Add</button>
        </div>
      </div>
      <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="field" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        {ideas.map((idea) => (
          <div key={idea.id} className="idea-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{idea.title}</div>
              <button onClick={() => deleteIdea(idea.id)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>🗑️</button>
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>{idea.description}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="tag tag-green">{idea.platform}</span>
              <span className="tag tag-purple">{idea.category}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}