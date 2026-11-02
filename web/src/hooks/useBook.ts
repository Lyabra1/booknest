import { useEffect, useState } from 'react';
import { getBook } from '../api/books';
import { isAbortError } from '../api/client';
import { toErrorInfo } from '../lib/errors';
import type { BookDetails, BookState, ErrorInfo } from '../types';

interface Settled {
  key: string;
  book: BookDetails | null;
  error: ErrorInfo | null;
}

export function useBook(id: string, attempt: number): BookState {
  const key = `${id}:${attempt}`;
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getBook(id, controller.signal)
      .then((book) => setSettled({ key, book, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }
        setSettled({ key, book: null, error: toErrorInfo(error) });
      });
    return () => controller.abort();
  }, [id, key]);

  if (settled === null || settled.key !== key) {
    return { book: null, loading: true, error: null };
  }
  return { book: settled.book, loading: false, error: settled.error };
}