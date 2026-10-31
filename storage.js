const KEY = 'booknest:state:v1';

export function loadSaved() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    // Испорченный JSON или недоступное хранилище: начинаем с чистого состояния.
    return {};
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Хранилище переполнено или запрещено (приватный режим): приложение работает без сохранения.
  }
}