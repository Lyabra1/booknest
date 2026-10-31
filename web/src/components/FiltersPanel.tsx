import { SORT_KEYS, SORT_LABELS, sanitizeSort } from '../lib/books';
import type { SortKey } from '../types';
import { Button } from './Button';

interface FiltersPanelProps {
  text: string;
  sort: SortKey;
  onTextChange: (text: string) => void;
  onSortChange: (sort: SortKey) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function FiltersPanel({ text, sort, onTextChange, onSortChange, onSubmit, onReset }: FiltersPanelProps) {
  return (
    <section className="panel catalog__filters" aria-labelledby="filters-title">
      <h2 id="filters-title">Поиск</h2>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        onReset={(event) => {
          event.preventDefault(); // сбрасываем через состояние, а не средствами браузера
          onReset();
        }}
      >
        <label htmlFor="q">Поиск по названию или автору</label>
        <input
          id="q"
          name="q"
          type="search"
          minLength={2}
          maxLength={100}
          autoComplete="off"
          aria-describedby="q-hint"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
        />
        <p id="q-hint">Минимум 2 символа. Поиск начнётся сам, когда вы закончите печатать.</p>

        <label htmlFor="sort">Сортировка</label>
        <select id="sort" name="sort" value={sort} onChange={(event) => onSortChange(sanitizeSort(event.target.value))}>
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>

        {/* type="reset" нужен, чтобы сработал стиль .form button[type="reset"] из components.css */}
        <Button type="reset">Сбросить</Button>
      </form>
    </section>
  );
}