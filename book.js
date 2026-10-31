import { getBook } from './api/books.js';
import { readWorkId } from './lib/books.js';
import { describeError } from './lib/errors.js';
import { renderBook } from './ui/renderBook.js';

const id = readWorkId(window.location.search);

// Единственный объект состояния страницы. Если в адресе нет нормального id, запрос не нужен.
const state = { book: null, loading: id !== null, error: null };

function update(changes) {
  Object.assign(state, changes);
  renderBook(state);
}

async function load() {
  update({ loading: true, error: null });
  try {
    update({ book: await getBook(id) });
  } catch (error) {
    update({ book: null, error: { status: error.status ?? null, message: describeError(error) } });
  } finally {
    update({ loading: false });
  }
}

document.querySelector('main').addEventListener('click', (event) => {
  if (event.target.closest('[data-action="retry"]') !== null) {
    load();
  }
});

if (id === null) {
  renderBook(state);
} else {
  load();
}