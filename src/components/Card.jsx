import { clsx } from 'clsx';

/**
 * Reusable card with optional gradient header
 */
const Card = ({
  children,
  className = '',
  gradient = false,
  onClick,
  padding = true,
}) => {
  const base = 'rounded-2xl transition-all duration-200';
  const style = gradient
    ? 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-eco'
    : 'bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-gray-800';
  const clickable = onClick ? 'cursor-pointer active:scale-[0.99]' : '';
  const pad = padding ? 'p-5' : '';

  return (
    <div className={clsx(base, style, clickable, pad, className)} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
