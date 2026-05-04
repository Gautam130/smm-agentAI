'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SavedItem {
  id: string;
  label: string;
  content: string;
  module: string;
  created_at: string;
}

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('saved_outputs')
        .select('id, label, content, module, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchItems();
  }, [user, fetchItems]);

  const deleteItem = async (id: string) => {
    setDeletingId(id);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('saved_outputs').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (e: any) {
      alert('Failed to delete: ' + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyContent = (content: string, label: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (loading && items.length === 0)) {
    return (
      <>
        <div className="module-title">💾 Saved Outputs</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="saved-item" style={{ opacity: 0.5 }}>
              <div style={{ height: '16px', width: '60%', background: '#27272a', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '40%', background: '#27272a', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="module-title">💾 Saved Outputs</h2>
        <span style={{ fontSize: '12px', color: '#71717a' }}>{items.length} items</span>
      </div>

      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search saved outputs..."
        className="field mb-4"
      />

      {error && (
        <div style={{ padding: '12px', background: '#2d1215', border: '1px solid #5c1a1a', borderRadius: '8px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>
          {error}
          <button onClick={fetchItems} style={{ marginLeft: '12px', background: 'none', border: '1px solid #5c1a1a', color: '#f87171', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
            {searchTerm ? 'No matching outputs found' : items.length === 0 ? 'No saved outputs yet. Generate content and save it from the Content page.' : 'No matching outputs found'}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`saved-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>
                    <span className="tag tag-purple">{item.module}</span>
                    <span style={{ marginLeft: '8px' }}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  style={{ background: 'transparent', border: 'none', color: deletingId === item.id ? '#52525b' : '#71717a', cursor: deletingId === item.id ? 'wait' : 'pointer', fontSize: '16px' }}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? '⏳' : '🗑️'}
                </button>
              </div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.content.substring(0, 100)}...
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <div className="output-wrap">
          <div className="output-header">
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{selectedItem.label}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => copyContent(selectedItem.content, selectedItem.id)} className="copy-output">
                {copyFeedback === selectedItem.id ? '✓ Copied' : '📋 Copy'}
              </button>
              <button onClick={() => setSelectedItem(null)} className="action-btn">✕</button>
            </div>
          </div>
          <div className="output-box">
            {selectedItem.content}
          </div>
        </div>
      )}
    </>
  );
}
