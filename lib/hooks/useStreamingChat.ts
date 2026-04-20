'use client';

import { useState, useCallback, useRef } from 'react';
import { streamChat, type ChatMessage, type ChatOptions } from '@/lib/api/chat';

interface UseStreamingChatReturn {
  response: string;
  isLoading: boolean;
  error: string | null;
  sendMessage: (messages: ChatMessage[], options?: ChatOptions) => Promise<void>;
  abort: () => void;
  reset: () => void;
}

export function useStreamingChat(): UseStreamingChatReturn {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setResponse('');
    setError(null);
  }, []);

  const sendMessage = useCallback(async (messages: ChatMessage[], options?: ChatOptions) => {
    setIsLoading(true);
    setError(null);
    setResponse('');
    
    abortControllerRef.current = new AbortController();
    
    try {
      let fullResponse = '';
      for await (const chunk of streamChat(messages, options)) {
        fullResponse += chunk;
        setResponse(fullResponse);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to get response');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  return { response, isLoading, error, sendMessage, abort, reset };
}