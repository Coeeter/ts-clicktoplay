import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutForm from './LogoutForm';

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
