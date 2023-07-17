'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const WithAuth = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const router = useRouter();

  if (session.status !== 'loading' && !session.data?.user) {
    router.push('/');
    return <div>Redirecting</div>;
  }

  return children;
};
