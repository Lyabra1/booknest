import { PAGE_SIZE, pickAuthorKeys, toBook, toBookDetails } from '../lib/books';
import type {
  AuthorResponse,
  Book,
  BookDetails,
  RatingsResponse,
  SearchResponse,
  SortKey,
  WorkResponse,
} from '../types';
import { ApiError, request } from './client';

const SEARCH_FIELDS = 'key,title,author_name,first_publish_year,cover_i,ratings_average';

// «По релевантности» — порядок по умолчанию, параметр sort тогда не передаём.
const SORT_PARAMS: Record<SortKey, string | undefined> = {
  relevance: undefined,
  new: 'new',
  rating: 'rating',
};

interface SearchParams {
  query: string;
  page: number;
  sort: SortKey;
  signal?: AbortSignal;
}

export async function searchBooks({
  query,
  page,
  sort,
  signal,
}: SearchParams): Promise<{ total: number; books: Book[] }> {
  const data = await request<SearchResponse>(
    '/search.json',
    { q: query, page, limit: PAGE_SIZE, fields: SEARCH_FIELDS, sort: SORT_PARAMS[sort] },
    signal,
  );
  const books = data.docs.flatMap((doc) =>
    typeof doc.key === 'string' ? [toBook({ ...doc, key: doc.key })] : [],
  );
  return { total: data.numFound, books };
}

// Имя автора: если запрос про автора не удался, книга всё равно показывается без него.
async function getAuthorName(key: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const author = await request<AuthorResponse>(`${key}.json`, {}, signal);
    return typeof author.name === 'string' ? author.name : null;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }
    throw error;
  }
}

export async function getBook(id: string, signal?: AbortSignal): Promise<BookDetails> {
  const path = `/works/${encodeURIComponent(id)}`;
  // Эти два запроса не зависят друг от друга, поэтому идут одновременно.
  const [work, ratings] = await Promise.all([
    request<WorkResponse>(`${path}.json`, {}, signal),
    request<RatingsResponse>(`${path}/ratings.json`, {}, signal),
  ]);
  // Авторов можно узнать только из ответа про книгу, поэтому их запросы идут вторым шагом.
  const names = await Promise.all(pickAuthorKeys(work).map((key) => getAuthorName(key, signal)));
  return toBookDetails(
    id,
    work,
    ratings,
    names.filter((name): name is string => name !== null),
  );
}