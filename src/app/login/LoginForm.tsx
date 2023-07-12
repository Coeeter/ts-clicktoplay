'use client';

import { useToast } from '@/components/ToastProvider';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type SignInWithEmailValues = {
  email: string;
};

type LoginFormProps = {
  callbackUrl: string | null;
};

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createToast } = useToast();
  const callback = callbackUrl ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInWithEmailValues>();

  const onSubmit: SubmitHandler<SignInWithEmailValues> = async ({ email }) => {
    try {
      setIsLoading(true);
      await signIn('email', { email, callbackUrl: callback });
    } catch (e) {
      createToast(
        'An error occurred while sending the email. Please try again later.',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="flex flex-col gap-5 bg-slate-800 p-6 rounded-md max-w-md w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <button
          onClick={() => signIn('google', { callbackUrl: callback })}
          className="bg-slate-200 p-3 rounded-md text-slate-800 hover:bg-slate-300 transition-all duration-150 flex justify-center gap-2"
        >
          <Image
            src="/google-logo.png"
            alt="Google Logo"
            width={24}
            height={24}
          />
          <div>Sign in with Google</div>
        </button>
        <form className="flex flex-col gap-5">
          <div className="w-full h-0.5 bg-slate-700 relative pointer-events-none select-none my-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-slate-800 px-2 text-md">or</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Email is invalid',
                },
              })}
              placeholder="Email"
              className="bg-slate-700 p-3 rounded-md outline-none text-slate-300 focus:outline-blue-600"
            />
            {errors.email && (
              <div className="text-red-600 text-sm">{errors.email.message}</div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-700 p-3 rounded-md text-slate-300 hover:bg-blue-800 transition-all duration-150 relative disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-slate-300  disabled:transition-none disabled:duration-0"
          >
            {isLoading && (
              <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-slate-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            )}
            <div className={isLoading ? 'opacity-0' : 'opacity-100'}>
              Sign in using email
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
