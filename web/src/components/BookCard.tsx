import { coverUrl, formatByline, formatRating } from '../lib/books';
import type { Book, WishItem } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';

interface BookCardProps {
  book: Book;
  inWishlist: boolean;
  onToggleWish: (book: WishItem) => void;
  onOpen: (id: string) => void;
}

export function BookCard({ book, inWishlist, onToggleWish, onOpen }: BookCardProps) {
  return (
    <article className="card">
      <h3>{book.title}</h3>
      <p>{formatByline(book)}</p>
      <p>
        <Badge>{formatRating(book.rating)}</Badge>
      </p>
      <img
        src={coverUrl(book.coverId)}
        alt={`Обложка книги «${book.title}»`}
        width={200}
        height={300}
        loading="lazy"
      />
      {/* Последний блок карточки прижимается к низу (см. .card > :last-child в components.css). */}
      <footer className="card__footer">
        <Button onClick={() => onOpen(book.id)}>Подробнее</Button>
        <Button pressed={inWishlist} onClick={() => onToggleWish(book)}>
          Хочу прочитать
        </Button>
      </footer>
    </article>
  );
}