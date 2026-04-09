import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { messages, temperature = 0.7, maxTokens = 4000, provider = 'groq', taskType = 'general' } = await request.json().catch(() => ({}));

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
    maxTokens;

  const GROQ_KEY = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  const MISTRAL_KEY = process.env.MISTRAL_API_KEY || process.env.MISTRAL_KEY;
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if ((provider === 'groq' || !provider) && GROQ_KEY) {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages,
              temperature,
              max_tokens: smartMaxTokens,
              stream: true
            })
          });

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
            return;
          }
        }

        if (MISTRAL_KEY) {
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MISTRAL_KEY}`
            },
            body: JSON.stringify({
              model: 'mistral-large-latest',
              messages,
              temperature,
              max_tokens: smartMaxTokens,
              stream: true
            })
          });

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
            return;
          }
        }

        if (OPENROUTER_KEY) {
          const openrouterModels = [
            'anthropic/claude-3.5-haiku',
            'meta-llama/llama-3.3-70b-instruct',
            'google/gemini-2.0-flash-exp:free',
            'mistralai/mistral-nemo:free'
          ];
          for (const model of openrouterModels) {
            if (controller.desiredSize === null) break;
            try {
              const response = await fetch(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'HTTP-Referer': 'https://smm-agent-sandy.vercel.app',
                    'X-Title': 'SMM Agent'
                  },
                  body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens: smartMaxTokens,
                    stream: true
                  })
                }
              );
              if (response.ok && response.body) {
                const reader = response.body.getReader();
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  controller.enqueue(value);
                }
                return;
              }
            } catch(e) {
              console.error(`OpenRouter ${model} failed:`, e);
              continue;
            }
          }
        }

        if (GEMINI_KEY) {
          const systemMsg = messages?.find((m: { role: string }) => m.role === 'system');
          const nonSystemMessages = messages?.filter((m: { role: string }) => m.role !== 'system') || [];

          const geminiMessages = nonSystemMessages.map((m: { role: string; content: string }, i: number) => {
            if (i === 0 && systemMsg && m.role === 'user') {
              return { role: 'user', parts: [{ text: systemMsg.content + '\n\n' + m.content }] };
            }
            return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
          });

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: geminiMessages,
              generationConfig: { temperature, maxOutputTokens: smartMaxTokens }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: result } }] })}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            return;
          }
        }

        controller.enqueue(encoder.encode('data: {"error": "All AI providers failed. Please add an API key."}\n\n'));
      } catch (error) {
        console.error('Chat API error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: (error as Error).message || 'Server error' })}\n\n`));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}