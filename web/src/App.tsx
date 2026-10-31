import { useState } from 'react';
import { BookList } from './components/BookList';
import { Pagination } from './components/Pagination';
import { toggleWish } from './lib/books';
import type { Book, WishItem } from './types';

const BOOKS: Book[] = [
  { id: 'OL1W', title: 'Солярис', author: 'Станислав Лем', year: 1961, rating: 4.1, coverId: null },
  { id: 'OL2W', title: 'Дюна', author: 'Фрэнк Герберт', year: 1965, rating: null, coverId: null },
];

// Временная проверка: в Шаге 9 заменится настоящим App.
export function App() {
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  return (
    <main className="page">
      <BookList
        books={BOOKS}
        wishlist={wishlist}
        onToggleWish={(book) => setWishlist((prev) => toggleWish(prev, book))}
        onOpen={() => undefined}
      />
      <Pagination page={page} totalPages={3} onChange={setPage} />
    </main>
  );
}