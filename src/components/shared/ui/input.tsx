// src/components/ui/input.tsx
// Simple input components without external dependencies

import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none ${className || ''}`}
      {...props}
    />
  );
});

Label.displayName = 'Label';

export const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, onCheckedChange, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      className={`h-5 w-5 rounded ${className || ''}`}
      ref={ref}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  );
});

Switch.displayName = 'Switch';