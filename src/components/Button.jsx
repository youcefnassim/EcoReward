import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

/**
 * Primary / secondary / ghost / danger button
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-eco hover:from-green-600 hover:to-green-700 hover:shadow-eco-lg',
    secondary:
      'border-2 border-green-500 text-green-600 bg-transparent hover:bg-green-50 dark:hover:bg-green-950',
    ghost:
      'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
    danger:
      'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    dark:
      'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3.5 text-sm gap-2',
    lg: 'px-6 py-4 text-base gap-2 w-full',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4" />
      )}
      {children}
      {!loading && RightIcon && <RightIcon className="w-4 h-4" />}
    </button>
  );
};

export default Button;
