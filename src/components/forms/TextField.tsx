'use client';

import { DetailedHTMLProps, InputHTMLAttributes, forwardRef } from 'react';

type TextFieldProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label: string;
  error?: string;
  variant?: 'input' | 'textarea';
  height?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, variant, height, ...props }: TextFieldProps, ref) => {
    props.id = props.id ?? label;
    variant = variant ?? 'input';

    return (
      <div
        className={`flex flex-col gap-2 ${height ?? ''} ${
          props.className ?? ''
        }`}
      >
        <label htmlFor={props.id}>{label}</label>
        <div className={`flex flex-col gap-1 ${height ?? ''}`}>
          {variant === 'textarea' ? (
            <textarea
              {...(props as any)}
              ref={ref as any}
              className={`bg-slate-700 p-3 rounded-md outline-none text-slate-300 focus:outline-blue-600 h-48 resize-none ${height}`}
            ></textarea>
          ) : (
            <input
              {...props}
              ref={ref as any}
              className={`bg-slate-700 p-3 rounded-md outline-none text-slate-300 focus:outline-blue-600`}
            />
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </div>
    );
  }
);
