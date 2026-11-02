import type { Book, WishItem } from '../types';
import { BookCard } from './BookCard';

interface BookListProps {
  books: Book[];
  wishlist: WishItem[];
  onToggleWish: (book: WishItem) => void;
  onOpen: (id: string) => void;
}

export function BookList({ books, wishlist, onToggleWish, onOpen }: BookListProps) {
  // Производное значение: считаем при рендере, в состояние не кладём.
  const wishedIds = new Set(wishlist.map((item) => item.id));
  return (
    <ul className="catalog__grid">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard
            book={book}
            inWishlist={wishedIds.has(book.id)}
            onToggleWish={onToggleWish}
            onOpen={onOpen}
          />
        </li>
      ))}
    </ul>
  );
}