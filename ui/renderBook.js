import { coverUrl, formatBookRating, getBookView } from '../lib/books.js';

const els = {
  title: document.getElementById('book-title'),
  crumb: document.getElementById('crumb-title'),
  loading: document.getElementById('status-loading'),
  error: document.getElementById('status-error'),
  errorMessage: document.getElementById('error-message'),
  notFound: document.getElementById('status-notfound'),
  details: document.getElementById('book-details'),
  cover: document.getElementById('book-cover'),
  authors: document.getElementById('book-authors'),
  published: document.getElementById('book-published'),
  rating: document.getElementById('book-rating'),
  subjects: document.getElementById('book-subjects'),
  description: document.getElementById('book-description'),
};

// Единственная точка, которая меняет страницу книги.
export function renderBook(state) {
  const view = getBookView(state);
  els.loading.hidden = view !== 'loading';
  els.error.hidden = view !== 'error';
  els.notFound.hidden = view !== 'notfound';
  els.details.hidden = view !== 'success';
  els.errorMessage.textContent = state.error === null ? '' : state.error.message;

  const book = view === 'success' ? state.book : null;
  const title = book === null ? 'Книга' : book.title;
  els.title.textContent = title;
  els.crumb.textContent = title;
  document.title = `${title} — BookNest`;

  if (book !== null) {
    els.cover.src = coverUrl(book.coverId, 'L');
    els.cover.alt = `Обложка книги «${book.title}»`;
    els.authors.textContent = book.authors.length > 0 ? book.authors.join(', ') : 'Автор неизвестен';
    els.published.textContent = book.published ?? 'Неизвестно';
    els.rating.textContent = formatBookRating(book);
    els.subjects.textContent = book.subjects.length > 0 ? book.subjects.join(', ') : 'Не указаны';
    els.description.textContent = book.description === '' ? 'Описание отсутствует.' : book.description;
  }
}