import { sanitizeWishlist } from './lib/books';
import type { WishItem } from './types';

const KEY = 'booknest:state:v2';

export function loadWishlist(): WishItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) {
      return [];
    }
    const data: unknown = JSON.parse(raw);
    if (typeof data === 'object' && data !== null && 'wishlist' in data) {
      return sanitizeWishlist(data.wishlist);
    }
  } catch {
    // Повреждённый JSON или недоступный localStorage: начинаем с пустого списка.
  }
  return [];
}

export function saveWishlist(items: WishItem[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ wishlist: items }));
  } catch {
    // Хранилище переполнено или запрещено: приложение работает, просто без сохранения.
  }
}