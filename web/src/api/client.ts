// Единственное место в проекте, где вызывается fetch.
const BASE_URL = 'https://openlibrary.org';

export class ApiError extends Error {
  readonly status: number; // 0 = ответа не было (нет сети), иначе HTTP-код

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

type Params = Record<string, string | number | undefined>;

export async function request<T>(path: string, params: Params = {}, signal?: AbortSignal): Promise<T> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  const queryString = query.toString();
  const url = queryString === '' ? `${BASE_URL}${path}` : `${BASE_URL}${path}?${queryString}`;

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw error; // отмену выбрасываем как есть: это не сбой сети
    }
    throw new ApiError(0, 'Нет связи с сервером');
  }

  // fetch не бросает ошибку на 404 и 500: ответ пришёл, просто плохой. Проверяем сами.
  if (!response.ok) {
    throw new ApiError(response.status, `Ответ сервера: ${response.status}`);
  }
  // T здесь обещание, а не проверка: JSON из сети может быть любым. Реально поля проверяют
  // функции разбора в lib/books.ts (поэтому поля в типах ответов объявлены как unknown).
  return (await response.json()) as T;
}