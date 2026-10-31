import type {
  Book,
  BookDetails,
  BookState,
  BookViewKind,
  KeyedSearchDoc,
  RatingsResponse,
  SearchState,
  SortKey,
  ViewKind,
  WishItem,
  WorkResponse,
} from '../types';
import { isRecord } from './guards';

// Чистые функции: ничего не знают про DOM, сеть и localStorage, не меняют свои аргументы.

export const PAGE_SIZE = 20;
export const MIN_QUERY_LENGTH = 2;
export const SORT_KEYS: readonly SortKey[] = ['relevance', 'new', 'rating'];
export const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'По релевантности',
  new: 'Сначала новые',
  rating: 'По рейтингу',
};

// ---------- мелкие проверки типов ----------

function intOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

// ---------- разбор ответов API ----------

export function toBook(doc: KeyedSearchDoc): Book {
  const authors = stringList(doc.author_name);
  return {
    id: doc.key.replace('/works/', ''),
    title: typeof doc.title === 'string' ? doc.title : 'Без названия',
    author: authors.length > 0 ? authors.slice(0, 2).join(', ') : 'Автор неизвестен',
    year: intOrNull(doc.first_publish_year),
    rating: numberOrNull(doc.ratings_average),
    coverId: intOrNull(doc.cover_i),
  };
}

// В описании бывает строка, а бывает объект { type, value }.
function parseDescription(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return isRecord(value) && typeof value.value === 'string' ? value.value : '';
}

// В списке обложек встречается -1, это «обложки нет».
function pickCoverId(covers: unknown): number | null {
  if (!Array.isArray(covers)) {
    return null;
  }
  const id: unknown = covers.find((cover) => typeof cover === 'number' && Number.isInteger(cover) && cover > 0);
  return intOrNull(id);
}

export function pickAuthorKeys(work: WorkResponse): string[] {
  if (!Array.isArray(work.authors)) {
    return [];
  }
  const keys: unknown[] = work.authors.map((item: unknown) =>
    isRecord(item) && isRecord(item.author) ? item.author.key : undefined,
  );
  return keys
    .filter((key): key is string => typeof key === 'string' && /^\/authors\/OL\d+A$/.test(key))
    .slice(0, 3);
}

export function toBookDetails(
  id: string,
  work: WorkResponse,
  ratings: RatingsResponse,
  authors: string[],
): BookDetails {
  const summary = ratings.summary;
  return {
    id,
    title: typeof work.title === 'string' ? work.title : 'Без названия',
    authors,
    published: typeof work.first_publish_date === 'string' ? work.first_publish_date : null,
    rating: numberOrNull(summary?.average),
    ratingCount: intOrNull(summary?.count) ?? 0,
    description: parseDescription(work.description),
    subjects: stringList(work.subjects).slice(0, 8),
    coverId: pickCoverId(work.covers),
  };
}

// ---------- какой из экранов показать ----------
// Вид вычисляется из состояния, а не хранится отдельно, поэтому два экрана сразу показаться не могут.

export function getView(state: SearchState): ViewKind {
  if (state.loading) {
    return 'loading';
  }
  if (state.error !== null) {
    return 'error';
  }
  return state.results.length > 0 ? 'success' : 'empty';
}

export function getBookView(state: BookState): BookViewKind {
  if (state.loading) {
    return 'loading';
  }
  if (state.error !== null) {
    return state.error.status === 404 ? 'notfound' : 'error';
  }
  return state.book === null ? 'notfound' : 'success';
}

export function getEmptyMessage(query: string): string {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return `Введите название книги или автора (минимум ${MIN_QUERY_LENGTH} символа).`;
  }
  return `По запросу «${trimmed}» ничего не найдено. Попробуйте другое слово.`;
}

export function totalPages(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

// ---------- тексты ----------

export function coverUrl(coverId: number | null, size: 'M' | 'L' = 'M'): string {
  return coverId === null ? '/img/cover.jpg' : `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export function formatByline(book: Book): string {
  return book.year === null ? book.author : `${book.author}, ${book.year}`;
}

// Рейтинг по-русски, один знак после запятой: «4,1».
function formatRatingValue(rating: number): string {
  return rating.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatRating(rating: number | null): string {
  return rating === null ? 'нет оценок' : `рейтинг ${formatRatingValue(rating)}`;
}

export function formatBookRating(book: BookDetails): string {
  if (book.rating === null) {
    return 'Нет оценок';
  }
  return `${formatRatingValue(book.rating)} из 5 (оценок: ${book.ratingCount})`;
}

// «Найдена 1 книга», «Найдено 2 книги», «Найдено 5 книг», «Найдено 11 книг».
export function formatFound(count: number): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  const shown = count.toLocaleString('ru-RU');
  if (lastDigit === 1 && lastTwo !== 11) {
    return `Найдена ${shown} книга`;
  }
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14);
  return `Найдено ${shown} ${isFew ? 'книги' : 'книг'}`;
}

// ---------- список «Хочу прочитать» ----------
// Всё без мутаций: возвращается новый массив, старый не меняется. Иначе React не заметит изменения.

export function isWished(items: WishItem[], id: string): boolean {
  return items.some((item) => item.id === id);
}

export function toggleWish(items: WishItem[], book: WishItem): WishItem[] {
  if (isWished(items, book.id)) {
    return items.filter((item) => item.id !== book.id);
  }
  return [...items, { id: book.id, title: book.title, author: book.author }];
}

function isWishItem(item: unknown): item is WishItem {
  return (
    isRecord(item) &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.author === 'string'
  );
}

// Данные из localStorage могут быть чем угодно: оставляем только записи правильной формы, без повторов.
export function sanitizeWishlist(raw: unknown): WishItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const valid = raw.filter(isWishItem);
  const unique = valid.filter((item, index) => valid.findIndex((other) => other.id === item.id) === index);
  return unique.map(({ id, title, author }) => ({ id, title, author }));
}

export function sanitizeSort(value: string): SortKey {
  return SORT_KEYS.find((key) => key === value) ?? 'relevance';
}