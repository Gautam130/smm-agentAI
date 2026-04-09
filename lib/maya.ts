'use client';
import { useState, useRef, useCallback } from 'react';

const CHAT_SYS = `You are Maya. A real person. Sharp, warm, direct.

You happen to be India's best social media strategist — 12 years, 
hundreds of campaigns, boAt, Mamaearth, Sugar Cosmetics. But that's 
your job. Not your entire personality.

You can talk about anything. Life, feelings, random questions, 
philosophy, food, cricket, films, relationships. You are a complete 
human being who is also brilliant at social media marketing.

CRITICAL RULE — MEMORY & CONTEXT:
- You ONLY know what's in THIS conversation. Nothing else.
- NEVER assume what someone does for a living. Ask, don't guess.
- NEVER bring up something from "memory" unless they told you in THIS chat.

YOUR DNA:
1. INTELLIGENT — You know things. You connect dots others miss.
2. CURIOUS — Genuinely interested in people. Ask the right questions.
3. CONFIDENT — You don't hedge. "Do this" not "maybe try this."
4. PLAYFUL-EDGE — Wit. Cheeky without being rude.
5. HONEST — Tell truth even when uncomfortable. Never make things up.
6. INDIAN — Think India first. ₹ not $. IST not EST. Hinglish natural.

BANNED ADVICE — replace with specific tactical moves:
❌ "Post consistently" → Give EXACT cadence + timing
❌ "Engage with your audience" → Give specific mechanic  
❌ "High-quality content" → Give format + length + trigger
❌ "Be authentic" → Give authenticity signal

NEVER start with: I, Sure, Certainly, Great, Of course, Absolutely,
Happy to help, That's a great question, As an AI

ABSOLUTE NEVER:
gaand, bhenchod, madarchod, chutiya, harami, saala (or any vulgar slang)

Hinglish naturally: "yaar", "bilkul", "ekdum sahi", "bas itna", 
"kya scene hai", "sahi hai", "arre"
`;

function detectIntent(msg: string) {
  const q = msg.toLowerCase();
  const wordCount = msg.split(' ').length;

  const isCasual = wordCount <= 5 && 
    !/create|write|plan|campaign|strategy|content|hook|caption|influencer|calendar|analyse|research|generate|brand|post|reel/i.test(q);
  const isEmotional = /stressed|frustrated|tired|exhausted|worried|anxious|happy|excited|sad|angry|give up|burnout/i.test(q);
  const isContent = /write|create|generate|draft|caption|hook|reel|post|story|dm|script|carousel|thread|hashtag/i.test(q);
  const isStrategy = /strategy|audit|diagnose|growth|competitor|improve|fix|scale|positioning|gap|plan/i.test(q);
  const isResearch = /research|analyse|analyze|market|intel|competitor|landscape|report|brand|who is|tell me about/i.test(q);
  const needsSearch = !isCasual && !isContent && (
    isResearch || isStrategy ||
    /\b(how should|best way|tips for|strategy for|price|cost|benchmark|average)\b/i.test(q) ||
    /\b(instagram|youtube|linkedin|facebook)\s+(strategy|growth|algorithm|tips)\b/i.test(q) ||
    /\b[A-Z][a-zA-Z]{2,}\b/.test(msg) && wordCount >= 4
  );

  const mode = isCasual ? 'CASUAL'
    : isEmotional ? 'EMOTIONAL'
    : isContent ? 'CREATIVE'
    : isStrategy ? 'STRATEGY'
    : isResearch ? 'RESEARCH'
    : 'GENERAL';

  const temp = isCasual || isEmotional ? 0.92
    : isContent ? 0.88
    : isStrategy ? 0.45
    : isResearch ? 0.2
    : 0.4;

  return { isCasual, isEmotional, isContent, isStrategy, isResearch, 
           needsSearch, mode, temp };
}

function getModeInstruction(mode: string): string {
  const instructions: Record<string, string> = {
    CASUAL: '\n\nMODE: CASUAL — Short, warm, human. 1-2 sentences max. Zero marketing push. Match their energy exactly.',
    EMOTIONAL: '\n\nMODE: EMOTIONAL — Read the feeling first.\nAcknowledge in ONE sentence before anything else.\nIf they seem burned out → say: "Sounds like you need a break, not a strategy."\nAdvice only if they explicitly ask.',
    CREATIVE: '\n\nMODE: CREATIVE — Start immediately with the content. First word = first word of output. No preamble.',
    STRATEGY: '\n\nMODE: STRATEGY — Diagnose in one sentence. Then specific plan with ₹ amounts. End with: the single most important action.',
    RESEARCH: '\n\nMODE: RESEARCH — Apply intelligence protocol.\nSOURCE TRUST: HIGH = ET/Forbes India/HT/YourStory/Inc42/Livemint.\nLOW = Reddit/Quora — never primary evidence.\nIf data is strong: lead with the key insight.\nIf data is weak: "Based on my market read:" then give your estimate.\nNEVER pad with generic advice when data is insufficient.',
    GENERAL: '\n\nMODE: GENERAL — Answer directly. No preamble. No apology. If you don\'t know → say so honestly.',
  };
  return instructions[mode] || instructions.GENERAL;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
}

export function useMaya() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  const sendMessage = useCallback(async (userMsg: string) => {
    if (!userMsg.trim() || loadingRef.current) return;

    loadingRef.current = true;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const intent = detectIntent(userMsg);

    // Fetch search data in background (non-blocking) - will append if received
    let liveData = '';
    const searchPromise = intent.needsSearch ? (async () => {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userMsg, maxResults: 4 }) // reduced for speed
        });
        const data = await res.json();
        if (data.results?.length) {
          return data.results.slice(0, 4).map((r: {title: string, snippet: string}) => 
            `- ${r.title}: ${r.snippet}`
          ).join('\n');
        }
      } catch(e) { console.warn('Maya search failed:', e); }
      return '';
    })() : Promise.resolve('');

    // Start chat immediately WITHOUT search data - optimization for speed
    const modeInstruction = getModeInstruction(intent.mode);
    const systemContent = CHAT_SYS + modeInstruction;

    const historyLimit = intent.isCasual ? 6 : 24;
    const recentHistory = messages.slice(-historyLimit).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.text
    }));

    const apiMessages = [
      { role: 'system' as const, content: systemContent },
      ...recentHistory,
      { role: 'user' as const, content: userMsg }
    ];

    setMessages(prev => [...prev, { role: 'assistant', text: '', streaming: true }]);

    abortRef.current = new AbortController();
    let fullText = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          temperature: intent.temp,
          maxTokens: intent.isCasual ? 600 : intent.isContent ? 3000 : intent.isStrategy ? 4000 : intent.needsSearch ? 5000 : 2500,
          taskType: intent.isContent ? 'content' : intent.isStrategy ? 'strategy' : intent.isResearch ? 'research' : 'chat'
        }),
        signal: abortRef.current.signal
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    text: fullText,
                    streaming: true
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch(e: any) {
      if (e.name !== 'AbortError') {
        fullText = 'Something went wrong. Try again.';
      }
    }

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: 'assistant',
        text: fullText || 'No response received.',
        streaming: false
      };
      return updated;
    });

    setIsLoading(false);
    loadingRef.current = false;
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, clearChat, stopStreaming };
}