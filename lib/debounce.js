// Откладывает вызов функции: если её вызвали снова раньше, чем прошло delayMs, отсчёт начинается заново.
export function debounce(fn, delayMs) {
  let timerId;
  const debounced = (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delayMs);
  };
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}