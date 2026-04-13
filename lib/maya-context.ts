import { getSupabase } from './supabase';

export interface Hook {
  id: string;
  hook_text: string;
  industry?: string;
  emotion?: string;
  platform?: string;
}

export interface Insight {
  id: string;
  category: string;
  title: string;
  content: string;
}

const INDUSTRIES = [
  'D2C Ecommerce',
  'Food & Restaurant',
  'Fashion & Clothing',
  'Beauty & Skincare',
  'Finance & Investment',
  'Real Estate',
  'Education & Edtech',
  'Health & Fitness',
  'Travel',
  'Jewellery',
] as const;

const CATEGORIES = [
  'format',
  'audience',
  'platform',
  'india_market',
  'glossary',
] as const;

export type Industry = typeof INDUSTRIES[number] | 'general';
export type Category = typeof CATEGORIES[number];

export async function fetchHooks(industry?: string, emotion?: string, limit = 5): Promise<string[]> {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from('hooks')
      .select('hook_text')
      .limit(limit);

    if (industry && industry !== 'general') {
      query = query.eq('industry', industry);
    }
    if (emotion) {
      query = query.eq('emotion', emotion);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((h: Hook) => h.hook_text);
    }
    
    // If no specific results, get random hooks
    const { data: randomData } = await supabase
      .from('hooks')
      .select('hook_text')
      .limit(limit);
    
    return randomData?.map((h: Hook) => h.hook_text) || [];
  } catch (e) {
    console.warn('Failed to fetch hooks:', e);
    return [];
  }
}

export async function fetchInsights(category?: string, limit = 3): Promise<string[]> {
  try {
    const supabase = getSupabase();
    let query = supabase
      .from('insights')
      .select('title, content')
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((i: Insight) => `${i.title}: ${i.content}`);
    }
    
    return [];
  } catch (e) {
    console.warn('Failed to fetch insights:', e);
    return [];
  }
}

export function detectIndustry(message: string): string {
  const msg = message.toLowerCase();
  
  const industryKeywords: Record<string, string[]> = {
    'D2C Ecommerce': ['ecommerce', 'e-commerce', 'd2c', 'online store', 'shop', 'selling online', 'direct to consumer', 'brand store'],
    'Food & Restaurant': ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'biryani', 'coffee', 'tea', 'cloud kitchen', 'delivery', 'zomato', 'swiggy', 'restaurant'],
    'Fashion & Clothing': ['fashion', 'clothing', 'apparel', 'saree', 'kurta', 'jeans', 'dress', 'ethnic wear', 'western wear', 'ootd', 'style', 'clothing brand'],
    'Beauty & Skincare': ['beauty', 'skincare', 'cosmetics', 'makeup', 'haircare', 'serum', 'moisturizer', 'skincare brand', 'beauty brand', 'mamaearth', 'sugar cosmetics'],
    'Finance & Investment': ['finance', 'investment', 'stock market', 'mutual fund', 'crypto', 'trading', 'sip', 'returns', 'financial', 'money', 'wealth'],
    'Real Estate': ['real estate', 'property', 'home', 'apartment', 'flat', 'builder', 'housing', 'rent', 'buy property', 'investment property'],
    'Education & Edtech': ['education', 'edtech', 'course', 'learning', 'online course', 'coaching', 'tutor', 'study', 'exam', 'ielts', 'upsc', 'jee'],
    'Health & Fitness': ['fitness', 'gym', 'health', 'workout', 'yoga', 'protein', 'supplement', 'diet', 'weight loss', 'muscle', 'fitness brand'],
    'Travel': ['travel', 'trip', 'vacation', 'holiday', 'tourism', 'hotel', 'flight', 'destination', 'beach', 'tour', 'backpacking'],
    'Jewellery': ['jewellery', 'jewelry', 'gold', 'diamond', 'ring', 'necklace', 'bangles', 'wedding', 'bridal', 'kundan', 'meenakari'],
  };
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => msg.includes(keyword))) {
      return industry;
    }
  }
  
  return 'general';
}

export function detectCategory(message: string): string {
  const msg = message.toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    'format': ['format', 'type of post', 'what to post', 'content type', 'reel', 'story', 'carousel', 'video', 'caption format', 'content format'],
    'audience': ['audience', 'target', 'who should', 'whom', 'demographic', 'customer', 'viewer', 'segment', 'persona', 'customer profile'],
    'platform': ['platform', 'instagram', 'youtube', 'linkedin', 'twitter', 'facebook', 'where to post', 'which platform', 'social media platform'],
    'glossary': ['what is', 'define', 'meaning of', 'explain', 'terminology', 'glossary', 'what does', 'roas', 'cpm', 'ctr', 'engagement'],
    'india_market': ['india', 'indian', 'rupees', 'inr', '₹', 'hindi', 'hinglish', 'diwali', 'festive', 'local', 'tier 1', 'tier 2', 'metro', 'desi'],
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => msg.includes(keyword))) {
      return category;
    }
  }
  
  return 'india_market';
}

export async function buildMayaPrompt(message: string): Promise<string> {
  const industry = detectIndustry(message);
  const category = detectCategory(message);
  
  const hooks = await fetchHooks(industry, undefined, 5);
  const insights = await fetchInsights(category, 3);
  
  const hooksSection = hooks.length > 0 
    ? `\n\nRelevant hooks for this query:\n${hooks.map(h => `• ${h}`).join('\n')}`
    : '';
  
  const insightsSection = insights.length > 0
    ? `\n\nRelevant market insights:\n${insights.map(i => `• ${i}`).join('\n')}`
    : '';
  
  const dataSection = (hooksSection || insightsSection)
    ? `${hooksSection}${insightsSection}\n\nUse the above data to back your answers with real numbers and proven hooks.`
    : '';
  
  return `You are Maya, India's smartest AI social media strategist. You specialize in Indian markets, Hinglish content, D2C brands, and helping SMM agencies grow their clients. Always give specific, actionable advice with Indian context. Never give generic answers.${dataSection}`;
}
