'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@/components/forms/Button';
import { TextField } from '@/components/forms/TextField';
import { useToastStore } from '@/store/ToastStore';

type SignInWithEmailValues = {
  email: string;
};

type LoginFormProps = {
  callbackUrl: string | null;
};

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createToast = useToastStore(state => state.createToast);
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
    <div className="flex flex-col gap-5 bg-slate-900 p-6 rounded-md max-w-md w-full mx-auto mt-[calc(64px+1.5rem)]">
      <button
        onClick={() => signIn('google', { callbackUrl: callback })}
        className="bg-slate-200 p-3 rounded-md text-slate-800 hover:bg-slate-300 transition-all duration-150 flex justify-center gap-2"
      >
        <img src="/google-logo.png" alt="Google Logo" width={24} height={24} />
        <div>Sign in with Google</div>
      </button>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full h-0.5 bg-slate-700 relative pointer-events-none select-none my-1">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-slate-900 px-2 text-md">or</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <TextField
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Email is invalid',
              },
            })}
            error={errors.email?.message}
            label="Email"
          />
        </div>
        <Button type="submit" isLoading={isLoading}>
          Sign in using email
        </Button>
      </form>
    </div>
  );
}
