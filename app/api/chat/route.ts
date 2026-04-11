import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages: baseMessages, temperature = 0.7, maxTokens = 4000, taskType = 'general' } = body;

    const smartMaxTokens = 
      taskType === 'research' ? 6000 :
      taskType === 'strategy' ? 6000 :
      taskType === 'calendar' ? 6000 :
      taskType === 'influencer' ? 5000 :
      taskType === 'content' ? 4000 :
      taskType === 'hooks' ? 3000 :
      taskType === 'chat' ? 3000 :
      taskType === 'intent' ? 500 :
      taskType === 'classify' ? 500 :
      taskType === 'home-search' ? 5000 :
      maxTokens;

    const systemPrompts: Record<string, string> = {
      'home-search': `You are SMM Agent - an AI social media marketing assistant. When user asks about marketing, strategy, trends, or similar topics, respond with ONLY valid JSON in this exact format (no other text):

{
  "intent": "Research|Strategy|Content|Audit|Ideas|General",
  "confidence": "HIGH|MEDIUM|LOW",
  "warnings": ["warning message if any"],
  "sections": [
    { "emoji": "📍", "title": "What's happening right now", "content": "Bullet points with implications" },
    { "emoji": "📊", "title": "The numbers", "content": "Stats with [source] citations" },
    { "emoji": "🧠", "title": "The strategic read", "content": "Analysis with 'The gap:' and 'The uncomfortable truth:' sections" },
    { "emoji": "🚀", "title": "What to do about it", "content": "Timeline: This week → In 30 days → Longer bet → ⚡ Start here today" }
  ],
  "feedback": true
}

For non-marketing questions, respond normally in plain text. Always be helpful and specific.`
    };

    const systemPrompt = systemPrompts[taskType];
    
    const messagesWithSystem = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...baseMessages]
      : baseMessages;

    const GROQ_KEY = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const MISTRAL_KEY = process.env.MISTRAL_API_KEY || process.env.MISTRAL_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    async function streamAIResponse(fetchUrl: string, fetchOptions: RequestInit) {
      const response = await fetch(fetchUrl, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (e) {
            console.error('Stream error:', e);
          }
          controller.close();
        }
      });
      
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 1. Groq with streaming (primary)
    if (GROQ_KEY) {
      try {
        return await streamAIResponse('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messagesWithSystem,
            temperature,
            max_tokens: smartMaxTokens,
            stream: true
          })
        });
      } catch (e: any) {
        console.error('Groq error:', e.message || e);
      }
    }

    // 2. Mistral with streaming
    if (MISTRAL_KEY) {
      try {
        return await streamAIResponse('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_KEY}`
          },
          body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: messagesWithSystem,
            temperature,
            max_tokens: smartMaxTokens,
            stream: true
          })
        });
      } catch (e: any) {
        console.error('Mistral error:', e.message || e);
      }
    }

    // 3. OpenRouter with streaming
    if (OPENROUTER_KEY) {
      try {
        return await streamAIResponse('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'HTTP-Referer': 'https://smm-agent.vercel.app',
            'X-Title': 'SMM Agent'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: messagesWithSystem,
            temperature,
            max_tokens: smartMaxTokens,
            stream: true
          })
        });
      } catch (e: any) {
        console.error('OpenRouter error:', e.message || e);
      }
    }

    // No keys configured
    if (!GROQ_KEY && !MISTRAL_KEY && !OPENROUTER_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'No AI API key configured. Add GROQ_API_KEY to environment variables.' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'All AI providers failed. Please check API keys and try again.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Chat API error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  return new NextResponse(
    JSON.stringify({ status: 'Chat API is running. Use POST to send messages.' }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}