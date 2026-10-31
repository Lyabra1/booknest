import { useBookSearch } from './hooks/useBookSearch';
import { useSearchRequest } from './hooks/useSearchRequest';

// Временная проверочная версия: в Шаге 9 заменится настоящим App.
export function App() {
  const filters = useSearchRequest();
  const search = useBookSearch(filters.request);
  return (
    <main className="page">
      <h1>BookNest</h1>
      <input
        type="search"
        aria-label="Поиск"
        value={filters.text}
        onChange={(event) => filters.changeText(event.target.value)}
      />
      <p>{search.loading ? 'загрузка…' : `найдено: ${search.total}, ошибка: ${search.error?.message ?? 'нет'}`}</p>
    </main>
  );
}