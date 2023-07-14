import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/auth';

type LoginProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function Login({ searchParams }: LoginProps) {
  const LoginForm = (await import('./LoginForm')).default;
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
