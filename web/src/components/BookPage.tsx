import { useState } from 'react';
import { useBook } from '../hooks/useBook';
import { getBookView } from '../lib/books';
import type { WishItem } from '../types';
import { BookDetails } from './BookDetails';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { ErrorBox } from './ErrorBox';
import { Spinner } from './Spinner';

interface BookPageProps {
  id: string;
  inWishlist: boolean;
  onBack: () => void;
  onToggleWish: (book: WishItem) => void;
}

export function BookPage({ id, inWishlist, onBack, onToggleWish }: BookPageProps) {
  const [attempt, setAttempt] = useState(0);
  const state = useBook(id, attempt);
  const view = getBookView(state);
  const title = view === 'success' && state.book !== null ? state.book.title : 'Книга';

  return (
    <>
      <nav className="crumbs" aria-label="Хлебные крошки">
        <ol>
          <li>
            <Button onClick={onBack}>Каталог</Button>
          </li>
          <li aria-current="page">{title}</li>
        </ol>
      </nav>

      <h1>{title}</h1>

      {view === 'loading' ? <Spinner /> : null}
      {view === 'error' && state.error !== null ? (
        <ErrorBox message={state.error.message} onRetry={() => setAttempt((value) => value + 1)} />
      ) : null}
      {view === 'notfound' ? <EmptyState>Книга не найдена.</EmptyState> : null}
      {view === 'success' && state.book !== null ? (
        <BookDetails book={state.book} inWishlist={inWishlist} onToggleWish={onToggleWish} />
      ) : null}
    </>
  );
}