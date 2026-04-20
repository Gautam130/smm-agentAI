export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  task?: 'research' | 'strategy' | 'calendar' | 'influencer' | 'content' | 'hooks' | 'chat';
  temperature?: number;
  maxTokens?: number;
}

export async function* streamChat(
  messages: ChatMessage[],
  options?: ChatOptions
): AsyncGenerator<string, void, unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, ...options }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Chat API error: ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) yield parsed.content;
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function chat(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<string> {
  let fullResponse = '';
  for await (const chunk of streamChat(messages, options)) {
    fullResponse += chunk;
  }
  return fullResponse;
}