'use client';

export interface HookEntry {
  topic: string;
  platform: string;
  brand: string;
  hooks: string[];
  timestamp: number;
}

const STORAGE_KEY = 'smm_hook_history';

function loadAll(): HookEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(entries: HookEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    // localStorage full — silently fail
  }
}

export function saveHooks(topic: string, platform: string, brand: string, hooks: string[]): void {
  if (!topic || !hooks.length) return;
  const entries = loadAll();
  entries.unshift({
    topic: topic.toLowerCase().trim(),
    platform,
    brand,
    hooks,
    timestamp: Date.now(),
  });
  saveAll(entries);
}

export function getRecentHooks(topic: string, limit = 5): HookEntry[] {
  if (!topic) return [];
  const entries = loadAll();
  const norm = topic.toLowerCase().trim();
  return entries.filter(e => e.topic.includes(norm) || norm.includes(e.topic)).slice(0, limit);
}

export function getAllRecent(limit = 10): string[] {
  const entries = loadAll();
  const all: string[] = [];
  for (const e of entries) {
    all.push(...e.hooks);
  }
  return [...new Set(all)].slice(0, limit);
}

export function clearHookHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
