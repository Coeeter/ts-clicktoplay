import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/auth';

import LoginForm from './LoginForm';
import { Metadata } from 'next';

type LoginProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export const metadata: Metadata = {
  title: 'Log in | ClickToPlay',
}

export default async function Login({ searchParams }: LoginProps) {
  let callbackUrl = searchParams?.callbackUrl;

  if (callbackUrl && typeof callbackUrl !== 'string') {
    callbackUrl = callbackUrl[0];
  }

  const session = await getServerSession();

  if (session) {
    return redirect(callbackUrl ?? '/');
  }

  return <LoginForm callbackUrl={callbackUrl ?? '/'} />;
}
