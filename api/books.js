import { PAGE_SIZE, pickAuthorKeys, toBook, toBookDetails } from '../lib/books.js';
import { ApiError, request } from './client.js';

const SEARCH_FIELDS = 'key,title,author_name,first_publish_year,cover_i,ratings_average';

// «По релевантности» — порядок по умолчанию, параметр sort тогда не передаём.
const SORT_PARAMS = { relevance: undefined, new: 'new', rating: 'rating' };

export async function searchBooks({ query, page, sort, signal }) {
  const data = await request(
    '/search.json',
    { q: query, page, limit: PAGE_SIZE, fields: SEARCH_FIELDS, sort: SORT_PARAMS[sort] },
    signal,
  );
  const books = data.docs.filter((doc) => typeof doc.key === 'string').map(toBook);
  return { total: data.numFound, books };
}

// Имя автора: если запрос про автора не удался, книга всё равно показывается без него.
async function getAuthorName(key) {
  try {
    const author = await request(`${key}.json`);
    return typeof author.name === 'string' ? author.name : null;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }
    throw error;
  }
}

export async function getBook(id) {
  const path = `/works/${encodeURIComponent(id)}`;
  // Эти два запроса не зависят друг от друга, поэтому идут одновременно.
  const [work, ratings] = await Promise.all([
    request(`${path}.json`),
    request(`${path}/ratings.json`),
  ]);
  // Авторов можно узнать только из ответа про книгу, поэтому их запросы идут вторым шагом.
  const names = await Promise.all(pickAuthorKeys(work).map(getAuthorName));
  return toBookDetails(id, work, ratings, names.filter((name) => name !== null));
}