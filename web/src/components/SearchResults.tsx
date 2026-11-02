import { formatFound, getEmptyMessage, getView, totalPages } from '../lib/books';
import type { SearchState, WishItem } from '../types';
import { BookList } from './BookList';
import { EmptyState } from './EmptyState';
import { ErrorBox } from './ErrorBox';
import { Pagination } from './Pagination';
import { Spinner } from './Spinner';

interface SearchResultsProps {
  state: SearchState;
  query: string;
  page: number;
  wishlist: WishItem[];
  onToggleWish: (book: WishItem) => void;
  onOpen: (id: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export function SearchResults({
  state,
  query,
  page,
  wishlist,
  onToggleWish,
  onOpen,
  onPageChange,
  onRetry,
}: SearchResultsProps) {
  const view = getView(state);
  return (
    <section className="catalog__content" aria-labelledby="list-title">
      <h2 id="list-title" aria-live="polite">
        {view === 'success' ? formatFound(state.total) : 'Результаты'}
      </h2>
      {view === 'loading' ? <Spinner /> : null}
      {view === 'error' && state.error !== null ? <ErrorBox message={state.error.message} onRetry={onRetry} /> : null}
      {view === 'empty' ? <EmptyState>{getEmptyMessage(query)}</EmptyState> : null}
      {view === 'success' ? (
        <>
          <BookList books={state.results} wishlist={wishlist} onToggleWish={onToggleWish} onOpen={onOpen} />
          <Pagination page={page} totalPages={totalPages(state.total)} onChange={onPageChange} />
        </>
      ) : null}
    </section>
  );
}