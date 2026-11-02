interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Загрузка…' }: SpinnerProps) {
  return (
    <p className="status" role="status">
      <span className="Spinner" aria-hidden="true" />
      {label}
    </p>
  );
}