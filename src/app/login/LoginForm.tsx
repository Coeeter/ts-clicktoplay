'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@/components';
import { useToast } from '@/components/providers';

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
    <div className="flex flex-col gap-5 bg-slate-800 p-6 rounded-md max-w-md w-full mx-auto mt-6">
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
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
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
        <Button type="submit" isLoading={isLoading}>
          Sign in using email
        </Button>
      </form>
    </div>
  );
}
