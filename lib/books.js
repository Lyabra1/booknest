// Чистые функции: ничего не знают про DOM и localStorage, не меняют свои аргументы.

export const GENRE_LABELS = Object.freeze({
  scifi: 'Фантастика',
  history: 'История',
  poetry: 'Поэзия',
  cs: 'Информатика',
  prose: 'Проза',
});

export const SORT_KEYS = Object.freeze(['title', 'year', 'rating']);

export const DEFAULT_FILTERS = Object.freeze({
  query: '',
  genre: 'all',
  sort: 'title',
  onlyAvailable: false,
});

const compareByTitle = (a, b) => a.title.localeCompare(b.title, 'ru');

// При равенстве года или рейтинга порядок решает название, чтобы результат был стабильным.
const COMPARATORS = {
  title: compareByTitle,
  year: (a, b) => b.year - a.year || compareByTitle(a, b),
  rating: (a, b) => b.rating - a.rating || compareByTitle(a, b),
};

// Приводит текст к виду для сравнения: без пробелов по краям, строчные буквы, «ё» = «е».
export function normalize(text) {
  return text.trim().toLowerCase().replaceAll('ё', 'е');
}

export function filterBooks(books, { query, genre, onlyAvailable }) {
  const needle = normalize(query);
  return books.filter((book) => {
    const matchesQuery =
      needle === '' ||
      normalize(book.title).includes(needle) ||
      normalize(book.author).includes(needle);
    const matchesGenre = genre === 'all' || book.genre === genre;
    const matchesAvailable = !onlyAvailable || book.available;
    return matchesQuery && matchesGenre && matchesAvailable;
  });
}

export function sortBooks(books, sortKey) {
  const compare = Object.hasOwn(COMPARATORS, sortKey) ? COMPARATORS[sortKey] : compareByTitle;
  // [...books] копирует массив: sort() меняет массив, на котором вызван, а исходный трогать нельзя.
  return [...books].sort(compare);
}

export function getVisibleBooks(books, filters) {
  return sortBooks(filterBooks(books, filters), filters.sort);
}

// Если id уже есть в списке, убираем его, иначе добавляем. Возвращается новый массив.
export function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function wishlistBooks(books, ids) {
  return ids.map((id) => books.find((book) => book.id === id)).filter((book) => book !== undefined);
}

// Рейтинг по-русски: «4,6» и «4,0» (всегда один знак после запятой).
export function formatRating(rating) {
  return rating.toLocaleString('ru-RU', { minimumFractionDigits: 1 });
}

// «Найдена 1 книга», «Найдено 2 книги», «Найдено 5 книг», «Найдено 11 книг».
export function formatFound(count) {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit === 1 && lastTwo !== 11) {
    return `Найдена ${count} книга`;
  }
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14);
  return `Найдено ${count} ${isFew ? 'книги' : 'книг'}`;
}

// Данные из localStorage могут быть чем угодно: проверяем каждое поле и подставляем значение по умолчанию.
export function sanitizeFilters(raw) {
  const source = typeof raw === 'object' && raw !== null ? raw : {};
  const genreIsValid = source.genre === 'all' || Object.hasOwn(GENRE_LABELS, source.genre);
  return {
    query: typeof source.query === 'string' ? source.query.slice(0, 100) : DEFAULT_FILTERS.query,
    genre: genreIsValid ? source.genre : DEFAULT_FILTERS.genre,
    sort: SORT_KEYS.includes(source.sort) ? source.sort : DEFAULT_FILTERS.sort,
    onlyAvailable: source.onlyAvailable === true,
  };
}

export function sanitizeWishlist(raw, books) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const knownIds = new Set(books.map((book) => book.id));
  return [...new Set(raw)].filter((id) => knownIds.has(id));
}