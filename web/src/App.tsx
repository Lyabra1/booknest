import { Badge } from './components/Badge';
import { Button } from './components/Button';
import { EmptyState } from './components/EmptyState';
import { ErrorBox } from './components/ErrorBox';
import { Spinner } from './components/Spinner';

// Временная витрина: в Шаге 9 заменится настоящим App.
export function App() {
  return (
    <main className="page">
      <h1>Элементы</h1>
      <Spinner />
      <EmptyState>Ничего не найдено</EmptyState>
      <ErrorBox message="Что-то пошло не так" onRetry={() => undefined} />
      <p>
        <Badge>рейтинг 4,1</Badge> <Button>Кнопка</Button> <Button pressed>Нажата</Button>{' '}
        <Button disabled>Недоступна</Button>
      </p>
    </main>
  );
}