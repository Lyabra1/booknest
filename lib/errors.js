// Превращает ошибку в понятный текст. Три разных случая: нет сети, ошибка запроса (4xx), ошибка сервера (5xx).
export function describeError(error) {
  const status = error?.status;
  if (status === 0) {
    return 'Нет связи с интернетом. Проверьте подключение и нажмите «Повторить».';
  }
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return `Сервер отклонил запрос (код ${status}). Измените запрос или попробуйте позже.`;
  }
  if (typeof status === 'number' && status >= 500) {
    return `Сервер Open Library сейчас недоступен (код ${status}). Повторите через минуту.`;
  }
  return 'Не удалось обработать ответ сервера. Попробуйте ещё раз.';
}