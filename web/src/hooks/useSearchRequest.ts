import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchRequest, SortKey } from '../types';

const DEBOUNCE_MS = 350;
const INITIAL: SearchRequest = { query: '', sort: 'relevance', page: 1, attempt: 0 };

export function useSearchRequest() {
  const [text, setText] = useState('');
  const [request, setRequest] = useState<SearchRequest>(INITIAL);
  const timerRef = useRef<number | null>(null);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // При уходе со страницы отменяем отложенный поиск.
  useEffect(() => cancelTimer, [cancelTimer]);

  // Каждая буква отменяет прошлый таймер и ставит новый: поиск сработает, когда 350 мс никто не печатал.
  const changeText = (next: string) => {
    setText(next);
    cancelTimer();
    timerRef.current = window.setTimeout(() => {
      const query = next.trim();
      setRequest((prev) => (prev.query === query ? prev : { ...prev, query, page: 1 }));
    }, DEBOUNCE_MS);
  };

  // Enter ищет сразу, не дожидаясь паузы.
  const submit = () => {
    cancelTimer();
    setRequest((prev) => ({ ...prev, query: text.trim(), page: 1 }));
  };

  const changeSort = (sort: SortKey) => {
    cancelTimer();
    setRequest((prev) => ({ ...prev, query: text.trim(), sort, page: 1 }));
  };

  const changePage = (page: number) => {
    setRequest((prev) => ({ ...prev, page }));
  };

  const retry = () => {
    setRequest((prev) => ({ ...prev, attempt: prev.attempt + 1 }));
  };

  const reset = () => {
    cancelTimer();
    setText('');
    setRequest((prev) => ({ ...INITIAL, attempt: prev.attempt + 1 }));
  };

  return { text, request, changeText, submit, changeSort, changePage, retry, reset };
}