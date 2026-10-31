import { coverUrl, formatBookRating } from '../lib/books';
import type { BookDetails as BookDetailsData, WishItem } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';

interface BookDetailsProps {
  book: BookDetailsData;
  inWishlist: boolean;
  onToggleWish: (book: WishItem) => void;
}

export function BookDetails({ book, inWishlist, onToggleWish }: BookDetailsProps) {
  const author = book.authors.length > 0 ? book.authors.join(', ') : 'Автор неизвестен';
  return (
    <article>
      <figure>
        <img
          src={coverUrl(book.coverId, 'L')}
          alt={`Обложка книги «${book.title}»`}
          width={200}
          height={300}
        />
      </figure>

      <section aria-labelledby="specs-title">
        <h2 id="specs-title">Характеристики</h2>
        <dl className="specs">
          <dt>Автор</dt>
          <dd>{author}</dd>
          <dt>Первая публикация</dt>
          <dd>{book.published ?? 'Неизвестно'}</dd>
          <dt>Рейтинг</dt>
          <dd>
            <Badge>{formatBookRating(book)}</Badge>
          </dd>
          <dt>Темы</dt>
          <dd>{book.subjects.length > 0 ? book.subjects.join(', ') : 'Не указаны'}</dd>
        </dl>
      </section>

      <section aria-labelledby="desc-title">
        <h2 id="desc-title">Описание</h2>
        <p className="book__description">
          {book.description === '' ? 'Описание отсутствует.' : book.description}
        </p>
      </section>

      <Button pressed={inWishlist} onClick={() => onToggleWish({ id: book.id, title: book.title, author })}>
        Хочу прочитать
      </Button>
    </article>
  );
}