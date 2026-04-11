'use client';

export interface IntentResult {
  isContent: boolean;
  isResearch: boolean;
  isStrategy: boolean;
  isTrend: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEEDS_CLARIFICATION';
  source: 'FALLBACK';
  hasNegation?: boolean;
  scores?: {
    content: number;
    research: number;
    strategy: number;
    trend: number;
  };
}

function detectIntentFallback(query: string): IntentResult {
  const qLower = query.toLowerCase();
  const scores = { content: 0, research: 0, strategy: 0, trend: 0 };

  const negationPatterns = [
    /\b(don't|do not|dont|not |just |only |don't want|not interested in)\b.*\b(write|create|generate|hook|caption|post|content)\b/i,
    /\b(no |don't |not )\b.*\b(hooks?|captions?|posts?)\b/i,
    /\b(only|just)\b.*\b(research|analysis|info)\b/i
  ];
  const hasNegation = negationPatterns.some(p => p.test(qLower));

  if (hasNegation) {
    if (/\b(research|analyse|analyze|info|about|tell me)\b/i.test(qLower)) scores.research += 5;
    if (/\b(strategy|audit|plan|growth)\b/i.test(qLower)) scores.strategy += 5;
  } else {
    if (/\b(write|create|generate|draft|produce|make)\b/.test(qLower)) scores.content += 2;
    if (/\b(caption|hook|reel|post|story|dm|script|thread|carousel|hashtag|copy)\b/.test(qLower)) scores.content += 2;
    if (/\b(viral reel|reel caption|instagram caption|hooks for|captions for|dm flow|content piece)\b/.test(qLower)) scores.content += 3;
    if (/\b(research|analyse|analyze|intel)\b/.test(qLower)) scores.research += 3;
    if (/\b(overview|landscape|brand report|company|industry|market)\b/.test(qLower)) scores.research += 2;
    if (/\b(tell me about|who is|what is|how does|explain)\b/.test(qLower)) scores.research += 1;
    if (qLower === 'about' || qLower === 'about me') scores.research -= 2;
    if (/\b(strategy|audit|diagnose)\b/.test(qLower)) scores.strategy += 3;
    if (/\b(growth|competitor|improve|fix|scale|positioning|gap)\b/.test(qLower)) scores.strategy += 2;
    if (/\b(trend|what.s hot|latest trend|right now|what is working|emerging)\b/.test(qLower)) scores.trend += 3;
  }

  const maxScore = Math.max(scores.content, scores.research, scores.strategy, scores.trend);
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const secondHighest = sortedScores[1] || 0;

  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (maxScore >= 3 && maxScore >= secondHighest * 1.5) confidence = 'HIGH';
  else if (maxScore >= 2 && maxScore > secondHighest) confidence = 'MEDIUM';

  return {
    isContent: maxScore === scores.content && maxScore >= 2,
    isResearch: maxScore === scores.research && maxScore >= 2,
    isStrategy: maxScore === scores.strategy && maxScore >= 2,
    isTrend: maxScore === scores.trend && maxScore >= 2,
    confidence,
    scores,
    hasNegation,
    source: 'FALLBACK'
  };
}

export function detectIntent(query: string): IntentResult {
  return detectIntentFallback(query);
}

export function getTemperature(intentType: IntentResult): number {
  if (intentType.isTrend) return 0.9;
  if (intentType.isContent) return 0.88;
  if (intentType.isStrategy) return 0.45;
  if (intentType.isResearch) return 0.2;
  return 0.4;
}