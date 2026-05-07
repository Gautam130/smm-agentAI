'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useMaya, type ChatMessage } from '@/lib/maya';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const suggestions = [
  'Best Instagram strategy for D2C India',
  '5 hooks for skincare brand India',
  'Research boAt marketing',
  'Diwali campaign 50k budget',
];

type Citation = {
  source: string;
  url?: string;
};

function CitationBadge({ source, url }: { source: string; url?: string }) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 6px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginLeft: '6px',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: url ? 'pointer' : 'default',
  };

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={baseStyle}>
        {source}
      </a>
    );
  }

  return <span style={baseStyle}>{source}</span>;
}

function isLikelySourceName(text: string): boolean {
  if (!text || text.trim() === '') return false;
  const t = text.trim();

  if (t.length > 40) return false;

  const words = t.split(/\s+/);
  if (words.length > 5 || words.length === 0) return false;

  // Each word must start with uppercase OR be a common connector word
  const connectors = new Set(['of', 'and', 'the', 'in', 'for', 'to', 'at', 'by', 'on', 'or', 'nor', 'but']);
  for (const w of words) {
    if (!w) return false;
    if (connectors.has(w.toLowerCase())) continue;
    if (!/^[A-Z]/.test(w)) return false;
  }

  // No punctuation at end
  if (/[.,;:!?]$/.test(t)) return false;

  // Not a pure number
  if (/^\d+$/.test(t)) return false;

  // Not a common non-source phrase
  const lower = t.toLowerCase();
  const skipPatterns = [
    /^the /, /^a /, /^an /, /^this /, /^that /, /^these /, /^those /,
    /^for example/, /^in conclusion/, /^in summary/, /^for instance/,
    /^note that/, /^see also/, /^read more/,
  ];
  if (skipPatterns.some(p => p.test(lower))) return false;

  return true;
}

function fixNumberedListRestarts(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let highestNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const numberedMatch = line.match(/^(\d+)\.\s/);

    if (numberedMatch) {
      const num = parseInt(numberedMatch[1], 10);

      if (num === 1 && highestNumber > 0) {
        if (result.length > 0 && result[result.length - 1].trim() !== '') {
          result.push('');
        }
      }

      highestNumber = Math.max(highestNumber, num);
    }

    result.push(line);
  }

  return result.join('\n');
}

function CitationBlock({ text }: { text: string }) {
  if (!text || text.trim() === '') return null;

  const cleanedText = fixNumberedListRestarts(text);

  // TODO: Replace regex parsing with structured
  // citation metadata from Maya API response
  const citationRegex = /\s*\(\s*([A-Z][A-Za-z0-9\s&.]+?)\s*\)\.?\s*/g;

  // Step 1: Process text — replace parenthetical citations with tokens,
  // detect standalone source lines (no parens) and buffer them
  const paras = cleanedText.split('\n');
  const processedLines: string[] = [];
  let lastNonEmptyIndex = -1;
  let pendingCites: string[] = [];

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i].trim();
    if (!p) {
      processedLines.push('');
      continue;
    }

    // Check for parenthetical citation at end of line
    const parenMatch = p.match(/^(.+?)\s*\(\s*([A-Z][A-Za-z0-9\s&.]+?)\s*\)\.?\s*$/);
    if (parenMatch) {
      const [, lineText, source] = parenMatch;
      // First, flush any pending cites to previous line
      if (pendingCites.length > 0 && lastNonEmptyIndex >= 0) {
        const badgeTokens = pendingCites.map(c => ` [BADGE:${c}]`).join('');
        processedLines[lastNonEmptyIndex] = processedLines[lastNonEmptyIndex] + badgeTokens;
        pendingCites = [];
      }
      const trimmedText = lineText.trim();
      // Process any remaining inline parenthetical citations
      const withTokens = trimmedText.replace(citationRegex, (_match, src) => {
        return ` [BADGE:${src.trim()}]`;
      });
      processedLines.push(withTokens + ` [BADGE:${source.trim()}]`);
      lastNonEmptyIndex = processedLines.length - 1;
      continue;
    }

    // Check for standalone parenthetical citation on its own line: "(Inc42)"
    const standaloneParenMatch = p.match(/^\(\s*([A-Z][A-Za-z0-9\s&.]+?)\s*\)\.?\s*$/);
    if (standaloneParenMatch) {
      pendingCites.push(standaloneParenMatch[1].trim());
      continue;
    }

    // Check for standalone line that is ONLY a citation (no parens)
    // e.g. "Counterpoint Research" on its own line
    if (isLikelySourceName(p) && lastNonEmptyIndex >= 0) {
      pendingCites.push(p);
      continue;
    }

    // Regular line — flush pending cites to previous line, then process inline
    let output = p;

    if (pendingCites.length > 0 && lastNonEmptyIndex >= 0) {
      const badgeTokens = pendingCites.map(c => ` [BADGE:${c}]`).join('');
      processedLines[lastNonEmptyIndex] = processedLines[lastNonEmptyIndex] + badgeTokens;
      pendingCites = [];
    }

    // Replace any remaining inline parenthetical citations
    output = output.replace(citationRegex, (_match, source) => {
      return ` [BADGE:${source.trim()}]`;
    });

    processedLines.push(output);
    lastNonEmptyIndex = processedLines.length - 1;
  }

  // Handle trailing standalone citations (attach to last non-empty line)
  if (pendingCites.length > 0 && lastNonEmptyIndex >= 0) {
    const badgeTokens = pendingCites.map(c => ` [BADGE:${c}]`).join('');
    processedLines[lastNonEmptyIndex] = processedLines[lastNonEmptyIndex] + badgeTokens;
  }

  // Step 2: Render each line, converting [BADGE:X] tokens to CitationBadge components
  const badgeTokenRegex = /\[BADGE:([^\]]+)\]/g;

  // Prevent ReactMarkdown from wrapping text in <p> blocks — must stay inline
  const InlineMarkdown = ({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) => <>{children}</>;

  const renderLine = (line: string, key: number) => {
    if (!line.trim()) return <br key={key} />;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let partKey = 0;

    // Reset regex state
    badgeTokenRegex.lastIndex = 0;

    while ((match = badgeTokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = line.slice(lastIndex, match.index);
        if (textBefore) {
          parts.push(<ReactMarkdown key={partKey++} rehypePlugins={[rehypeSanitize]} components={{ p: InlineMarkdown }}>{textBefore}</ReactMarkdown>);
        }
      }
      parts.push(<CitationBadge key={partKey++} source={match[1]} />);
      lastIndex = match.index + match[0].length;
    }

    const remaining = line.slice(lastIndex);
    if (remaining) {
      parts.push(<ReactMarkdown key={partKey++} rehypePlugins={[rehypeSanitize]} components={{ p: InlineMarkdown }}>{remaining}</ReactMarkdown>);
    }

    return (
      <span key={key} style={{ display: 'block', marginBottom: '8px' }}>
        {parts}
      </span>
    );
  };

  return <>{processedLines.map(renderLine)}</>;
}

const StreamingMessage = memo(function StreamingMessage({ text }: { text: string }) {
  return (
    <div className="maya-message">
      <div className="maya-avatar">M</div>
      <div className="maya-text">
        <CitationBlock text={text} />
        <span className="cursor-blink">▋</span>
      </div>
    </div>
  );
});

const CompletedMessage = memo(function CompletedMessage({ message }: { message: ChatMessage }) {
  const getTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div className="bubble-user">
          {message.attachments && message.attachments.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              {message.attachments.map((att: any, idx: number) => (
                <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '11px', marginRight: '4px', marginBottom: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {att.name}
                </div>
              ))}
            </div>
          )}
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{message.text}</ReactMarkdown>
          <div className="chat-time">{getTime()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="maya-message">
      <div className="maya-avatar">M</div>
      <div className="maya-text">
        <CitationBlock text={message.text} />
      </div>
    </div>
  );
}, (prev, next) => prev.message.id === next.message.id && prev.message.text === next.message.text);

interface MessagesListProps {
  messages: ChatMessage[];
  chatRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isSwitching?: boolean;
  streamingText?: string;
  isLoading?: boolean;
  mayaStatus?: string;
}

const MessagesList = memo(function MessagesList({ messages, chatRef, messagesEndRef, isSwitching, streamingText, isLoading, mayaStatus }: MessagesListProps) {
  return (
    <div ref={chatRef} style={{ padding: '20px 24px' }}>
      {isSwitching ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid #333', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        </div>
      ) : messages.length === 0 && !streamingText ? (
        <div style={{ color: '#666', padding: '40px', fontSize: '14px', textAlign: 'center' }}>
          Ask Maya anything about your social media strategy
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '24px' }}>
              <CompletedMessage message={msg} />
            </div>
          ))}
          {streamingText !== undefined && streamingText !== '' && (
            <div style={{ marginBottom: '24px' }}>
              <StreamingMessage text={streamingText} />
            </div>
          )}
          {isLoading && !streamingText && mayaStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #ffffff', 
                borderTopColor: 'transparent', 
                borderRadius: '50%', 
                animation: 'spin 0.7s linear infinite' 
              }} />
              <span style={{ color: '#ffffff', fontSize: '14px', fontStyle: 'italic' }}>
                {mayaStatus}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
});

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

export default function AskMayaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { messages, isLoading, streamingText, sendMessage, clearChat, setMessages, mayaStatus } = useMaya();
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; content?: string; file?: File; previewUrl?: string }[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const plusBtnRef = useRef<HTMLButtonElement>(null);
  const autoSelectRef = useRef(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Store preview URLs for each file
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());
  
  const addFilePreview = (fileName: string, file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrls(prev => new Map(prev).set(fileName, url));
  };
  
  const removeFilePreview = (fileName: string) => {
    setPreviewUrls(prev => {
      const newMap = new Map(prev);
      const url = newMap.get(fileName);
      if (url) URL.revokeObjectURL(url);
      newMap.delete(fileName);
      return newMap;
    });
  };

  // Load conversations from Supabase (only those with messages)
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const supabase = getSupabase();
      
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('id, title, updated_at, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error(`[CONVS LOAD FAILED] ${error.message} (${error.code})`);
        setLoadingConversations(false);
        return;
      }

      if (!convs || convs.length === 0) {
        console.log('[CONVS LOAD] No conversations found');
      } else {
        console.log(`[CONVS LOAD OK] Loaded ${convs.length} conversations`);
      }

      const sortedConvs = [...convs].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setConversations(sortedConvs);
    } catch (e: any) {
      console.error(`[CONVS LOAD EXCEPTION] ${e.message || e}`);
    }
    setLoadingConversations(false);
  }, [user]);

  // Load conversations on mount and user change
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Auto-load conversation from ?conversation=<id> query param
  useEffect(() => {
    if (!user || autoSelectRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conversation');
    if (!convId) return;

    autoSelectRef.current = true;

    const autoSelect = async () => {
      await new Promise(r => setTimeout(r, 500));
      const exists = conversations.find(c => c.id === convId);
      if (exists) {
        handleSelectConversation(convId);
      } else {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('conversations')
          .select('id, title, updated_at, created_at')
          .eq('id', convId)
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setConversations(prev => {
            const found = prev.find(c => c.id === convId);
            if (found) return prev;
            return [data, ...prev];
          });
          handleSelectConversation(convId);
        }
      }
    };

    autoSelect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, conversations]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      const supabase = getSupabase();
      console.log(`[LOAD MESSAGES] Loading for conversation: ${conversationId}`);
      
      const { data, error, status } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`[LOAD FAILED] Status ${status}: ${error.message} (${error.code})`);
        return [];
      }

      if (!data || data.length === 0) {
        console.log(`[LOAD EMPTY] No messages for conversation ${conversationId}`);
        return [];
      }

      const messages = data.map((m: StoredMessage) => ({
        id: crypto.randomUUID(),
        role: m.role as 'user' | 'assistant',
        text: m.content,
        createdAt: m.created_at,
      }));
      
      console.log(`[LOAD OK] Loaded ${messages.length} messages for conversation ${conversationId}`);
      return messages;
    } catch (e: any) {
      console.error(`[LOAD EXCEPTION] ${e.message || e}`);
      return [];
    }
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (firstMessage: string) => {
    if (!user) return null;
    try {
      const supabase = getSupabase();
      const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '');

      console.log(`[CREATE CONVERSATION] Creating for user ${user.id}: "${title}"`);

      const { data, error } = await supabase
        .from('conversations')
        .insert({ 
          user_id: user.id, 
          title 
        })
        .select('id, title, updated_at, created_at')
        .single();

      if (error) {
        console.error(`[CREATE FAILED] ${error.message} (${error.code})`);
        return null;
      }

      if (data) {
        console.log(`[CREATE OK] Conversation created: ${data.id}`);
        setConversations(prev => [data, ...prev]);
        setCurrentConversationId(data.id);
        return data.id;
      }
    } catch (e: any) {
      console.error(`[CREATE EXCEPTION] ${e.message || e}`);
    }
    return null;
  }, [user]);

  // Prune conversations: keep max 30 per user, delete oldest
  const pruneConversations = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabase();
      const { data: allConvs } = await supabase
        .from('conversations')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!allConvs || allConvs.length <= 30) return;

      const toDelete = allConvs.slice(0, allConvs.length - 30);
      const idsToDelete = toDelete.map(c => c.id);

      // Delete messages for those conversations first
      await supabase
        .from('chat_messages')
        .delete()
        .in('conversation_id', idsToDelete);

      // Delete conversations
      await supabase
        .from('conversations')
        .delete()
        .in('id', idsToDelete);

      // Update local state
      setConversations(prev => prev.filter(c => !idsToDelete.includes(c.id)));
    } catch (e) {
      console.warn('Conversation pruning failed:', e);
    }
  }, []);

  // Prune messages: keep only last 50 per conversation
  const pruneMessages = useCallback(async (conversationId: string) => {
    try {
      const supabase = getSupabase();
      const { count } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId);

      if (!count || count <= 50) return;

      const toDelete = count - 50;
      console.log(`[PRUNE] Conversation ${conversationId}: ${count} messages, deleting oldest ${toDelete}`);

      const { data: oldMessages } = await supabase
        .from('chat_messages')
        .select('id, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(toDelete);

      if (oldMessages && oldMessages.length > 0) {
        const idsToDelete = oldMessages.map((m: any) => m.id);
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .in('id', idsToDelete);
        if (error) {
          console.error(`[PRUNE FAILED] ${error.message} (${error.code})`);
        } else {
          console.log(`[PRUNE OK] Deleted ${idsToDelete.length} messages`);
        }
      }
    } catch (e: any) {
      console.warn(`[PRUNE EXCEPTION] ${e.message || e}`);
    }
  }, []);

  // Save message to Supabase
  const saveMessage = useCallback(async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    try {
      const supabase = getSupabase();
      console.log(`[SAVE] ${role} message to conversation ${conversationId} (${content.length} chars)`);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({ 
          conversation_id: conversationId, 
          role, 
          content,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error(`[SAVE FAILED] ${role} message: ${error.message} (${error.code})`);
        // Retry once after 2 seconds
        console.log(`[RETRY] Retrying save for conversation ${conversationId}`);
        await new Promise(r => setTimeout(r, 2000));
        const { error: retryError } = await supabase
          .from('chat_messages')
          .insert({ 
            conversation_id: conversationId, 
            role, 
            content,
            created_at: new Date().toISOString()
          });
        if (retryError) {
          console.error(`[RETRY FAILED] ${retryError.message} (${retryError.code})`);
          return false;
        }
        console.log(`[SAVE OK] ${role} message saved (retry)`);
      } else {
        console.log(`[SAVE OK] ${role} message saved`);
      }
      
      // Update conversation updated_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateError) {
        console.error(`[UPDATE FAILED] Conversation timestamp: ${updateError.message}`);
      }

      // Prune old messages (keep last 50) - don't await, runs in background
      pruneMessages(conversationId);
      return true;
    } catch (e: any) {
      console.error(`[SAVE EXCEPTION] Failed to save ${role} message: ${e.message || e}`);
      return false;
    }
  }, [pruneMessages]);

  // Handle new conversation
  const handleNewChat = () => {
    clearChat();
    setCurrentConversationId(null);
    setInput('');
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversationId: string) => {
    console.log('handleSelectConversation called:', conversationId);
    if (conversationId === currentConversationId) return;
    
    setCurrentConversationId(conversationId);
    setIsSwitching(true);
    console.log('Switching conversation, waiting...');
    
    // Small delay to let Supabase settle after save/prune
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const loadedMessages = await loadMessages(conversationId);
    console.log('Setting messages:', loadedMessages.length);
    setMessages(loadedMessages, conversationId);
    setIsSwitching(false);
    console.log('Conversation switched, isSwitching = false');
    
    // Scroll to bottom after messages load
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Handle delete conversation - show modal
  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setShowDeleteModal(true);
  };

  // Confirm delete conversation
  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    try {
      const supabase = getSupabase();
      
      // Delete messages first, then conversation
      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationToDelete);
      
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete);
      
      setConversations(prev => prev.filter(c => c.id !== conversationToDelete));
      
      if (currentConversationId === conversationToDelete) {
        setCurrentConversationId(null);
        clearChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
    
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  // Cancel delete
  const cancelDeleteConversation = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  // Start editing conversation title
  const startEditingTitle = (conv: Conversation) => {
    setEditingConversationId(conv.id);
    setEditingTitle(conv.title);
  };

  // Save edited title
  const saveEditedTitle = async () => {
    if (!editingConversationId || !editingTitle.trim()) {
      setEditingConversationId(null);
      return;
    }

    try {
      const supabase = getSupabase();
      await supabase
        .from('conversations')
        .update({ title: editingTitle.trim() })
        .eq('id', editingConversationId);

      setConversations(prev => prev.map(c => 
        c.id === editingConversationId ? { ...c, title: editingTitle.trim() } : c
      ));
    } catch (err) {
      console.error('Failed to update title:', err);
    }

    setEditingConversationId(null);
    setEditingTitle('');
  };

  // Handle edit key press
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditedTitle();
    } else if (e.key === 'Escape') {
      setEditingConversationId(null);
      setEditingTitle('');
    }
  };

  // Handle send with Supabase persistence
  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;
    
    const messageToSend = input.trim() || 'Please analyze these files';
    console.log(`[SEND] Message: "${messageToSend.slice(0, 50)}..." (${messageToSend.length} chars)`);
    
    // If no current conversation, create one
    let convId = currentConversationId;
    if (!convId) {
      console.log('[SEND] No conversation, creating new one');
      convId = await createConversation(messageToSend);
    }
    
    // Save user message to Supabase
    if (convId) {
      const saved = await saveMessage(convId, 'user', messageToSend);
      if (!saved) {
        console.warn('[SEND] User message failed to save, continuing anyway');
      }
      // Update conversation title if it's the first message
      const conversation = conversations.find(c => c.id === convId);
      if (conversation && conversation.title.length === 0) {
        const supabase = getSupabase();
        await supabase
          .from('conversations')
          .update({ title: messageToSend.slice(0, 40) + (messageToSend.length > 40 ? '...' : '') })
          .eq('id', convId);
      }
    }
    
    console.log(`[SEND] Sending to Maya, conversation: ${convId}`);
    // Get the response from Maya (knowledge injection is handled inside sendMessage)
    sendMessage(messageToSend, attachedFiles, convId, (conversationId, role, text) => {
      console.log(`[SEND] Assistant response ready (${text.length} chars), saving...`);
      saveMessage(conversationId, role as 'user' | 'assistant', text);
    });
    setInput('');
    setAttachedFiles([]);
    
    // Clean up preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(new Map());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput((prev) => prev + transcript);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.log('Voice error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!showAttachMenu) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dropdown = document.querySelector('.attach-dropdown');
      
      if (dropdown && !dropdown.contains(target) && plusBtnRef.current && !plusBtnRef.current.contains(target)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showAttachMenu]);

  // Delete modal escape key and outside click handler
  useEffect(() => {
    if (!showDeleteModal) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDeleteConversation();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      const modal = document.querySelector('.delete-modal');
      if (modal && !modal.contains(e.target as Node)) {
        cancelDeleteConversation();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showDeleteModal]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large — max 10MB supported');
      return;
    }

    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    if (attachedFiles.some(f => f.name === file.name && f.size === fileSize)) {
      alert('File already attached');
      return;
    }

    if (attachedFiles.length >= 2) {
      alert('Maximum 2 files allowed');
      return;
    }

    let fileContent = '';
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
    const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(file.name);
    const isCSV = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain';
    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';

    if (isImage) {
      try {
        fileContent = `[Analyzing image: ${file.name}...`;
        const Tesseract = await import('tesseract.js');

        const result = await Tesseract.recognize(file, 'eng+hin', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pct = Math.round(m.progress * 100);
              setOcrProgress(`Extracting text: ${pct}%`);
            }
          }
        });

        setOcrProgress(null);
        const extractedText = result.data.text.trim();
        if (extractedText) {
          fileContent = `=== IMAGE TEXT (OCR) ===\n${file.name}\n\n${extractedText.substring(0, 15000)}\n=== END OCR ===`;
        } else {
          fileContent = `[Image: ${file.name} - No text detected in image]`;
        }
      } catch (err: any) {
        console.error('OCR error:', err);
        fileContent = `[Image: ${file.name} - Could not extract text: ${err.message}]`;
      }
    } else if (isPDF) {
      try {
        const pdfjs = await import('pdfjs-dist');

        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        const maxPages = Math.min(pdf.numPages, 20);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          try {
            const textContent = await page.getTextContent();
            if (!textContent?.items?.length) continue;
            
            const pageText = textContent.items
              .map((item: any) => typeof item.str === 'string' ? item.str : '')
              .filter((s: string) => s.trim())
              .join(' ');
            if (pageText.trim()) {
              fullText += pageText + '\n\n';
            }
          } catch (pageErr) {
            console.warn(`Failed to extract text from page ${i}:`, pageErr);
          }
        }

        if (fullText.trim()) {
          fileContent = `=== PDF CONTENT ===\n${file.name}\n\n${fullText.substring(0, 15000)}\n=== END PDF ===`;
        } else {
          fileContent = `[PDF: ${file.name} — scanned/image-only, no text layer]`;
        }
      } catch (err: any) {
        console.error('PDF parse error:', err);
        fileContent = `[PDF: ${file.name} — could not parse]`;
      }
    } else if (isDocx) {
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim()) {
          fileContent = result.value.substring(0, 15000);
        } else {
          fileContent = `[Word document - ${file.name} - No text content found]`;
        }
      } catch (err: any) {
        console.error('DOCX parse error:', err);
        fileContent = `[Word document - ${file.name} - Parse error: ${err.message}]`;
      }
    } else if (isExcel) {
      try {
        const XLSX = await import('xlsx');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false, defval: '' }) as string[][];
        const limitedRows = rows.slice(0, 500);
        const limitedCSV = limitedRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        if (limitedCSV.trim()) {
          fileContent = `=== EXCEL DATA ===\n${file.name}\nSheet: ${workbook.SheetNames[0]} (first 500 rows)\n\n${limitedCSV.substring(0, 15000)}\n=== END EXCEL DATA ===`;
        } else {
          fileContent = `[Excel file - ${file.name} - No data found]`;
        }
      } catch (err: any) {
        console.error('Excel parse error:', err);
        fileContent = `[Excel file - ${file.name} - Parse error: ${err.message}]`;
      }
    } else if (isCSV) {
      try {
        const text = await file.text();
        if (text.trim()) {
          fileContent = `=== CSV DATA ===\n${file.name}\n\n${text.substring(0, 15000)}\n=== END CSV DATA ===`;
        } else {
          fileContent = `[CSV file - ${file.name} - Empty file]`;
        }
      } catch (err: any) {
        console.error('CSV read error:', err);
        fileContent = `[CSV file - ${file.name} - Read error: ${err.message}]`;
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      try {
        const text = await file.text();
        fileContent = text.substring(0, 15000);
      } catch (err) {
        console.log('Could not read file:', err);
        fileContent = `[File: ${file.name}]`;
      }
    } else {
      fileContent = `[File: ${file.name}]`;
    }
    
    const newFile = { 
      name: file.name, 
      size: (file.size / 1024).toFixed(1) + ' KB',
      content: fileContent,
      file: file
    };
    
    setAttachedFiles(prev => [...prev, newFile]);
    if (isImage) {
      addFilePreview(file.name, file);
    }
    setShowAttachMenu(false);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice input not supported in this browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.log('Voice start error:', e);
      }
    }
  };

  const removeFile = (index: number) => {
    const file = attachedFiles[index];
    if (file) {
      removeFilePreview(file.name);
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="ask-layout">
      {/* Sidebar */}
      <div className={`ask-sidebar ${sidebarOpen ? 'open' : 'closed'}`} style={{
        width: sidebarOpen ? '280px' : '0px',
        minWidth: sidebarOpen ? '280px' : '0px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      }}>
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <button className="new-chat-btn" onClick={handleNewChat}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                New chat
              </button>
            </div>

            {/* Conversations List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {loadingConversations ? (
                <div className="sidebar-empty">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="sidebar-empty">No conversations yet</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`conv-item ${currentConversationId === conv.id ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredConversationId(conv.id)}
                    onMouseLeave={() => setHoveredConversationId(null)}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      {editingConversationId === conv.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={saveEditedTitle}
                          onKeyDown={handleEditKeyDown}
                          autoFocus
                          style={{
                            width: '100%',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            padding: '4px 8px',
                            outline: 'none',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="conv-item-text">
                            {conv.title || 'New conversation'}
                          </div>
                          <div className="conv-item-meta">
                            {getRelativeTime(conv.updated_at)}
                          </div>
                        </>
                      )}
                    </div>
                    {hoveredConversationId === conv.id && editingConversationId !== conv.id && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditingTitle(conv); }}
                          className="conv-item-delete-btn"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="conv-item-delete-btn"
                        >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* User info */}
            <div className="sidebar-footer">
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--text-inverse)',
                color: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '12px',
              }}>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="conv-item-meta">
                  {user?.email || 'User'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div className="ask-topbar" style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Sidebar Toggle */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="topbar-toggle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <a href="/" className="topbar-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </a>
          <span className="topbar-title">Ask Maya</span>
        </div>

        {/* Suggestions - only show when no messages */}
        <div className="flex-shrink-0 px-4" style={{ display: messages.length === 0 ? 'block' : 'none' }}>
          <div className="topbar-hint">
            Maya remembers this conversation within this session
          </div>
          
          <div className="chat-suggestions mb-3" style={{ padding: '8px 0' }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} className="suggestion-btn">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', padding: '0 16px' }}>
            <MessagesList messages={messages} chatRef={chatRef as React.RefObject<HTMLDivElement | null>} messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement | null>} isSwitching={isSwitching} streamingText={streamingText} isLoading={isLoading} mayaStatus={mayaStatus} />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 pb-4" style={{ padding: '0 16px' }}>
          <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
            <div className={`meta-input-container ${attachedFiles.length > 0 ? 'has-attachments' : ''}`}>
              {attachedFiles.length > 0 && (
                <div className="meta-attachments">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="meta-attachment">
                      {file.name.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i) && previewUrls.get(file.name) ? (
                        <img src={previewUrls.get(file.name)} alt={file.name} />
                      ) : (
                        <div className="meta-file-icon">{file.name.split('.').pop()?.toUpperCase()}</div>
                      )}
                      <span className="meta-file-name">{file.name}</span>
                      <button className="meta-remove-btn" onClick={() => removeFile(idx)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                ref={textareaRef}
                className="meta-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={adjustTextareaHeight}
                placeholder="Ask Maya..."
                rows={1}
              />

              <div className="meta-input-bottom" style={{ position: 'relative' }}>
                <button 
                  ref={plusBtnRef}
                  className="meta-plus-btn"
                  title="Add"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  disabled={attachedFiles.length >= 2}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>

                {showAttachMenu && (
                  <div className="attach-dropdown" style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px' }}>
                    <label className="attach-option">
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                      </svg>
                      Attachment
                    </label>
                    <label className="attach-option">
                      <input type="file" ref={imageInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      Upload Image
                    </label>
                    <button 
                      className="attach-option" 
                      onClick={() => {
                        setShowAttachMenu(false);
                        sendMessage('Generate an image', [], currentConversationId);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                      Generate Image
                    </button>
                    {ocrProgress && (
                      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#00ffcc', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {ocrProgress}
                      </div>
                    )}
                  </div>
                )}

                <div className="meta-right-buttons">
                  <button 
                    className={`meta-voice-btn ${isListening ? 'listening' : ''}`}
                    title={isListening ? 'Stop recording' : 'Voice input'}
                    onClick={toggleVoice}
                  >
                    {isListening ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="2"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                      </svg>
                    )}
                  </button>

                  <button 
                    className="meta-send-btn"
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="19" x2="12" y2="5"></line>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="input-hint" style={{ maxWidth: '680px', margin: '8px auto 0', width: '100%' }}>
            <span>Enter to send • Shift+Enter for new line</span>
            {messages.length > 0 && (
              <button onClick={clearChat} className="clear-chat-btn">Clear chat</button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-title">
              Delete conversation?
            </div>
            <div className="delete-modal-desc">
              This cannot be undone.
            </div>
            <div className="delete-modal-actions">
              <button
                onClick={cancelDeleteConversation}
                className="delete-modal-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                className="delete-modal-btn confirm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
