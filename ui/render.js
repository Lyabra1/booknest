import {
  coverUrl,
  formatByline,
  formatFound,
  formatRating,
  getEmptyMessage,
  getView,
  isWished,
  totalPages,
} from '../lib/books.js';

// Элементы страницы ищем один раз. Модуль выполняется после разбора HTML, поэтому они уже есть.
const els = {
  form: document.getElementById('filters-form'),
  title: document.getElementById('list-title'),
  loading: document.getElementById('status-loading'),
  error: document.getElementById('status-error'),
  errorMessage: document.getElementById('error-message'),
  empty: document.getElementById('status-empty'),
  grid: document.getElementById('book-list'),
  pagination: document.getElementById('pagination'),
  pageInfo: document.getElementById('page-info'),
  prev: document.getElementById('page-prev'),
  next: document.getElementById('page-next'),
  wishlist: document.getElementById('wishlist-list'),
  wishlistTitle: document.getElementById('wishlist-title'),
  wishlistEmpty: document.getElementById('wishlist-empty'),
  counter: document.getElementById('wishlist-count'),
};

// Что сейчас нарисовано в сетке карточек. Заново рисуем, только если данные заменились:
// иначе при каждой букве в поиске картинки обложек перезагружались бы.
const drawn = { results: null, wishlist: null };

// Все тексты кладём через textContent: браузер не станет разбирать их как HTML.
function createElement(tag, { className, text } = {}) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function createToggleButton(book, inWishlist) {
  const button = createElement('button', { className: 'btn', text: 'Хочу прочитать' });
  button.type = 'button';
  button.dataset.action = 'toggle-wishlist';
  button.dataset.id = book.id;
  button.setAttribute('aria-pressed', String(inWishlist));
  return button;
}

function createCard(book, inWishlist) {
  const item = createElement('li');
  const card = createElement('article', { className: 'card' });

  const heading = createElement('h3');
  const link = createElement('a', { text: book.title });
  link.href = `book.html?${new URLSearchParams({ id: book.id })}`;
  heading.append(link);

  const cover = createElement('img');
  cover.src = coverUrl(book.coverId);
  cover.alt = `Обложка книги «${book.title}»`;
  cover.width = 200;
  cover.height = 300;
  cover.loading = 'lazy';

  // Последний блок карточки прижимается к низу (см. .card > :last-child в components.css).
  const footer = createElement('footer', { className: 'card__footer' });
  footer.append(createToggleButton(book, inWishlist));

  card.append(
    heading,
    createElement('p', { text: formatByline(book) }),
    createElement('p', { text: formatRating(book.rating) }),
    cover,
    footer,
  );
  item.append(card);
  return item;
}

function createWishlistItem(book) {
  const item = createElement('li', { className: 'wishlist__item' });
  const remove = createElement('button', { className: 'btn', text: 'Удалить' });
  remove.type = 'button';
  remove.dataset.action = 'toggle-wishlist';
  remove.dataset.id = book.id;
  remove.setAttribute('aria-label', `Удалить «${book.title}» из списка`);
  item.append(createElement('span', { text: `${book.title} — ${book.author}` }), remove);
  return item;
}

// Подгоняем поля формы под состояние (нужно после сброса).
// Текст переписываем только если он отличается, иначе курсор в поле поиска может прыгать.
function syncForm(state) {
  const { q, sort } = els.form.elements;
  if (q.value !== state.query) {
    q.value = state.query;
  }
  sort.value = state.sort;
}

// Единственная точка, которая меняет страницу. Интерфейс = функция от state.
export function render(state) {
  // Перерисовка пересоздаёт кнопки, поэтому запоминаем, какая была в фокусе, чтобы вернуть фокус.
  const active = document.activeElement;
  const focusRoot = active instanceof HTMLElement ? active.closest('ul') : null;
  const focusSelector =
    active instanceof HTMLElement && active.dataset.action
      ? `[data-action="${active.dataset.action}"][data-id="${active.dataset.id}"]`
      : null;

  syncForm(state);

  // Ровно один из четырёх экранов: loading, error, empty или success.
  const view = getView(state);
  els.loading.hidden = view !== 'loading';
  els.error.hidden = view !== 'error';
  els.empty.hidden = view !== 'empty';
  els.grid.hidden = view !== 'success';
  els.pagination.hidden = view !== 'success';

  els.title.textContent = view === 'success' ? formatFound(state.total) : 'Результаты';
  els.errorMessage.textContent = state.error === null ? '' : state.error.message;
  els.empty.textContent = getEmptyMessage(state.query);

  if (drawn.results !== state.results || drawn.wishlist !== state.wishlist) {
    els.grid.replaceChildren(
      ...state.results.map((book) => createCard(book, isWished(state.wishlist, book.id))),
    );
    drawn.results = state.results;
    drawn.wishlist = state.wishlist;
  }

  const pages = totalPages(state.total);
  els.pageInfo.textContent = `Страница ${state.page} из ${pages}`;
  els.prev.disabled = state.page <= 1;
  els.next.disabled = state.page >= pages;

  els.wishlist.replaceChildren(...state.wishlist.map(createWishlistItem));
  els.wishlistEmpty.hidden = state.wishlist.length !== 0;
  els.counter.textContent = String(state.wishlist.length);

  if (focusRoot && focusSelector) {
    // Если кнопку удалили из «Моего списка», фокус переходит на заголовок раздела.
    const fallback = focusRoot === els.wishlist ? els.wishlistTitle : null;
    (focusRoot.querySelector(focusSelector) ?? fallback)?.focus();
  }
}