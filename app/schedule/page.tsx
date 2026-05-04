'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadScheduledPosts, createScheduledPost, deleteScheduledPost, type ScheduledPost } from '@/lib/crud';
import { useAuth } from '@/lib/auth';

export default function SchedulePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await loadScheduledPosts();
      setPosts(data);
    } catch (e) {
      console.error('[schedule] load failed:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const addPost = async () => {
    if (!newPost.trim() || !user) return;
    try {
      const created = await createScheduledPost({ content: newPost, platform: 'Instagram', time: 'Not scheduled', status: 'scheduled' });
      setPosts(prev => [created, ...prev]);
      setNewPost('');
    } catch (e) {
      console.error('[schedule] add failed:', e);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await deleteScheduledPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('[schedule] delete failed:', e);
    }
  };

  if (!user) {
    return (
      <>
        <h2 className="module-title">Schedule Posts</h2>
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>Please log in to manage scheduled posts.</div>
      </>
    );
  }

  return (
    <>
      <h2 className="module-title">Schedule Posts</h2>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's on your mind?" className="field" onKeyDown={(e) => { if (e.key === 'Enter') addPost(); }} />
        <button onClick={addPost} className="run-btn" disabled={!newPost.trim()}>Add Post</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px' }}>Loading...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#71717a', padding: '40px', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>No scheduled posts. Add your first post above.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post) => (
            <div key={post.id} className="post-row">
              <div>
                <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{post.content}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{post.platform} · {post.time}</div>
              </div>
              <span className={`status-badge ${post.status}`}>{post.status}</span>
              <button onClick={() => deletePost(post.id)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
