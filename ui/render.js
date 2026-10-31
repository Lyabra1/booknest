import { GENRE_LABELS, formatFound, formatRating, getVisibleBooks, wishlistBooks } from '../lib/books.js';

// Элементы страницы ищем один раз. Модуль выполняется после разбора HTML, поэтому они уже есть.
const els = {
  form: document.getElementById('filters-form'),
  title: document.getElementById('list-title'),
  grid: document.getElementById('book-list'),
  empty: document.getElementById('empty-message'),
  wishlist: document.getElementById('wishlist-list'),
  wishlistTitle: document.getElementById('wishlist-title'),
  wishlistEmpty: document.getElementById('wishlist-empty'),
  counter: document.getElementById('wishlist-count'),
};

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
  button.dataset.id = String(book.id);
  button.setAttribute('aria-pressed', String(inWishlist));
  return button;
}

function createCard(book, inWishlist) {
  const item = createElement('li');
  const card = createElement('article', { className: 'card' });

  const heading = createElement('h3');
  const link = createElement('a', { text: book.title });
  link.href = 'book.html';
  heading.append(link);

  const cover = createElement('img');
  cover.src = 'img/cover.jpg';
  cover.alt = `Обложка книги «${book.title}»`;
  cover.width = 200;
  cover.height = 300;

  // Последний блок карточки прижимается к низу (см. .card > :last-child в components.css).
  const footer = createElement('footer', { className: 'card__footer' });
  const status = createElement('p');
  status.append(createElement('strong', { text: book.available ? 'Доступна' : 'Выдана' }));
  footer.append(status, createToggleButton(book, inWishlist));

  card.append(
    heading,
    createElement('p', { text: `${book.author}, ${book.year}` }),
    createElement('p', { text: `${GENRE_LABELS[book.genre]} · рейтинг ${formatRating(book.rating)}` }),
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
  remove.dataset.id = String(book.id);
  remove.setAttribute('aria-label', `Удалить «${book.title}» из списка`);
  item.append(createElement('span', { text: `${book.title} — ${book.author}` }), remove);
  return item;
}

// Подгоняем поля формы под состояние (нужно после сброса и после восстановления из localStorage).
// Значение переписываем только если оно отличается, иначе курсор в поле поиска может прыгать.
function syncForm(filters) {
  const { q, genre, sort, available } = els.form.elements;
  if (q.value !== filters.query) {
    q.value = filters.query;
  }
  genre.value = filters.genre;
  sort.value = filters.sort;
  available.checked = filters.onlyAvailable;
}

// Единственная точка, которая меняет страницу. Интерфейс = функция от state.
export function render(state, books) {
  // Перерисовка пересоздаёт кнопки, поэтому запоминаем, какая была в фокусе, чтобы вернуть фокус.
  const active = document.activeElement;
  const focusRoot = active instanceof HTMLElement ? active.closest('ul') : null;
  const focusSelector =
    active instanceof HTMLElement && active.dataset.action
      ? `[data-action="${active.dataset.action}"][data-id="${active.dataset.id}"]`
      : null;

  const visible = getVisibleBooks(books, state.filters);
  syncForm(state.filters);
  els.title.textContent = formatFound(visible.length);
  els.grid.replaceChildren(
    ...visible.map((book) => createCard(book, state.wishlist.includes(book.id))),
  );
  els.empty.hidden = visible.length !== 0;

  const saved = wishlistBooks(books, state.wishlist);
  els.wishlist.replaceChildren(...saved.map(createWishlistItem));
  els.wishlistEmpty.hidden = saved.length !== 0;
  els.counter.textContent = String(state.wishlist.length);

  if (focusRoot && focusSelector) {
    // Если кнопку удалили из «Моего списка», фокус переходит на заголовок раздела.
    const fallback = focusRoot === els.wishlist ? els.wishlistTitle : null;
    (focusRoot.querySelector(focusSelector) ?? fallback)?.focus();
  }
}