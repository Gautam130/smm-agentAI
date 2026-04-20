'use client';

import { useState, useCallback } from 'react';
import { search, type SearchProvider, type SearchOptions, type SearchResponse } from '@/lib/api/search';

interface UseSearchReturn {
  data: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  execute: (provider: SearchProvider, query: string, options?: SearchOptions) => Promise<void>;
  reset: () => void;
}

export function useSearch(): UseSearchReturn {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    provider: SearchProvider,
    query: string,
    options?: SearchOptions
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await search(provider, query, options);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset };
}