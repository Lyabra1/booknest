import { useRef } from 'react';
import type { WishItem } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

interface WishlistPanelProps {
  items: WishItem[];
  onToggle: (book: WishItem) => void;
}

export function WishlistPanel({ items, onToggle }: WishlistPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleRemove = (item: WishItem) => {
    onToggle(item);
    headingRef.current?.focus(); // кнопка исчезнет, фокус не должен потеряться
  };

  return (
    <section className="panel catalog__wishlist" aria-labelledby="wishlist-title">
      <h2 id="wishlist-title" tabIndex={-1} ref={headingRef}>
        Мой список <Badge>{items.length}</Badge>
      </h2>
      {items.length === 0 ? (
        <EmptyState>Список пуст. Нажмите «Хочу прочитать» на карточке книги.</EmptyState>
      ) : null}
      <ul className="wishlist__list">
        {items.map((item) => (
          <li key={item.id} className="wishlist__item">
            <span>
              {item.title} — {item.author}
            </span>
            <Button ariaLabel={`Удалить «${item.title}» из списка`} onClick={() => handleRemove(item)}>
              Удалить
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}