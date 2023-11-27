'use client';

import { AuthSession } from '@/lib/auth';
import { useSession, UseSessionOptions } from 'next-auth/react';

type UseSessionReturn = ReturnType<typeof useSession>;

type UseClientSessionReturn = {
  [Key in keyof UseSessionReturn as Key extends 'data'
    ? 'session'
    : Key]: Key extends 'data' ? AuthSession | null : UseSessionReturn[Key];
};

type UseClientSession = <R extends boolean>(
  options?: UseSessionOptions<R>
) => UseClientSessionReturn;

export const useClientSession: UseClientSession = options => {
  const { data, status, update } = useSession(options);
  const session = data as AuthSession | null;

  return {
    session,
    status,
    update,
  };
};
