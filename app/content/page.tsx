'use client';

import { useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

type TabType = 'write' | 'hooks' | 'hashtags' | 'thread';
type Stage = 'idle' | 'searching' | 'generating' | 'done';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('write');
  const { user } = useAuth();
  const router = useRouter();

  const [format, setFormat] = useState('Reel caption');
  const [platform, setPlatform] = useState('Instagram');
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Conversational & fun');
  const [variations, setVariations] = useState('1 version');

  const [hookTopic, setHookTopic] = useState('');
  const [hookFormat, setHookFormat] = useState('Reel opening line');
  const [hookNiche, setHookNiche] = useState('');

  const [htNiche, setHtNiche] = useState('');
  const [htPlatform, setHtPlatform] = useState('Instagram');
  const [htTopic, setHtTopic] = useState('');

  const [thPlatform, setThPlatform] = useState('LinkedIn post');
  const [thIndustry, setThIndustry] = useState('');
  const [thTopic, setThTopic] = useState('');
  const [thStyle, setThStyle] = useState('Storytelling (personal experience)');

  const [writeStage, setWriteStage] = useState<Stage>('idle');
  const [hooksStage, setHooksStage] = useState<Stage>('idle');
  const [htStage, setHtStage] = useState<Stage>('idle');
  const [thStage, setThStage] = useState<Stage>('idle');

  const [contentResult, setContentResult] = useState('');
  const [hooksResult, setHooksResult] = useState('');
  const [hashtagsResult, setHashtagsResult] = useState('');
  const [threadResult, setThreadResult] = useState('');

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  }, []);

  const saveOutput = useCallback(async (label: string, content: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    const supabase = getSupabase();
    const { error } = await supabase.from('saved_outputs').insert({
      user_id: user.id,
      label,
      content,
      module: 'content',
    });
    if (!error) {
      alert('Saved!');
    }
  }, [user, router]);

  const tabs = [
    { id: 'write', label: 'Write content' },
    { id: 'hooks', label: '10 hooks' },
    { id: 'hashtags', label: 'Hashtags' },
    { id: 'thread', label: 'LinkedIn / Thread' },
  ] as const;

  const getCurrentResult = () => {
    switch (activeTab) {
      case 'write': return contentResult;
      case 'hooks': return hooksResult;
      case 'hashtags': return hashtagsResult;
      case 'thread': return threadResult;
    }
  };

  const streamFromAPI = useCallback(async (messages: { role: string; content: string }[], temperature: number, taskType: string): Promise<string> => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature, taskType }),
    });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              text += parsed.choices[0].delta.content;
            }
          } catch { /* skip malformed */ }
        }
      }
    }
    return text || 'No response';
  }, []);

  const runWrite = useCallback(async () => {
    if (!topic.trim()) return;
    setContentResult('');
    setWriteStage('searching');

    let hashtagData = '';
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'multi',
          queries: [
            { query: `${niche || topic} trending Instagram hashtags India 2026`, provider: 'exa', maxResults: 8 },
            { query: `${niche || topic} trending Instagram hashtags India 2026`, provider: 'serper', maxResults: 8 },
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const allResults: any[] = [];
        for (const r of (data.results || [])) {
          allResults.push(...(r.results || []));
        }
        if (allResults.length > 0) {
          const snippets = allResults.map((r) => r.snippet).filter(Boolean).join('\n');
          hashtagData = snippets ? `\n\n=== RESEARCHED HASHTAGS ===\n${snippets.substring(0, 1200)}\nUse relevant hashtags from this research in your content.\n` : '';
        }
      }
    } catch { hashtagData = ''; }

    setWriteStage('generating');

    const variationsCount = variations === '1 version' ? 1 : variations === '2 versions (A/B test)' ? 2 : 3;

    const prompt = `You are India's best social media copywriter.
Generate ${variationsCount === 1 ? '1 version' : `${variationsCount} versions`} of ${format} for ${platform}.

TOPIC: ${topic}
NICHE: ${niche || 'D2C India'}
AUDIENCE: ${audience || 'Indian consumers 18-35'}
TONE: ${tone}
${hashtagData}

HOOK TECHNIQUE — pick ONE different technique per variation:
1. IDENTITY CALL-OUT: Name the exact person "Every [specific person] spending [₹ amount]—"
2. SPECIFIC NUMBER SHOCK: Real rupee amounts "₹4,200 spend. ₹1.8 lakh return. Here's the breakdown."
3. CONTRADICTION: Two facts that shouldn't coexist "Posts twice a week. Gets 3x the engagement of daily brands."
4. SCENE DROP: Start mid-action, zero setup "Client DMs me at 11pm. Campaign live in 2 hours. Account just got restricted."
5. BEFORE/AFTER GAP: Show transformation, skip the middle "6 months ago: 180 followers. Today: 52,000. Same product. Same budget."
6. CONFESSION WITH STAKES: Personal admission with real consequences "I gave wrong advice in 2023. Client lost ₹2 lakh. Here's what I missed."
7. DIRECT CHALLENGE: Tell them they're wrong right now "Your Instagram bio is losing 30% of conversions. Here's how I know."

BANNED OPENERS (never start with these):
"Are you tired of" / "In today's post" / "Here's how to" / "Did you know" /
"Hey guys" / "Welcome back" / "Today I'm going to" / "Let me show you"

BANNED PHRASES (never use anywhere in caption):
"post consistently" / "engage with your audience" / "build a community" /
"be authentic" / "high quality content" / "game changer" / "level up"

FOR EACH VARIATION — output in this exact format:

━━━━━━━━━━━━━━━━━
VARIATION [#] — [TECHNIQUE NAME]
━━━━━━━━━━━━━━━━━
🔥 HOOK (first line only — max 15 words — specific, uses stated technique):
[hook]

📝 CAPTION (copy-paste ready — natural breaks, relevant emojis, ends leading to CTA):
[full caption]

⏰ POST AT: [IST window — e.g., "Tuesday 7–9 PM IST" or "Wednesday 12–2 PM IST"]

#️⃣ HASHTAGS:
[25 hashtags: 5 mega 1M+ posts, 10 niche 50k–500k, 5 micro under 50k, 5 branded]

👉 CTA: [One specific action — never "like and follow"]

💡 WHY IT WORKS: [One sentence — the specific psychological trigger]
━━━━━━━━━━━━━━━━━

INDIA-SPECIFIC RULES:
- ₹ always, never $
- IST always, never "local time"
- If Tier-2 audience: lead with value and social proof, not aspiration
- If metro audience: lead with identity and shortcut
- Hinglish only when it sounds like a real WhatsApp message, never translated
- Price-sensitive framing: "₹499 for 30 days" beats "affordable monthly plan"

START immediately with VARIATION 1. No intro sentence.`;

    try {
      const result = await streamFromAPI([{ role: 'user', content: prompt }], 0.7, 'content');
      setContentResult(result);
      setWriteStage('done');
    } catch (e: any) {
      setContentResult(`Error: ${e.message}`);
      setWriteStage('done');
    }
  }, [topic, niche, audience, tone, variations, format, platform, streamFromAPI]);

  const runHooks = useCallback(async () => {
    if (!hookTopic.trim() && !hookNiche.trim()) return;
    setHooksResult('');
    setHooksStage('searching');

    const supabase = getSupabase();
    let libraryHooks = '';
    try {
      const query = hookNiche || hookTopic;
      const { data } = await supabase
        .from('hooks_library')
        .select('hook_text, category, industry')
        .or(`category.ilike.%${query}%,industry.ilike.%${query}%`)
        .limit(10);
      if (data && data.length > 0) {
        libraryHooks = `\n\n=== HOOK TEMPLATES FROM LIBRARY ===\n${data.map((h: any) => `• ${h.hook_text} [${h.category} / ${h.industry}]`).join('\n')}\nUse these as creative inspiration — rewrite and adapt to fit the user's specific context.\n`;
      }
    } catch { libraryHooks = ''; }

    let livePatterns = '';
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'multi',
          queries: [
            { query: `${hookNiche || hookTopic} viral Instagram Reels hooks 2026 India`, provider: 'exa', maxResults: 6 },
            { query: `${hookNiche || hookTopic} viral Instagram Reels hooks 2026 India`, provider: 'serper', maxResults: 6 },
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const allResults: any[] = [];
        for (const r of (data.results || [])) {
          allResults.push(...(r.results || []));
        }
        if (allResults.length > 0) {
          const sources = allResults.map((r) => `${r.title}: ${r.snippet}`).filter(Boolean).join('\n');
          livePatterns = sources ? `\n\n=== LIVE HOOK PATTERNS (from trending content) ===\n${sources.substring(0, 1000)}\n\nUse as INSPIRATION — generate completely NEW hooks that follow similar energy but are NOT copied.\n` : '';
        }
      }
    } catch { livePatterns = ''; }

    setHooksStage('generating');

    const prompt = `You are India's best social media copywriter. Write 10 scroll-stopping opening hooks.

TOPIC: ${hookTopic || hookNiche}
FORMAT: ${hookFormat}
NICHE: ${hookNiche || 'D2C / brand marketing India'}
${libraryHooks}
${livePatterns}

Five elements every hook must have:
SPECIFICITY — "Surat ka textile brand" not "a brand in India"
TENSION — Something wrong, incomplete, or contradictory. No tension = no watch.
IDENTITY MIRROR — They must see themselves in the first 3 words
PATTERN INTERRUPT — Mid-story drop, confession, reversal
EARNED CURIOSITY — The gap must be specific. "Ek cheez jo..." is dead.

10 HOOK TECHNIQUES — USE ONE DIFFERENT TECHNIQUE PER HOOK:

1. IDENTITY CALL-OUT: "If you're a D2C founder spending more than ₹50k/month on ads — stop everything."
2. CONTRARIAN TRUTH: "Your engagement rate doesn't matter. Here's what actually does."
3. SPECIFIC NUMBER SHOCK: "₹7,400 ad spend. 3.2 lakh in sales. Here's exactly what we did."
4. INFORMATION GAP: Start a sentence and don't finish it. "The reason 9 out of 10 Indian brand launches fail in the first 60 days is..."
5. BEFORE/AFTER WITHOUT THE MIDDLE: "6 months ago: 200 followers. Today: 47,000 followers, ₹8L/month."
6. SOCIAL PROOF SPECIFICITY: "The exact content strategy Sugar Cosmetics used to go from 500k to 2M followers."
7. PATTERN INTERRUPT — START MID-STORY: "My client's account just got shadowbanned at 11pm the night before their product launch."
8. THE MISTAKE REVEAL: "I reviewed 200 Indian brand Instagrams last month. 94% make the same mistake."
9. INDIA-SPECIFIC CULTURAL HOOK: "Diwali is 6 weeks away. If your campaign isn't ready, here's what to do in 48 hours."
10. THE DIRECT CHALLENGE: "You're using hashtags wrong. Every Indian brand does. Here's the fix."

OUTPUT FORMAT — FOLLOW EXACTLY:

HOOK [#] — [TECHNIQUE NAME]
[The exact hook line — complete, ready to use]
WHY IT STOPS THE SCROLL: [1 line]
INDIA RELEVANCE: [1 line]
SCROLL-STOP SCORE: [X/10]
BEST FOR: [Reel opening / Caption first line / Story / Carousel]

After all 10:

TOP 3 PICKS:
Best for engagement: Hook # — [1 line]
Best for shares: Hook # — [1 line]
Best for saves: Hook # — [1 line]

WEAKEST HOOK: Hook # — [exact reason]

BANNED OPENERS: "Are you tired of..." / "In today's video..." / "Here's how to..." / "Did you know..." / "Welcome back..." / "Hey guys..."
BANNED PATTERNS: "amazing", "incredible", "game-changing" / vague words / dollar signs (use ₹)
INDIA-SPECIFIC: At least 3 hooks must reference Indian market (₹, cities, Indian brands, festivals). At least 1 for tier-2 city audience. At least 1 references a real Indian brand or platform.

START immediately with HOOK 1. No intro.`;

    try {
      const result = await streamFromAPI([{ role: 'user', content: prompt }], 0.85, 'hooks');
      setHooksResult(result);
      setHooksStage('done');
    } catch (e: any) {
      setHooksResult(`Error: ${e.message}`);
      setHooksStage('done');
    }
  }, [hookTopic, hookNiche, hookFormat, streamFromAPI]);

  const runHashtags = useCallback(async () => {
    if (!htNiche.trim() && !htTopic.trim()) return;
    setHashtagsResult('');
    setHtStage('generating');

    const prompt = `Generate a complete hashtag strategy for ${htNiche || htTopic} on ${htPlatform}.

OUTPUT FORMAT:

## MEGA TAGS (1M+ posts) — for maximum reach
[5 hashtags with estimated Indian post volumes]

## NICHE TAGS (50K-1M) — for targeted reach
[10 hashtags with estimated volumes]

## MICRO TAGS (10K-50K) — for engaged audience
[10 hashtags with estimated volumes]

## COMMUNITY/BRAND TAGS
[5 brand or community hashtags — suggest branded tags for the niche]

## USAGE TIPS
- Best posting time for this niche in India (IST)
- Optimal number of hashtags per ${htPlatform} post
- How to mix mega + niche + micro tags
- Which tags to avoid (oversaturated generic tags)

Volume estimates based on Indian ${htPlatform} trends. All tags prefixed with #.`;

    try {
      const result = await streamFromAPI([{ role: 'user', content: prompt }], 0.5, 'content');
      setHashtagsResult(result);
      setHtStage('done');
    } catch (e: any) {
      setHashtagsResult(`Error: ${e.message}`);
      setHtStage('done');
    }
  }, [htNiche, htTopic, htPlatform, streamFromAPI]);

  const runThread = useCallback(async () => {
    if (!thTopic.trim()) return;
    setThreadResult('');
    setThStage('generating');

    const platformLabel = thPlatform === 'LinkedIn carousel document' ? 'LinkedIn carousel' : thPlatform;

    const prompt = `Write a compelling ${platformLabel} about: ${thTopic}.

INDUSTRY/ROLE: ${thIndustry || 'General'}
STYLE: ${thStyle}

${thPlatform === 'LinkedIn post' || thPlatform === 'LinkedIn carousel document' ? `LINKEDIN BEST PRACTICES:
- Hook in the first line — make it stop-the-scroll
- Use short paragraphs (2-3 lines max)
- Include a clear takeaway or insight
- End with a specific CTA (not "like and follow")
- Add relevant emoji but don't overuse
- Use Hinglish naturally if it fits the voice
- LinkedIn loves: numbers, contrarian takes, personal stories, frameworks` : ''}

${thPlatform === 'Twitter / X thread' ? `TWITTER/X THREAD BEST PRACTICES:
- Tweet 1 (hook): Make it unmissable — question, bold claim, or provocative statement
- Tweets 2-8 (body): Deliver value — tips, insights, breakdown
- Final tweet: CTA + engagement prompt (quote tweet this, reply with your experience)
- Keep each tweet under 250 characters
- Use thread format: "🧵" or "A thread:" in first tweet
- End with a question to drive replies` : ''}

FORMAT: Start with HOOK, then deliver the full post/thread. Make it genuinely valuable — not generic advice. Specific > general always.`;

    try {
      const result = await streamFromAPI([{ role: 'user', content: prompt }], 0.7, 'content');
      setThreadResult(result);
      setThStage('done');
    } catch (e: any) {
      setThreadResult(`Error: ${e.message}`);
      setThStage('done');
    }
  }, [thPlatform, thIndustry, thTopic, thStyle, streamFromAPI]);

  const currentResult = getCurrentResult();

  const getButtonState = () => {
    switch (activeTab) {
      case 'write': return { stage: writeStage, disabled: writeStage !== 'idle' && writeStage !== 'done' };
      case 'hooks': return { stage: hooksStage, disabled: hooksStage !== 'idle' && hooksStage !== 'done' };
      case 'hashtags': return { stage: htStage, disabled: htStage !== 'idle' && htStage !== 'done' };
      case 'thread': return { stage: thStage, disabled: thStage !== 'idle' && thStage !== 'done' };
    }
  };

  const buttonState = getButtonState();

  const getButtonLabel = () => {
    if (activeTab === 'write' && writeStage === 'searching') return '🔍 Researching hashtags...';
    if (activeTab === 'write' && writeStage === 'generating') return '✦ Generating...';
    if (activeTab === 'hooks' && hooksStage === 'searching') return '🔍 Fetching hook library + live trends...';
    if (activeTab === 'hooks' && hooksStage === 'generating') return '✦ Generating...';
    if (activeTab === 'hashtags' && htStage === 'generating') return '✦ Generating...';
    if (activeTab === 'thread' && thStage === 'generating') return '✦ Generating...';
    switch (activeTab) {
      case 'write': return 'Generate content ✦';
      case 'hooks': return 'Generate 10 hooks ✦';
      case 'hashtags': return 'Generate hashtag set ✦';
      case 'thread': return 'Write post ✦';
    }
  };

  const getCurrentResultState = () => {
    switch (activeTab) {
      case 'write': return { result: contentResult, setResult: setContentResult, label: 'Generated Content', stageSetter: setWriteStage };
      case 'hooks': return { result: hooksResult, setResult: setHooksResult, label: '10 Hooks', stageSetter: setHooksStage };
      case 'hashtags': return { result: hashtagsResult, setResult: setHashtagsResult, label: 'Hashtag Set', stageSetter: setHtStage };
      case 'thread': return { result: threadResult, setResult: setThreadResult, label: 'Post / Thread', stageSetter: setThStage };
    }
  };

  const currentState = getCurrentResultState();

  const getCurrentCopyLabel = () => {
    switch (activeTab) {
      case 'write': return 'content';
      case 'hooks': return 'hooks';
      case 'hashtags': return 'hashtags';
      case 'thread': return 'thread';
    }
  };

  return (
    <>
      <div className="stabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`stab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'write' && (
        <>
          <div className="g2">
            <div className="field">
              <label className="lbl">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option>Reel caption</option>
                <option>Carousel script (slide by slide)</option>
                <option>Static post caption</option>
                <option>Story text / poll</option>
                <option>Twitter / X thread</option>
                <option>LinkedIn post</option>
                <option>YouTube description</option>
                <option>Instagram bio</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>Twitter / X</option>
                <option>YouTube</option>
              </select>
            </div>
          </div>
          <div className="g2">
            <div className="field">
              <label className="lbl">Niche / industry</label>
              <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. organic skincare, fitness coaching" />
            </div>
            <div className="field">
              <label className="lbl">Target audience</label>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Indian women 25-35, startup founders" />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Topic / key message</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is this post about? Any specific angle, offer, or CTA?" rows={2} />
          </div>
          <div className="g2">
            <div className="field">
              <label className="lbl">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Conversational &amp; fun</option>
                <option>Professional &amp; authoritative</option>
                <option>Inspirational</option>
                <option>Educational</option>
                <option>Bold &amp; edgy</option>
                <option>Humble &amp; personal</option>
                <option>Hinglish (Hindi + English)</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">Variations</label>
              <select value={variations} onChange={(e) => setVariations(e.target.value)}>
                <option>1 version</option>
                <option>2 versions (A/B test)</option>
                <option>3 versions</option>
              </select>
            </div>
          </div>
          <button className="run-btn" onClick={runWrite} disabled={buttonState.disabled}>
            {getButtonLabel()}
          </button>
          {currentResult && (
            <div className="output-wrap show">
              <div className="output-header">
                <div className="output-label">
                  {currentState.label}
                  <button className="clear-btn" onClick={() => { currentState.setResult(''); currentState.stageSetter('idle'); }}>✕</button>
                </div>
                <div className="output-actions">
                  <button className="save-output-btn" onClick={() => saveOutput(currentState.label, currentResult)}>Save</button>
                  <button className="copy-output" onClick={() => copyToClipboard(currentResult, getCurrentCopyLabel())}>
                    {copyFeedback === getCurrentCopyLabel() ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="output-box">{currentResult}</div>
            </div>
          )}
        </>
      )}

      {activeTab === 'hooks' && (
        <>
          <div className="g2">
            <div className="field">
              <label className="lbl">Topic</label>
              <input value={hookTopic} onChange={(e) => setHookTopic(e.target.value)} placeholder="e.g. why most diets fail after 3 weeks" />
            </div>
            <div className="field">
              <label className="lbl">Format</label>
              <select value={hookFormat} onChange={(e) => setHookFormat(e.target.value)}>
                <option>Reel opening line</option>
                <option>Carousel cover slide</option>
                <option>Post opening sentence</option>
                <option>YouTube title</option>
                <option>Email subject line</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="lbl">Niche</label>
            <input value={hookNiche} onChange={(e) => setHookNiche(e.target.value)} placeholder="e.g. nutrition, personal finance, fashion" />
          </div>
          <button className="run-btn" onClick={runHooks} disabled={buttonState.disabled}>
            {getButtonLabel()}
          </button>
          {currentResult && (
            <div className="output-wrap show">
              <div className="output-header">
                <div className="output-label">
                  {currentState.label}
                  <button className="clear-btn" onClick={() => { currentState.setResult(''); currentState.stageSetter('idle'); }}>✕</button>
                </div>
                <div className="output-actions">
                  <button className="save-output-btn" onClick={() => saveOutput(currentState.label, currentResult)}>Save</button>
                  <button className="copy-output" onClick={() => copyToClipboard(currentResult, getCurrentCopyLabel())}>
                    {copyFeedback === getCurrentCopyLabel() ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="output-box">{currentResult}</div>
            </div>
          )}
        </>
      )}

      {activeTab === 'hashtags' && (
        <>
          <div className="g2">
            <div className="field">
              <label className="lbl">Niche</label>
              <input value={htNiche} onChange={(e) => setHtNiche(e.target.value)} placeholder="e.g. sustainable fashion India" />
            </div>
            <div className="field">
              <label className="lbl">Platform</label>
              <select value={htPlatform} onChange={(e) => setHtPlatform(e.target.value)}>
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>Twitter / X</option>
                <option>TikTok</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="lbl">Post topic</label>
            <input value={htTopic} onChange={(e) => setHtTopic(e.target.value)} placeholder="e.g. new collection launch, styling tips" />
          </div>
          <button className="run-btn" onClick={runHashtags} disabled={buttonState.disabled}>
            {getButtonLabel()}
          </button>
          {currentResult && (
            <div className="output-wrap show">
              <div className="output-header">
                <div className="output-label">
                  {currentState.label}
                  <button className="clear-btn" onClick={() => { currentState.setResult(''); currentState.stageSetter('idle'); }}>✕</button>
                </div>
                <div className="output-actions">
                  <button className="save-output-btn" onClick={() => saveOutput(currentState.label, currentResult)}>Save</button>
                  <button className="copy-output" onClick={() => copyToClipboard(currentResult, getCurrentCopyLabel())}>
                    {copyFeedback === getCurrentCopyLabel() ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="output-box">{currentResult}</div>
            </div>
          )}
        </>
      )}

      {activeTab === 'thread' && (
        <>
          <div className="g2">
            <div className="field">
              <label className="lbl">Platform</label>
              <select value={thPlatform} onChange={(e) => setThPlatform(e.target.value)}>
                <option>LinkedIn post</option>
                <option>Twitter / X thread</option>
                <option>LinkedIn carousel document</option>
              </select>
            </div>
            <div className="field">
              <label className="lbl">Industry / role</label>
              <input value={thIndustry} onChange={(e) => setThIndustry(e.target.value)} placeholder="e.g. SaaS founder, marketing consultant, CA" />
            </div>
          </div>
          <div className="field">
            <label className="lbl">Topic / insight to share</label>
            <textarea value={thTopic} onChange={(e) => setThTopic(e.target.value)} placeholder="e.g. Why I shut down my startup after 2 years — 5 lessons. Or: How I grew from 0 to 10k followers in 90 days." rows={2} />
          </div>
          <div className="field">
            <label className="lbl">Writing style</label>
            <select value={thStyle} onChange={(e) => setThStyle(e.target.value)}>
              <option>Storytelling (personal experience)</option>
              <option>Educational (tips &amp; frameworks)</option>
              <option>Controversial opinion</option>
              <option>Data-driven insights</option>
              <option>Behind-the-scenes</option>
            </select>
          </div>
          <button className="run-btn" onClick={runThread} disabled={buttonState.disabled}>
            {getButtonLabel()}
          </button>
          {currentResult && (
            <div className="output-wrap show">
              <div className="output-header">
                <div className="output-label">
                  {currentState.label}
                  <button className="clear-btn" onClick={() => { currentState.setResult(''); currentState.stageSetter('idle'); }}>✕</button>
                </div>
                <div className="output-actions">
                  <button className="save-output-btn" onClick={() => saveOutput(currentState.label, currentResult)}>Save</button>
                  <button className="copy-output" onClick={() => copyToClipboard(currentResult, getCurrentCopyLabel())}>
                    {copyFeedback === getCurrentCopyLabel() ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="output-box">{currentResult}</div>
            </div>
          )}
        </>
      )}
    </>
  );
}
