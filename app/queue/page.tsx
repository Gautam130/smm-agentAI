'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadQueuedPosts, createQueuedPost, updateQueuedPost, deleteQueuedPost, type QueuedPost } from '@/lib/crud';
import { useAuth } from '@/lib/auth';

export default function QueuePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<QueuedPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await loadQueuedPosts();
      setPosts(data);
    } catch (e) {
      console.error('[queue] load failed:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const addPost = async () => {
    if (!newPost.trim() || !user) return;
    try {
      const created = await createQueuedPost({ content: newPost, platform, scheduled_time: 'Not scheduled', status: 'queued' });
      setPosts(prev => [created, ...prev]);
      setNewPost('');
    } catch (e) {
      console.error('[queue] add failed:', e);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await deleteQueuedPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('[queue] delete failed:', e);
    }
  };

  const moveToScheduled = async (id: string) => {
    try {
      const updated = await updateQueuedPost(id, { status: 'scheduled' });
      setPosts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (e) {
      console.error('[queue] schedule failed:', e);
    }
  };

  if (!user) {
    return (
      <>
        <h2 className="module-title">Content Queue</h2>
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>Please log in to manage your queue.</div>
      </>
    );
  }

  return (
    <>
      <h2 className="module-title">Content Queue</h2>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's on your mind?" className="field" onKeyDown={(e) => { if (e.key === 'Enter') addPost(); }} />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '150px' }}>
          <option>Instagram</option>
          <option>LinkedIn</option>
          <option>Twitter/X</option>
        </select>
        <button onClick={addPost} className="run-btn" disabled={!newPost.trim()}>Add to Queue</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>Loading...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>No posts queued. Add your first post above.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post) => (
            <div key={post.id} className="post-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{post.content}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{post.platform} · {post.scheduled_time}</div>
              </div>
              <span className={`status-badge ${post.status}`}>{post.status}</span>
              {post.status === 'queued' && <button onClick={() => moveToScheduled(post.id)} className="action-btn-small">Schedule</button>}
              <button onClick={() => deletePost(post.id)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
