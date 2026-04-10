import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iygglnmsluliwcscaakc.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2dsbm1zbHVsaXdjc2NhYWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNjA1ODksImV4cCI6MjA5MDgzNjU4OX0.iNd_EQqr6UOS5Hx9grnUzC6LnNufNBSndnMOVpiJKbw';
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
};