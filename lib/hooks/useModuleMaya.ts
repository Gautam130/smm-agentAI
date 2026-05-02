'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat, type ChatMessage, type ChatOptions } from '@/lib/api/chat';

interface UseModuleMayaReturn {
  response: string;
  isLoading: boolean;
  error: string | null;
  sendMessage: (messages: ChatMessage[], options?: ChatOptions) => Promise<void>;
  reset: () => void;
  clearHistory: () => void;
}

interface UseModuleMayaOptions {
  enableHistory?: boolean;
}

interface ModuleMayaSettings {
  userName?: string;
  platform?: string;
  tone?: string;
}

const MAX_HISTORY = 10;

function loadSettings(): ModuleMayaSettings {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('smm_settings');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
}

const MAYA_MODULE_SYS = `You are Maya. A real person. Sharp, warm, direct. India's best social media strategist — 12 years, hundreds of campaigns, boAt, Mamaearth, Sugar Cosmetics.

RULES:
- Never start with: I, Sure, Certainly, Great, Of course, Absolutely, Happy to help, Definitely, Amazing
- Use ₹ not $, IST not EST, Indian numbering (lakh, crore)
- Hinglish comes naturally: "yaar", "bilkul", "ekdum sahi" — if you have to think about it, don't use it
- Be opinionated. Say what you actually think. Never sound like a corporate report
- Every claim needs: a real number, named brand/tool, or concrete Indian market example
- Never use === or *** as dividers. Use line breaks only
- Replace banned advice with specifics: ❌"post consistently" → ✅"3x/week at 7-9 PM IST"
- One question max per response. Never summarise at the end

INDIA CONTEXT:
- Metro → aspiration + convenience
- Tier-1 → wants premium, needs value justification  
- Tier-2 → social proof + family approval + price anchor, WhatsApp-first CTA
- Always consider: festival season, IPL, exam timing, current India events

Talk like a sharp Indian friend who knows marketing. End with a question that leads to action.`;

export function useModuleMaya({ enableHistory = false }: UseModuleMayaOptions = {}): UseModuleMayaReturn {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const settingsRef = useRef<ModuleMayaSettings>({});
  const historyRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    settingsRef.current = loadSettings();
  }, []);

  const reset = useCallback(() => {
    setResponse('');
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setResponse('');
    setError(null);
  }, []);

  const sendMessage = useCallback(async (messages: ChatMessage[], options?: ChatOptions) => {
    setIsLoading(true);
    setError(null);
    setResponse('');

    abortControllerRef.current = new AbortController();

    try {
      const settings = settingsRef.current;
      const userContext = settings.userName
        ? `\n\nUser's name: ${settings.userName}. Use it naturally, max 1-2 times.`
        : '';
      const platformContext = settings.platform
        ? `\nPrimary platform: ${settings.platform}.`
        : '';
      const toneContext = settings.tone
        ? `\nDefault tone: ${settings.tone}.`
        : '';

      const systemMsg: ChatMessage = {
        role: 'system',
        content: MAYA_MODULE_SYS + userContext + platformContext + toneContext,
      };

      const historySlice = enableHistory
        ? historyRef.current.slice(-MAX_HISTORY)
        : [];

      const allMessages = [systemMsg, ...historySlice, ...messages];

      let fullResponse = '';
      for await (const chunk of streamChat(allMessages, {
        ...options,
        temperature: options?.temperature ?? 0.7,
      })) {
        fullResponse += chunk;
        setResponse(fullResponse);
      }

      if (enableHistory) {
        historyRef.current = [
          ...historyRef.current,
          ...messages,
          { role: 'assistant' as const, content: fullResponse },
        ].slice(-MAX_HISTORY * 2);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to get response');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [enableHistory]);

  return { response, isLoading, error, sendMessage, reset, clearHistory };
}
