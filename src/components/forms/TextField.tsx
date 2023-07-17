'use client';

import { DetailedHTMLProps, InputHTMLAttributes, forwardRef } from 'react';

type TextFieldProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, ...props }: TextFieldProps, ref) => {
    props.id = props.id ?? label;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={props.id}>{label}</label>
        <div className="flex flex-col gap-1">
          <input
            ref={ref}
            className="bg-slate-700 p-3 rounded-md outline-none text-slate-300 focus:outline-blue-600"
            {...props}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </div>
    );
  }
);
