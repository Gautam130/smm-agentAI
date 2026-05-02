'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  lastMessage?: string;
  messageCount: number;
}

const PAGE_SIZE = 10;

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-glass)',
      border: '0.5px solid var(--border-glass)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
        <div style={{
          height: '16px',
          width: '60%',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '4px',
        }} />
        <div style={{
          height: '12px',
          width: '50px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '4px',
        }} />
      </div>
      <div style={{
        height: '13px',
        width: '80%',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '4px',
        marginBottom: '12px',
      }} />
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          height: '11px',
          width: '70px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '4px',
        }} />
        <div style={{
          height: '11px',
          width: '50px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '4px',
        }} />
      </div>
    </div>
  );
}

function DeleteModal({
  conversationTitle,
  onConfirm,
  onCancel,
}: {
  conversationTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeSlideIn 0.2s ease',
    }} onClick={onCancel}>
      <div style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: 'var(--shadow-card)',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'var(--head)',
          marginBottom: '12px',
          color: 'var(--text-primary)',
        }}>Delete Conversation</h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          lineHeight: 1.5,
        }}>
          Are you sure you want to delete "<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{conversationTitle}</span>"? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: 'var(--bg-glass)',
              border: '0.5px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadConversations = useCallback(async (reset = false) => {
    if (!user) return;

    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const supabase = getSupabase();
      const currentOffset = reset ? 0 : offset;

      const { data: convs, error: convError, count } = await supabase
        .from('conversations')
        .select('id, title, updated_at, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);

      if (convError) {
        console.error(`[HISTORY LOAD FAILED] ${convError.message} (${convError.code})`);
        setError('Failed to load conversations');
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (!convs || convs.length === 0) {
        setConversations(prev => reset ? [] : prev);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const convIds = convs.map(c => c.id);

      const { data: messages } = await supabase
        .from('chat_messages')
        .select('conversation_id, content, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      const enriched: Conversation[] = convs.map(conv => {
        const convMessages = messages?.filter(m => m.conversation_id === conv.id) || [];
        return {
          id: conv.id,
          title: conv.title || 'Untitled',
          updated_at: conv.updated_at,
          created_at: conv.created_at,
          lastMessage: convMessages[0]?.content?.slice(0, 50) || '',
          messageCount: convMessages.length,
        };
      });

      if (reset) {
        setConversations(enriched);
      } else {
        setConversations(prev => [...prev, ...enriched]);
      }

      setHasMore((count || 0) > currentOffset + PAGE_SIZE);
      if (reset) {
        setOffset(PAGE_SIZE);
      } else {
        setOffset(prev => prev + PAGE_SIZE);
      }
    } catch (e: any) {
      console.error(`[HISTORY EXCEPTION] ${e.message || e}`);
      setError('Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, offset]);

  useEffect(() => {
    if (user) {
      loadConversations(true);
    }
  }, [user, loadConversations]);

  const handleLoadMore = () => {
    loadConversations(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const supabase = getSupabase();

      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', deleteTarget.id);

      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', deleteTarget.id);

      if (deleteError) {
        console.error(`[DELETE FAILED] ${deleteError.message}`);
        return;
      }

      setConversations(prev => prev.filter(c => c.id !== deleteTarget.id));
    } catch (e: any) {
      console.error(`[DELETE EXCEPTION] ${e.message || e}`);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleNavigate = (convId: string) => {
    router.push(`/ask?conversation=${convId}`);
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        Sign in to view your conversation history
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="module-title">💬 Conversation History</h2>
      </div>

      {loading && conversations.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error && conversations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--bg-glass)',
          border: '0.5px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '14px', color: 'var(--red)', marginBottom: '16px' }}>{error}</div>
          <button
            onClick={() => loadConversations(true)}
            style={{
              padding: '10px 24px',
              background: 'var(--bg-glass)',
              border: '0.5px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Retry
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}>
          No conversations yet. Start chatting with Maya to see them here.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleNavigate(conv.id)}
                style={{
                  background: 'var(--bg-glass)',
                  border: '0.5px solid var(--border-glass)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glass-hover)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-glass-hover)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glass)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-glass)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: '40px',
                  }}>
                    {conv.title || 'Untitled'}
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setDeleteTarget(conv);
                    }}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '16px',
                      lineHeight: 1,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.color = 'var(--red)';
                      (e.target as HTMLElement).style.background = 'var(--red-dim)';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.color = 'var(--text-dim)';
                      (e.target as HTMLElement).style.background = 'transparent';
                    }}
                    disabled={deleting}
                    title="Delete conversation"
                  >
                    ×
                  </button>
                </div>

                {conv.lastMessage && (
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginBottom: '10px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {conv.lastMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-dim)' }}>
                  <span>{getRelativeTime(conv.updated_at)}</span>
                  <span>{conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  padding: '12px 32px',
                  background: 'var(--bg-glass)',
                  border: '0.5px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font)',
                  opacity: loadingMore ? 0.6 : 1,
                }}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <DeleteModal
          conversationTitle={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
