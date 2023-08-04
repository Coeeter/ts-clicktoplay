'use client';

import { signOut } from 'next-auth/react';

import { Button } from '@/components/forms/Button';

export default function LogoutForm({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <div className="flex flex-col gap-5 bg-slate-800 p-6 rounded-md max-w-md w-full mx-auto mt-6">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-xl font-bold text-slate-200">Log Out</h1>
        <p className="text-slate-300">Are you sure you want to log out?</p>
      </div>
      <Button onClick={() => signOut({ callbackUrl })}>Log Out</Button>
    </div>
  );
}
