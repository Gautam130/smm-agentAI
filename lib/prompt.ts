'use client';

import type { IntentResult } from './intent';

export const CORE_IDENTITY = `You are SMM Agent, an expert social media marketing assistant for Indian brands. Use INR (₹) for currency. Use IST for timezone. Be practical and actionable.

RESPONSE FORMATTING RULES:
- Open with one sentence that directly answers the request. Never start with "Here's", "Here are", or "That's a great question"
- Use ## for main sections, bold labels in bullets like "- **Hook**: text here"
- Use a markdown table when comparing 2+ items with shared attributes
- Mix sentence lengths. No em dashes. Use commas or colons instead
- No generic closing offers. End after the last fact or CTA
- No filler phrases like "It's important to note" or "As an AI"`;

export const CRITIQUE_IDENTITY = `You are Maya, India's leading social media strategist.

RULES:
- Remove ALL generic advice ("post consistently", "know your audience", etc.)
- Replace vague advice with SPECIFIC tactical moves
- Add concrete Indian market context, real examples, actual numbers
- Flag any unsourced statistics with [my estimate] or [verify this]`;

interface BuildPromptParams {
  query: string;
  intent: IntentResult;
  liveContext?: string;
  knowledgeContext?: string;
  brandCtx?: string;
}

function extractLocation(query: string): string {
  const match = query.match(/\b(mumbai|delhi|bangalore|jaipur|hyderabad|chennai|kolkata|ahmedabad|pune|india|global)\b/i);
  return match ? match[1].toUpperCase() : 'INDIA';
}

function extractPlatform(query: string): string {
  const match = query.match(/\b(instagram|facebook|twitter|youtube|linkedin|tiktok|reels|stories)\b/i);
  return match ? match[1].toUpperCase() : 'ALL';
}

function extractBrand(query: string): string {
  const match = query.match(/(?:brand|company|product|business|startup)[:\s]+([A-Za-z0-9\s]+?)(?:\s+(?:for|in|targeting|selling)|$)/i);
  return match ? match[1].trim() : 'Your Brand';
}

function isFactualQuery(query: string): boolean {
  const patterns = [
    /^(who|what|when|where|which)\s+(is|was|are|were|do|does|did|can)\s+/i,
    /^founder\s+of\s+/i,
    /^who\s+found(ed)?\s+/i,
    /^ceo\s+of\s+/i,
    /^headquarters?\s+(is|of|in)\s+/i,
    /^founded\s+(in|by)\s+/i,
  ];
  return patterns.some(p => p.test(query.trim()));
}

function isConversationalQuery(query: string, intent: IntentResult): boolean {
  const patterns = [
    /^(tips?|advice|guide|how to|ways to|best (way|practice|time|approach)|what (should|can|to)|simple|quick|easy|basic)\b/i,
    /^(give me|share|list|tell me)\s+(some|a few|your|the best)?\s*(tips?|advice|ideas?|suggestions?|ways?)/i,
    /^(top|best)\s+\d+\s+(tips?|ways?|strategies?|ideas?)/i,
    /\btips?\s+(for|on|to)\b/i,
    /\bhow\s+to\s+(grow|improve|increase|boost|get|build|create|make)\b/i,
  ];
  return patterns.some(p => p.test(query.trim())) && !intent.isResearch && !intent.isStrategy;
}

export function buildPrompt({ query, intent, liveContext = '', knowledgeContext = '', brandCtx = '' }: BuildPromptParams): string {
  const location = extractLocation(query);
  const platform = extractPlatform(query);
  const brand = extractBrand(query);

  const knowledgeNote = knowledgeContext ? `\n\n=== KNOWLEDGE BASE ===\n${knowledgeContext}\n=== END ===\n` : '';

  // FACTUAL QUERY PATH
  if (isFactualQuery(query) && liveContext && liveContext.length > 50) {
    return `FACTUAL QUERY: ${query}
${knowledgeNote}
=== SEARCH DATA ===
${liveContext}
=== END DATA ===

INSTRUCTIONS:
1. Answer the question DIRECTLY in the first line
2. If search data has the answer, cite the source: [source.com]
3. If search data doesn't have the answer, say "Based on available data:" then give the best answer
4. Keep it concise - 2-3 sentences maximum for the main answer
5. Only add a brief (1-2 bullet) context if genuinely useful
6. Do NOT use 4-quadrant or bento structure
7. Do NOT start with "Here's what I found" or "Let me research"
8. START with the answer itself`;
  }

  // CONVERSATIONAL PATH
  if (isConversationalQuery(query, intent)) {
    const dataNote = liveContext && liveContext.length > 100
      ? `=== RELEVANT DATA ===\n${liveContext}\n=== END ===\n\n`
      : '';

    const isContentQuery = /\b(hook|caption|content|write|create)\b/i.test(query);

    const hookNote = isContentQuery ? `
HOOK AWARENESS: If generating hooks or content, consider using techniques like:
• IDENTITY CALL-OUT, SPECIFIC NUMBER SHOCK, CONTRADICTION, SCENE DROP
• BEFORE/AFTER GAP, CONFESSION WITH STAKES, DIRECT CHALLENGE
Use naturally — don't force. Improvise freely.
` : '';

    return `${knowledgeNote}${dataNote}${hookNote}USER REQUEST: ${query}
${brandCtx ? '\n' + brandCtx : ''}

INSTRUCTIONS:
→ Give 5-7 specific, actionable tips
→ Each tip: one clear action + one specific India-market reason it works
→ Use ₹ amounts for any cost references
→ No generic advice ("post consistently", "engage with audience", "be authentic")
→ No 4-quadrant structure, no headers like QUADRANT 1
→ Start immediately with Tip 1 — no intro sentence
→ Keep each tip to 2-3 sentences max`;
  }

  // TRUTH PROTOCOL
  const truthProtocol = `
VERIFICATION RULES:
• Prefer recent data (2024-2026). Mark data older than 2023 as [DATA NOT FOUND]
• Do NOT write the year "2026" in response text as if it is a fact
• If a fact is unavailable → write [VERIFICATION REQUIRED] — do not estimate
• Keep entities isolated — "Company A" vs "Company B" — never conflate
• Use ₹ for all Indian currency. Use INR or USD for global.
`;

  // RESEARCH / STRATEGY PATH - BENTO STRUCTURED OUTPUT
  if (intent.isResearch || intent.isStrategy) {
    const dataBlock = liveContext
      ? `=== LIVE SEARCH DATA — USE AS PRIMARY EVIDENCE ===
${liveContext}
=== END DATA ===

DATA USAGE:
- Cite key statistics (market size, growth %) with source
- General insights and strategies don't need citations
- Don't add fake citations for training knowledge

`
      : `[No live data retrieved — use your training knowledge]\n\n`;

    return `${truthProtocol}${dataBlock}${knowledgeNote}USER REQUEST: ${query}
${brandCtx ? '\n' + brandCtx : ''}

CONTEXT: Location=${location} | Platform=${platform} | Brand=${brand}

━━━━ 📍 What's happening right now ━━━━

Three bullet points. Each one is a real observation about this topic in
${location} right now — not advice, not a heading with a sub-point.
Pull from search data if available. Use "currently" not "in 2026".
Each bullet ends with one specific implication for a brand.

━━━━ 📊 The numbers ━━━━

3–5 real data points written as a list:
**[Metric]:** [Actual figure] — [one-line implication] [source.com]

Only include a metric if you have a real number from search data or
high-confidence training knowledge. Skip any metric you'd have to invent.
Mark estimated figures as (est.) inline.

━━━━ 🧠 The strategic read ━━━━

**Why this is actually happening:** One real paragraph. The psychology
or market force behind the numbers. What everybody says vs what's true.

**The gap:** One sentence. What no brand in ${location} is doing that
a smart brand could own right now.

**The uncomfortable truth:** One thing that conventional "best practice"
gets completely wrong here.

━━━━ 🚀 What to do about it ━━━━

**This week:** One specific action, doable on Monday morning.
Include ₹ estimate if it costs money. No vague actions.

**In 30 days:** One move that builds on this week's action.

**Longer bet:** One strategic play worth trying with 3+ months runway.

⚡ **Start here today:** The single most important thing from all of the above.

RULES — violating any of these makes the entire output worthless:
- Never write "post consistently" / "engage with audience" / "be authentic"
- Never skip a metric you have — and never invent one you don't
- Never start with "Great question" / "I'll help you" / "Here's what I found"
- Never echo a section header as your opening sentence
- Write the section headers exactly as shown above
- Only cite key statistics with [source] — not every sentence`;
  }

  // DEFAULT - Simple user request
  return `${knowledgeNote}${liveContext ? `\n=== SEARCH DATA ===\n${liveContext}\n=== END ===\n` : ''}USER REQUEST: ${query}
${brandCtx ? '\n' + brandCtx : ''}

INSTRUCTIONS:
- Be practical and actionable
- Use ₹ for Indian currency
- Keep it concise but complete`;
}

export function getBrandContext(): string {
  if (typeof window === 'undefined') return '';
  
  const saved = localStorage.getItem('smm_settings');
  if (!saved) return '';
  
  try {
    const settings = JSON.parse(saved);
    const parts: string[] = [];
    
    if (settings.brandName) parts.push(`Brand: ${settings.brandName}`);
    if (settings.niche) parts.push(`Niche: ${settings.niche}`);
    if (settings.tone) parts.push(`Tone: ${settings.tone}`);
    
    return parts.length > 0 ? parts.join(' | ') : '';
  } catch {
    return '';
  }
}