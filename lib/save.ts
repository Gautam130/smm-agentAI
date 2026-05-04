import { getSupabase } from '@/lib/supabase';

interface SaveOutputParams {
  module: string;
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
  userId: string;
}

export async function saveOutput({
  module,
  title,
  content,
  metadata,
  userId,
}: SaveOutputParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const autoTitle = title || content.substring(0, 50).replace(/\n/g, ' ') + (content.length > 50 ? '...' : '');

    const { error } = await supabase.from('saved_outputs').insert({
      user_id: userId,
      label: autoTitle,
      content,
      module,
      metadata: metadata || null,
    });

    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    console.error('[saveOutput]', e);
    return { success: false, error: e.message };
  }
}
