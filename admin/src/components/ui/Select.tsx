import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  size?: 'sm' | 'md' | 'lg';
}

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
};

const sizeClasses = {
  sm: 'h-8 px-2 pr-7 text-xs rounded-lg',
  md: 'h-9 px-3 pr-8 text-sm rounded-lg',
  lg: 'h-10 px-3 pr-9 text-sm rounded-lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = 'md', style, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx(
          // Base styles
          'border border-neutral-300 bg-white text-neutral-700',
          'focus:outline-none focus:ring-2 focus:ring-neutral-800/10 focus:border-neutral-500',
          'appearance-none cursor-pointer transition-colors',
          // Size styles
          sizeClasses[size],
          // Custom classes
          className
        )}
        style={{ ...selectStyle, ...style }}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';
