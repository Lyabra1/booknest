interface AppHeaderProps {
  wishlistCount: number;
}

export function AppHeader({ wishlistCount }: AppHeaderProps) {
  return (
    <header className="site-header">
      <a className="site-header__logo" href="/">
        BookNest
      </a>
      <nav className="site-nav" aria-label="Основная навигация">
        <ul>
          <li>
            <a href="/" aria-current="page">
              Каталог
            </a>
          </li>
          {/* loan.html и profile.html остались в старом проекте: в React-версии они пока не открываются */}
          <li>
            <a href="loan.html">Выдача книги</a>
          </li>
          <li>
            <a href="profile.html">Профиль</a>
          </li>
          <li>
            <a href="#wishlist-title">Мой список ({wishlistCount})</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}