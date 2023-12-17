import { AuthSession, getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

type Options<T> = {
  callbackUrl?: (props: T) => `/${string}`;
  hasPermissions?: (
    userId: string | undefined | null,
    props: T
  ) => Promise<boolean> | boolean;
};

export const withAuth = <T,>(
  Component: React.FC<
    T & {
      session: AuthSession | null;
    }
  >,
  options: Options<T> = {
    hasPermissions: () => true,
  }
) => {
  return async (props: T) => {
    const { callbackUrl, hasPermissions } = options;
    const session = await getServerSession();

    if (!session) {
      redirect(
        callbackUrl ? `/login?callbackUrl=${callbackUrl(props)}` : '/login'
      );
    }

    if ((await hasPermissions?.(session?.user.id, props)) === false) {
      redirect('/');
    }

    return (
      <Component
        {...{
          ...props,
          session,
        }}
      />
    );
  };
};
