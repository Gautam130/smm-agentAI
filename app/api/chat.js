// Vercel API Route - Chat/AI with Streaming Support
// All AI processing happens server-side, keys hidden from users

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Content-Length', '0');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, temperature = 0.7, maxTokens = 4000, provider = 'groq', taskType = 'general' } = req.body;

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

  // Keys stored as env vars on Vercel - not visible to users
  const GROQ_KEY = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  const MISTRAL_KEY = process.env.MISTRAL_API_KEY || process.env.MISTRAL_KEY;
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  // Helper to stream SSE - use Web Streams API properly
  async function streamAIResponse(fetchUrl, fetchOptions) {
    const response = await fetch(fetchUrl, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Use Web Streams API to pipe response to client
    const reader = response.body.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // value is Uint8Array - convert to string and write
        const text = new TextDecoder().decode(value, { stream: false });
        res.write(text);
      }
    } catch (e) {
      console.error('Stream error:', e.message);
    }
    
    res.end();
  }

  try {
    // 1. Groq with streaming
    if ((provider === 'groq' || !provider) && GROQ_KEY) {
      try {
        await streamAIResponse('https://api.groq.com/openai/v1/chat/completions', {
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
        return;
      } catch(e) {
        console.error('Groq error:', e.message);
      }
    }

    // 2. Mistral with streaming
    if (MISTRAL_KEY) {
      try {
        await streamAIResponse('https://api.mistral.ai/v1/chat/completions', {
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
        return;
      } catch(e) {
        console.error('Mistral error:', e.message);
      }
    }

    // 3. OpenRouter with streaming
    if (OPENROUTER_KEY) {
      try {
        await streamAIResponse('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'HTTP-Referer': 'https://smm-agent.vercel.app',
            'X-Title': 'SMM Agent'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages,
            temperature,
            max_tokens: smartMaxTokens,
            stream: true
          })
        });
        return;
      } catch(e) {
        console.error('OpenRouter error:', e.message);
      }
    }

    // 4. Gemini (non-streaming)
    if (GEMINI_KEY) {
      try {
        const systemMsg = messages.find(m => m.role === 'system');
        const nonSystemMessages = messages.filter(m => m.role !== 'system');

        const geminiMessages = nonSystemMessages.map((m, i) => {
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
          // Send as SSE format
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: result } }] })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        }
      } catch(e) {
        console.error('Gemini error:', e.message);
      }
    }

    console.error('All AI providers failed');
    return res.status(200).json({ error: 'All AI providers failed. Please add an API key.' });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(200).json({ error: error.message || 'Server error' });
  }
}
