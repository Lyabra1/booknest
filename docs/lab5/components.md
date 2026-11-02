# Дерево компонентов BookNest (Лаба 5)

## Дерево

```
App                         ← состояние: openId; хуки useSearchRequest, useBookSearch, useWishlist
├─ AppHeader                ← props: wishlistCount
├─ main (каталог, если openId === null)
│  ├─ FiltersPanel          ← props: text, sort, onTextChange, onSortChange, onSubmit, onReset
│  │  └─ Button (Сбросить)
│  ├─ SearchResults         ← props: state, query, page, wishlist, onToggleWish, onOpen, onPageChange, onRetry
│  │  ├─ Spinner                  (экран «загрузка»)
│  │  ├─ ErrorBox                 (экран «ошибка») → Button (Повторить)
│  │  ├─ EmptyState               (экран «пусто»)
│  │  ├─ BookList                 (экран «успех»)
│  │  │  └─ BookCard ×20 → Badge (рейтинг), Button (Подробнее), Button (Хочу прочитать)
│  │  └─ Pagination        → Button (Назад), Button (Вперёд)
│  └─ WishlistPanel         ← props: items, onToggle
│     ├─ Badge (счётчик)
│     ├─ EmptyState (список пуст)
│     └─ Button (Удалить) ×N
├─ main (страница книги, если openId !== null)
│  └─ BookPage              ← своё состояние: attempt; хук useBook
│     ├─ Button (Каталог)
│     ├─ Spinner / ErrorBox / EmptyState (книга не найдена)
│     └─ BookDetails        → Badge (рейтинг), Button (Хочу прочитать)
└─ AppFooter
```

## Кто владеет состоянием

| Кусок состояния | Владелец | Почему именно он |
| --- | --- | --- |
| text (то, что набрано в поле) | App (хук useSearchRequest) | Пишет FiltersPanel, а Enter и «Сбросить» должны менять его же |
| request (query, sort, page, attempt): параметры запроса | App (хук useSearchRequest) | Пишут FiltersPanel и Pagination, читает хук поиска. Общий родитель только App |
| результат поиска (results, total, error) | App (хук useBookSearch) | Читают SearchResults и, через него, BookList и Pagination |
| wishlist (список «Хочу прочитать») | App (хук useWishlist) | Нужен BookCard, BookDetails и WishlistPanel, плюс localStorage |
| openId (какая книга открыта) | App | Переключает весь экран: каталог или страница книги |
| attempt (повтор запроса книги) | BookPage | Нужен только ей, выше поднимать незачем |

## Что НЕ хранится в состоянии (вычисляется при рендере)

- какой из четырёх экранов показать: `getView(state)`;
- число страниц: `totalPages(total)`;
- заголовок «Найдено N книг», сообщение для пустого экрана;
- лежит ли книга в списке: `isWished(items, id)`;
- «загрузка»: результат отсутствует или получен для другого запроса.

## Презентационные компоненты (без собственного состояния)

AppHeader, AppFooter, FiltersPanel, SearchResults, BookList, BookCard, Pagination, WishlistPanel, BookDetails, Button, Badge, Spinner, EmptyState, ErrorBox.
Компоненты с состоянием: App (через хуки) и BookPage.

