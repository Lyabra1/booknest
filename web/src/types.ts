// ---------- перечисления (union-типы вместо string) ----------
export type SortKey = 'relevance' | 'new' | 'rating';
export type ViewKind = 'loading' | 'error' | 'empty' | 'success';
export type BookViewKind = 'loading' | 'error' | 'notfound' | 'success';

// ---------- предметная область ----------
export interface Book {
  id: string;
  title: string;
  author: string;
  year: number | null;
  rating: number | null;
  coverId: number | null;
}

export interface BookDetails {
  id: string;
  title: string;
  authors: string[];
  published: string | null;
  rating: number | null;
  ratingCount: number;
  description: string;
  subjects: string[];
  coverId: number | null;
}

// Что хранится в списке «Хочу прочитать»: копия нужных полей, а не вся книга.
export interface WishItem {
  id: string;
  title: string;
  author: string;
}

export interface ErrorInfo {
  status: number | null; // 0 = ответа не было (нет сети), null = не ошибка HTTP
  message: string;
}

// Параметры запроса поиска. attempt увеличивается при «Повторить»: запрос тот же, но он новый.
export interface SearchRequest {
  query: string;
  sort: SortKey;
  page: number;
  attempt: number;
}

export interface SearchState {
  results: Book[];
  total: number;
  loading: boolean;
  error: ErrorInfo | null;
}

export interface BookState {
  book: BookDetails | null;
  loading: boolean;
  error: ErrorInfo | null;
}

// ---------- сырые ответы Open Library (поля unknown: проверяем в lib/books.ts) ----------
export interface SearchDoc {
  key?: unknown;
  title?: unknown;
  author_name?: unknown;
  first_publish_year?: unknown;
  cover_i?: unknown;
  ratings_average?: unknown;
}
export type KeyedSearchDoc = SearchDoc & { key: string };

export interface SearchResponse {
  numFound: number;
  docs: SearchDoc[];
}

export interface WorkResponse {
  title?: unknown;
  description?: unknown;
  first_publish_date?: unknown;
  subjects?: unknown;
  covers?: unknown;
  authors?: unknown;
}

export interface RatingsResponse {
  summary?: { average?: unknown; count?: unknown };
}

export interface AuthorResponse {
  name?: unknown;
}