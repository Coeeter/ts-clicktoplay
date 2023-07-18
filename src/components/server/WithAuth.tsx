import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  userId?: string;
  callbackUrl?: string;
};

export const WithAuth = async ({ children, userId, callbackUrl }: Props) => {
  const session = await getServerSession();
  callbackUrl = callbackUrl || '/';

  if (!session?.user || (userId && session.user.id !== userId)) {
    return redirect(callbackUrl);
  }

  return <>{children}</>;
};
