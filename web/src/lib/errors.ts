import type { ErrorInfo } from '../types';
import { isRecord } from './guards';

function statusOf(error: unknown): number | null {
  return isRecord(error) && typeof error.status === 'number' ? error.status : null;
}

// Превращает ошибку в понятный текст. Три разных случая: нет сети, ошибка запроса (4xx), ошибка сервера (5xx).
export function describeError(error: unknown): string {
  const status = statusOf(error);
  if (status === 0) {
    return 'Нет связи с интернетом. Проверьте подключение и нажмите «Повторить».';
  }
  if (status !== null && status >= 400 && status < 500) {
    return `Сервер отклонил запрос (код ${status}). Измените запрос или попробуйте позже.`;
  }
  if (status !== null && status >= 500) {
    return `Сервер Open Library сейчас недоступен (код ${status}). Повторите через минуту.`;
  }
  return 'Не удалось обработать ответ сервера. Попробуйте ещё раз.';
}

export function toErrorInfo(error: unknown): ErrorInfo {
  return { status: statusOf(error), message: describeError(error) };
}