'use client';

export async function streamAI(prompt: string, onChunk: (text: string) => void, onError?: (err: string) => void) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.body) throw new Error('No response');
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    
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
            if (parsed.choices?.[0]?.delta?.content) {
              text += parsed.choices[0].delta.content;
              onChunk(text);
            }
          } catch {}
        }
      }
    }
    
    return text || 'No response';
  } catch (e: any) {
    const errMsg = e.message || 'Failed to connect';
    if (onError) onError(errMsg);
    return null;
  }
}