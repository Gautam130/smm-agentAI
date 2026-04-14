import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { embed } from '../lib/embed';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Generating embeddings...\n');

  // Embed hooks
  const { data: hooks } = await supabase.from('hooks_library').select('id, hook, why, trigger, emotion, timing, industry');
  if (hooks) {
    for (const row of hooks) {
      const text = [row.hook, row.why, row.trigger, row.emotion, row.industry].filter(Boolean).join(' ');
      const embedding = await embed(text);
      await supabase.from('hooks_library').update({ embeddings: embedding }).eq('id', row.id);
      console.log(`✅ Hook: ${row.id}`);
    }
    console.log(`\n📌 Done: ${hooks.length} hooks embedded\n`);
  }

  // Embed insights
  const { data: insights } = await supabase.from('marketing_insights').select('id, topic, insight, data_point, category');
  if (insights) {
    for (const row of insights) {
      const text = [row.topic, row.insight, row.data_point, row.category].filter(Boolean).join(' ');
      const embedding = await embed(text);
      await supabase.from('marketing_insights').update({ embeddings: embedding }).eq('id', row.id);
      console.log(`✅ Insight: ${row.id}`);
    }
    console.log(`\n📌 Done: ${insights.length} insights embedded\n`);
  }

  console.log('🎉 All done!');
}

main().catch(console.error);
