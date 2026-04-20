import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages: baseMessages, temperature = 0.7, maxTokens = 4000, taskType = 'general', task = 'general' } = body;
    const effectiveTaskType = taskType !== 'general' ? taskType : task;

    const smartMaxTokens = 
      effectiveTaskType === 'research' ? 6000 :
      effectiveTaskType === 'strategy' ? 6000 :
      effectiveTaskType === 'calendar' ? 6000 :
      effectiveTaskType === 'influencer' ? 5000 :
      effectiveTaskType === 'content' ? 4000 :
      effectiveTaskType === 'hooks' ? 3000 :
      effectiveTaskType === 'chat' ? 3000 :
      effectiveTaskType === 'intent' ? 500 :
      effectiveTaskType === 'classify' ? 500 :
      // home-search handled by client-side lib/prompt.ts - tokens set there
      maxTokens;

    const systemPrompts: Record<string, string> = {
      // Note: home-search now handled by client-side lib/prompt.ts
      // This is for other taskTypes that need server-side system prompts
    };

    const systemPrompt = systemPrompts[effectiveTaskType];
    
    const messagesWithSystem = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...baseMessages]
      : baseMessages;

    // Load balancer - picks random Groq key for normal traffic
    const groqKeys = [
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY_2
    ].filter((k): k is string => Boolean(k));
    
    function getGroqKey(): string {
      return groqKeys[Math.floor(Math.random() * groqKeys.length)] || '';
    }

    const MISTRAL_KEY = process.env.MISTRAL_API_KEY || process.env.MISTRAL_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    // Full fallback chain - try each provider until one works
    const providers = [
      { 
        name: 'Groq', 
        key: getGroqKey(), 
        model: 'llama-3.3-70b-versatile',
        url: 'https://api.groq.com/openai/v1/chat/completions'
      },
      { 
        name: 'Mistral', 
        key: MISTRAL_KEY, 
        model: 'mistral-large-latest',
        url: 'https://api.mistral.ai/v1/chat/completions'
      },
      { 
        name: 'OpenRouter', 
        key: OPENROUTER_KEY, 
        model: 'meta-llama/llama-3.3-70b-instruct',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        extraHeaders: { 'HTTP-Referer': 'https://smm-agent.vercel.app', 'X-Title': 'SMM Agent' }
      },
    ].filter(p => p.key);

    // Try providers in order - first success wins
    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider.name}`);
        const response = await streamAIResponse(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.key}`,
            ...(provider.extraHeaders || {})
          },
          body: JSON.stringify({
            model: provider.model,
            messages: messagesWithSystem,
            temperature,
            max_tokens: smartMaxTokens,
            stream: true
          })
        });
        
        // If response is valid, return it
        console.log(`Provider ${provider.name} succeeded`);
        return response;
        
      } catch (e: any) {
        console.warn(`${provider.name} failed:`, e.message || e);
        continue; // Try next provider
      }
    }

    // All providers failed
    return new NextResponse(
      JSON.stringify({ error: 'All AI providers failed. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );

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

    // No keys configured
    if (providers.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'No AI API key configured. Add GROQ_API_KEY to environment variables.' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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