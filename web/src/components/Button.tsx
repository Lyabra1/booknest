import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  pressed?: boolean; // для кнопок-переключателей: «Хочу прочитать»
  ariaLabel?: string;
}

export function Button({ children, onClick, type = 'button', disabled = false, pressed, ariaLabel }: ButtonProps) {
  return (
    <button type={type} className="btn" onClick={onClick} disabled={disabled} aria-pressed={pressed} aria-label={ariaLabel}>
      {children}
    </button>
  );
}