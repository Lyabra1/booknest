import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Страницы результатов">
      <Button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Назад
      </Button>
      <p>
        Страница {page} из {totalPages}
      </p>
      <Button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Вперёд
      </Button>
    </nav>
  );
}