'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadIdeas, createIdea, deleteIdeaRecord, type IdeaRecord } from '@/lib/crud';
import { useAuth } from '@/lib/auth';

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [category, setCategory] = useState('Content');
  const [loading, setLoading] = useState(true);

  const loadIdeasList = useCallback(async () => {
    if (!user) return;
    try {
      const data = await loadIdeas();
      setIdeas(data);
    } catch (e) {
      console.error('[ideas] load failed:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadIdeasList(); }, [loadIdeasList]);

  const addIdea = async () => {
    if (!newTitle.trim() || !user) return;
    try {
      const created = await createIdea({ title: newTitle, description: newDesc, platform: 'Instagram', category, status: 'raw' });
      setIdeas(prev => [created, ...prev]);
      setNewTitle('');
      setNewDesc('');
    } catch (e) {
      console.error('[ideas] add failed:', e);
    }
  };

  const deleteIdea = async (id: string) => {
    try {
      await deleteIdeaRecord(id);
      setIdeas(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error('[ideas] delete failed:', e);
    }
  };

  if (!user) {
    return (
      <>
        <h2 className="module-title">Idea Bank</h2>
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>Please log in to manage ideas.</div>
      </>
    );
  }

  return (
    <>
      <h2 className="module-title">Idea Bank</h2>

      <div className="g2 mb-4">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Idea title" className="field" onKeyDown={(e) => { if (e.key === 'Enter') addIdea(); }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1 }}>
            <option>Content</option>
            <option>Product</option>
            <option>Campaign</option>
            <option>Engagement</option>
          </select>
          <button onClick={addIdea} className="run-btn btn-yellow" disabled={!newTitle.trim()}>Add</button>
        </div>
      </div>
      <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="field" />

      {loading ? (
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>Loading...</div>
      ) : ideas.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>No ideas yet. Add your first idea above.</div>
      ) : (
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
      )}
    </>
  );
}
