import { BOOKS } from './data/books.js';
import { DEFAULT_FILTERS, sanitizeFilters, sanitizeWishlist, toggleId } from './lib/books.js';
import { loadSaved, save } from './storage.js';
import { render } from './ui/render.js';

// Единственный объект состояния. Всё, что видно на экране, вычисляется из него.
const saved = loadSaved();
const state = {
  filters: sanitizeFilters(saved.filters),
  wishlist: sanitizeWishlist(saved.wishlist, BOOKS),
};

// Единая точка изменения: обновили state, сохранили, перерисовали.
function update(changes) {
  Object.assign(state, changes);
  save({ filters: state.filters, wishlist: state.wishlist });
  render(state, BOOKS);
}

const form = document.getElementById('filters-form');

function readFilters() {
  const { q, genre, sort, available } = form.elements;
  return sanitizeFilters({
    query: q.value,
    genre: genre.value,
    sort: sort.value,
    onlyAvailable: available.checked,
  });
}

// input срабатывает на любое изменение любого поля формы, поэтому хватает одного слушателя.
form.addEventListener('input', () => update({ filters: readFilters() }));
form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('reset', (event) => {
  event.preventDefault(); // сбрасываем через state, а не средствами браузера
  update({ filters: DEFAULT_FILTERS });
});

// Делегирование: один слушатель на <main> обслуживает все кнопки, даже те, что появятся после перерисовки.
document.querySelector('main').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="toggle-wishlist"]');
  if (button === null) {
    return;
  }
  update({ wishlist: toggleId(state.wishlist, Number(button.dataset.id)) });
});

render(state, BOOKS);