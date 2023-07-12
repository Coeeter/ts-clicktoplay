import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

type LoginProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

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
