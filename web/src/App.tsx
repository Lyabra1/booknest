import { useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { BookPage } from './components/BookPage';
import { FiltersPanel } from './components/FiltersPanel';
import { SearchResults } from './components/SearchResults';
import { WishlistPanel } from './components/WishlistPanel';
import { useBookSearch } from './hooks/useBookSearch';
import { useSearchRequest } from './hooks/useSearchRequest';
import { useWishlist } from './hooks/useWishlist';
import { isWished } from './lib/books';

export function App() {
  const filters = useSearchRequest();
  const search = useBookSearch(filters.request);
  const wishlist = useWishlist();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <AppHeader wishlistCount={wishlist.items.length} />
      {openId === null ? (
        <main className="page page--catalog">
          <h1>Каталог книг</h1>
          <FiltersPanel
            text={filters.text}
            sort={filters.request.sort}
            onTextChange={filters.changeText}
            onSortChange={filters.changeSort}
            onSubmit={filters.submit}
            onReset={filters.reset}
          />
          <SearchResults
            state={search}
            query={filters.request.query}
            page={filters.request.page}
            wishlist={wishlist.items}
            onToggleWish={wishlist.toggle}
            onOpen={setOpenId}
            onPageChange={filters.changePage}
            onRetry={filters.retry}
          />
          <WishlistPanel items={wishlist.items} onToggle={wishlist.toggle} />
        </main>
      ) : (
        <main className="page page--narrow">
          <BookPage
            id={openId}
            inWishlist={isWished(wishlist.items, openId)}
            onBack={() => setOpenId(null)}
            onToggleWish={wishlist.toggle}
          />
        </main>
      )}
      <AppFooter />
    </>
  );
}