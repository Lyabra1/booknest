import { searchBooks } from './api/books.js';
import { MIN_QUERY_LENGTH, sanitizeSort, sanitizeWishlist, toggleWish } from './lib/books.js';
import { debounce } from './lib/debounce.js';
import { describeError } from './lib/errors.js';
import { loadSaved, save } from './storage.js';
import { render } from './ui/render.js';

const DEBOUNCE_MS = 350;

// Единственный объект состояния. Всё, что видно на экране, вычисляется из него.
const state = {
  query: '',
  sort: 'relevance',
  page: 1,
  results: [],
  total: 0,
  loading: false,
  error: null,
  wishlist: sanitizeWishlist(loadSaved().wishlist),
};

// Единая точка изменения: обновили state, при необходимости сохранили, перерисовали.
function update(changes) {
  Object.assign(state, changes);
  if ('wishlist' in changes) {
    save({ wishlist: state.wishlist });
  }
  render(state);
}

// Контроллер последнего запущенного поиска: им можно отменить запрос, который ещё в пути.
let activeRequest = null;

async function search() {
  activeRequest?.abort();
  const query = state.query.trim();

  if (query.length < MIN_QUERY_LENGTH) {
    activeRequest = null;
    update({ results: [], total: 0, loading: false, error: null });
    return;
  }

  const controller = new AbortController();
  activeRequest = controller;
  update({ loading: true, error: null });

  try {
    const { books, total } = await searchBooks({
      query,
      page: state.page,
      sort: state.sort,
      signal: controller.signal,
    });
    update({ results: books, total });
  } catch (error) {
    if (error.name === 'AbortError') {
      return; // запрос отменили мы сами, это не ошибка для пользователя
    }
    update({
      results: [],
      total: 0,
      error: { status: error.status ?? null, message: describeError(error) },
    });
  } finally {
    // Индикатор снимаем здесь, чтобы он не завис ни при успехе, ни при ошибке.
    // Но только если мы всё ещё последний запрос: у отменённого старого запроса другой контроллер.
    if (activeRequest === controller) {
      activeRequest = null;
      update({ loading: false });
    }
  }
}

const scheduleSearch = debounce(search, DEBOUNCE_MS);
const form = document.getElementById('filters-form');

// input срабатывает на любое изменение любого поля формы, поэтому хватает одного слушателя.
form.addEventListener('input', (event) => {
  const { q, sort } = form.elements;
  if (event.target === q) {
    update({ query: q.value, page: 1 });
    scheduleSearch();
  } else if (event.target === sort) {
    update({ sort: sanitizeSort(sort.value), page: 1 });
    scheduleSearch.cancel();
    search();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  scheduleSearch.cancel();
  search(); // Enter в поле поиска ищет сразу, не дожидаясь паузы
});

form.addEventListener('reset', (event) => {
  event.preventDefault(); // сбрасываем через state, а не средствами браузера
  scheduleSearch.cancel();
  update({ query: '', sort: 'relevance', page: 1 });
  search();
});

function goToPage(page) {
  update({ page });
  search();
}

// Делегирование: один слушатель на <main> обслуживает все кнопки, даже те, что появятся после перерисовки.
document.querySelector('main').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button === null) {
    return;
  }
  switch (button.dataset.action) {
    case 'toggle-wishlist': {
      const book = [...state.results, ...state.wishlist].find((item) => item.id === button.dataset.id);
      if (book !== undefined) {
        update({ wishlist: toggleWish(state.wishlist, book) });
      }
      break;
    }
    case 'retry':
      search();
      break;
    case 'prev-page':
      goToPage(state.page - 1);
      break;
    case 'next-page':
      goToPage(state.page + 1);
      break;
  }
});

render(state);