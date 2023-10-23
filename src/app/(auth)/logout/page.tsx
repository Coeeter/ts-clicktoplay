import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/auth';

import LogoutForm from './LogoutForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Out | ClickToPlay',
}

export default async function Logout({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const callbackUrl =
    typeof searchParams?.callbackUrl === 'string'
      ? searchParams.callbackUrl
      : searchParams?.callbackUrl?.[0] ?? '/';

  const session = await getServerSession();

  if (!session) {
    return redirect(callbackUrl ?? '/');
  }

  return <LogoutForm callbackUrl={callbackUrl} />;
}
