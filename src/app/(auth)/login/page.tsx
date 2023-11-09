import LoginForm from './LoginForm';
import { Metadata } from 'next';

type LoginProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export const metadata: Metadata = {
  title: 'Log in | ClickToPlay',
};

export default async function Login({ searchParams }: LoginProps) {
  let callbackUrl = searchParams?.callbackUrl;

  if (callbackUrl && typeof callbackUrl !== 'string') {
    callbackUrl = callbackUrl[0];
  }

  return <LoginForm callbackUrl={callbackUrl ?? '/'} />;
}
