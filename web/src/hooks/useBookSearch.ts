import { useEffect, useState } from 'react';
import { isAbortError } from '../api/client';
import { searchBooks } from '../api/books';
import { MIN_QUERY_LENGTH } from '../lib/books';
import { toErrorInfo } from '../lib/errors';
import type { Book, ErrorInfo, SearchRequest, SearchState } from '../types';

// Последний полученный ответ и запрос, для которого он получен.
interface Settled {
  request: SearchRequest;
  results: Book[];
  total: number;
  error: ErrorInfo | null;
}

const IDLE: SearchState = { results: [], total: 0, loading: false, error: null };
const PENDING: SearchState = { results: [], total: 0, loading: true, error: null };

export function useBookSearch(request: SearchRequest): SearchState {
  const [settled, setSettled] = useState<Settled | null>(null);
  const isActive = request.query.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const controller = new AbortController();
    searchBooks({
      query: request.query,
      page: request.page,
      sort: request.sort,
      signal: controller.signal,
    })
      .then(({ books, total }) => setSettled({ request, results: books, total, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return; // запрос отменили мы сами, это не ошибка для пользователя
        }
        setSettled({ request, results: [], total: 0, error: toErrorInfo(error) });
      });
    // Очистка: когда запрос сменился или компонент ушёл, старый запрос отменяется.
    return () => controller.abort();
  }, [request, isActive]);

  if (!isActive) {
    return IDLE; // слишком короткий запрос: ничего не ищем, экран «пусто» с подсказкой
  }
  // «Загрузка» вычисляется: ответа нет или он относится к другому (старому) запросу.
  if (settled === null || settled.request !== request) {
    return PENDING;
  }
  return { results: settled.results, total: settled.total, loading: false, error: settled.error };
}