import { useCallback, useEffect, useState } from 'react';
import { toggleWish } from '../lib/books';
import { loadWishlist, saveWishlist } from '../storage';
import type { WishItem } from '../types';

export function useWishlist() {
  // Функция в useState выполнится один раз, при первом показе.
  const [items, setItems] = useState<WishItem[]>(loadWishlist);

  // Сохраняем при каждом изменении списка.
  useEffect(() => {
    saveWishlist(items);
  }, [items]);

  // Функциональная форма: берём актуальный список, а не тот, что был при создании функции.
  const toggle = useCallback((book: WishItem) => {
    setItems((prev) => toggleWish(prev, book));
  }, []);

  return { items, toggle };
}