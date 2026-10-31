import { BookPage } from './components/BookPage';

// Временная проверка: в Шаге 9 заменится настоящим App.
export function App() {
  return (
    <main className="page page--narrow">
      <BookPage id="OL45804W" inWishlist={false} onBack={() => undefined} onToggleWish={() => undefined} />
    </main>
  );
}