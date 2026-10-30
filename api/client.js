// Единственное место в проекте, где вызывается fetch.
const BASE_URL = 'https://openlibrary.org';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = ответа не было (нет сети), иначе HTTP-код
  }
}

export async function request(path, params = {}, signal) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  const queryString = query.toString();
  const url = queryString === '' ? `${BASE_URL}${path}` : `${BASE_URL}${path}?${queryString}`;

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // отмену выбрасываем как есть: это не сбой сети
    }
    throw new ApiError(0, 'Нет связи с сервером');
  }

  // fetch не бросает ошибку на 404 и 500: ответ пришёл, просто плохой. Проверяем сами.
  if (!response.ok) {
    throw new ApiError(response.status, `Ответ сервера: ${response.status}`);
  }
  return response.json();
}