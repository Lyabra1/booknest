import { Button } from './Button';

interface ErrorBoxProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <p className="status status--error" role="alert">
      <span>{message}</span>
      {onRetry !== undefined ? <Button onClick={onRetry}>Повторить</Button> : null}
    </p>
  );
}