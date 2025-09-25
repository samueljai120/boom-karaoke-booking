import React from 'react';
import { clsx } from 'clsx';

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  };

  return (
    <div
      ref={ref}
      className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variantClasses[variant], className)}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge };
