// Чистые функции: ничего не знают про DOM, сеть и localStorage, не меняют свои аргументы.

export const PAGE_SIZE = 20;
export const MIN_QUERY_LENGTH = 2;
export const SORT_KEYS = Object.freeze(['relevance', 'new', 'rating']);

// ---------- разбор ответов API ----------

export function toBook(doc) {
  const hasAuthors = Array.isArray(doc.author_name) && doc.author_name.length > 0;
  return {
    id: doc.key.replace('/works/', ''),
    title: typeof doc.title === 'string' ? doc.title : 'Без названия',
    author: hasAuthors ? doc.author_name.slice(0, 2).join(', ') : 'Автор неизвестен',
    year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year : null,
    rating: typeof doc.ratings_average === 'number' ? doc.ratings_average : null,
    coverId: Number.isInteger(doc.cover_i) ? doc.cover_i : null,
  };
}

// В описании бывает строка, а бывает объект { type, value }.
function parseDescription(value) {
  if (typeof value === 'string') {
    return value;
  }
  return typeof value?.value === 'string' ? value.value : '';
}

// В списке обложек встречается -1, это «обложки нет».
function pickCoverId(covers) {
  const id = Array.isArray(covers) ? covers.find((cover) => Number.isInteger(cover) && cover > 0) : undefined;
  return id ?? null;
}

export function pickAuthorKeys(work) {
  const keys = Array.isArray(work.authors) ? work.authors.map((item) => item?.author?.key) : [];
  return keys.filter((key) => typeof key === 'string' && /^\/authors\/OL\d+A$/.test(key)).slice(0, 3);
}

export function toBookDetails(id, work, ratings, authors) {
  const summary = ratings?.summary;
  return {
    id,
    title: typeof work.title === 'string' ? work.title : 'Без названия',
    authors,
    published: typeof work.first_publish_date === 'string' ? work.first_publish_date : null,
    rating: typeof summary?.average === 'number' ? summary.average : null,
    ratingCount: Number.isInteger(summary?.count) ? summary.count : 0,
    description: parseDescription(work.description),
    subjects: Array.isArray(work.subjects)
      ? work.subjects.filter((subject) => typeof subject === 'string').slice(0, 8)
      : [],
    coverId: pickCoverId(work.covers),
  };
}

// Идентификатор книги из адреса страницы: ?id=OL45804W. Если там мусор, возвращаем null.
export function readWorkId(search) {
  const id = new URLSearchParams(search).get('id');
  return id !== null && /^OL\d+W$/.test(id) ? id : null;
}

// ---------- какой из экранов показать ----------
// Вид вычисляется из состояния, а не хранится отдельно, поэтому два экрана сразу показаться не могут.

export function getView(state) {
  if (state.loading) {
    return 'loading';
  }
  if (state.error !== null) {
    return 'error';
  }
  return state.results.length > 0 ? 'success' : 'empty';
}

export function getBookView(state) {
  if (state.loading) {
    return 'loading';
  }
  if (state.error !== null) {
    return state.error.status === 404 ? 'notfound' : 'error';
  }
  return state.book === null ? 'notfound' : 'success';
}

export function getEmptyMessage(query) {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return `Введите название книги или автора (минимум ${MIN_QUERY_LENGTH} символа).`;
  }
  return `По запросу «${trimmed}» ничего не найдено. Попробуйте другое слово.`;
}

export function totalPages(total) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

// ---------- тексты ----------

export function coverUrl(coverId, size = 'M') {
  return coverId === null ? 'img/cover.jpg' : `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export function formatByline(book) {
  return book.year === null ? book.author : `${book.author}, ${book.year}`;
}

// Рейтинг по-русски, один знак после запятой: «4,1».
export function formatRatingValue(rating) {
  return rating.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatRating(rating) {
  return rating === null ? 'нет оценок' : `рейтинг ${formatRatingValue(rating)}`;
}

export function formatBookRating(book) {
  if (book.rating === null) {
    return 'Нет оценок';
  }
  return `${formatRatingValue(book.rating)} из 5 (оценок: ${book.ratingCount})`;
}

// «Найдена 1 книга», «Найдено 2 книги», «Найдено 5 книг», «Найдено 11 книг».
export function formatFound(count) {
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
// В списке хранятся копии нужных полей (id, название, автор), потому что книги из API
// в следующий раз могут не попасть в выдачу, а в списке они должны остаться.

export function isWished(items, id) {
  return items.some((item) => item.id === id);
}

export function toggleWish(items, book) {
  if (isWished(items, book.id)) {
    return items.filter((item) => item.id !== book.id);
  }
  return [...items, { id: book.id, title: book.title, author: book.author }];
}

// Данные из localStorage могут быть чем угодно: оставляем только записи правильной формы, без повторов.
export function sanitizeWishlist(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const valid = raw.filter(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.author === 'string',
  );
  const unique = valid.filter((item, index) => valid.findIndex((other) => other.id === item.id) === index);
  return unique.map(({ id, title, author }) => ({ id, title, author }));
}

export function sanitizeSort(value) {
  return SORT_KEYS.includes(value) ? value : 'relevance';
}