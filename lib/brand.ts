'use client';

export interface BrandContext {
  name: string;
  platform: string;
  tone: string;
  niche: string;
}

export function getBrandContextFromSettings(): BrandContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('smm_settings');
    if (!raw) return null;
    const settings = JSON.parse(raw);
    if (!settings.userName && !settings.platform && !settings.tone) return null;
    return {
      name: settings.userName || '',
      platform: settings.platform || '',
      tone: settings.tone || '',
      niche: settings.niche || '',
    };
  } catch {
    return null;
  }
}

export function formatBrandContext(ctx: BrandContext | null): string {
  if (!ctx) return '';
  const parts: string[] = ['[BRAND CONTEXT]'];
  if (ctx.name) parts.push(`Brand: ${ctx.name}`);
  if (ctx.platform) parts.push(`Primary Platform: ${ctx.platform}`);
  if (ctx.tone) parts.push(`Preferred Tone: ${ctx.tone}`);
  if (ctx.niche) parts.push(`Niche: ${ctx.niche}`);
  return parts.join('\n');
}
