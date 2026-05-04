import { getSupabase } from '@/lib/supabase';

export interface QueuedPost {
  id: string;
  user_id: string;
  content: string;
  platform: string;
  scheduled_time: string;
  status: 'queued' | 'scheduled';
  created_at: string;
}

export interface ClientRecord {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  niche: string;
  posts: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface IdeaRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  platform: string;
  category: string;
  status: 'raw' | 'developed' | 'scheduled';
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  platform: string;
  time: string;
  status: 'scheduled' | 'published';
  created_at: string;
}

async function getUserIdOrThrow(): Promise<string> {
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user.id;
}

// Queue CRUD
export async function loadQueuedPosts(): Promise<QueuedPost[]> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('content_queue')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createQueuedPost(post: { content: string; platform: string; scheduled_time?: string; status?: 'queued' | 'scheduled' }): Promise<QueuedPost> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('content_queue')
    .insert({ user_id: userId, ...post })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateQueuedPost(id: string, updates: Partial<QueuedPost>): Promise<QueuedPost> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('content_queue')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQueuedPost(id: string): Promise<void> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { error } = await supabase
    .from('content_queue')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// Clients CRUD
export async function loadClients(): Promise<ClientRecord[]> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createClient(client: { name: string; platform?: string; niche?: string; posts?: number; status?: 'active' | 'inactive' }): Promise<ClientRecord> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('clients')
    .insert({ user_id: userId, ...client })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Partial<ClientRecord>): Promise<ClientRecord> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClientRecord(id: string): Promise<void> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// Ideas CRUD
export async function loadIdeas(): Promise<IdeaRecord[]> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createIdea(idea: { title: string; description?: string; platform?: string; category?: string; status?: 'raw' | 'developed' | 'scheduled' }): Promise<IdeaRecord> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('ideas')
    .insert({ user_id: userId, ...idea })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateIdea(id: string, updates: Partial<IdeaRecord>): Promise<IdeaRecord> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('ideas')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIdeaRecord(id: string): Promise<void> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// Schedule CRUD
export async function loadScheduledPosts(): Promise<ScheduledPost[]> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createScheduledPost(post: { content: string; platform?: string; time?: string; status?: 'scheduled' | 'published' }): Promise<ScheduledPost> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert({ user_id: userId, ...post })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateScheduledPost(id: string, updates: Partial<ScheduledPost>): Promise<ScheduledPost> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('scheduled_posts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteScheduledPost(id: string): Promise<void> {
  const userId = await getUserIdOrThrow();
  const supabase = getSupabase();
  const { error } = await supabase
    .from('scheduled_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
