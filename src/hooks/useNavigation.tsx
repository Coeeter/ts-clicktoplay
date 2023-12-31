'use client';

import { useNavbarStore } from '@/store/NavbarStore/NavbarStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { forwardRef, useEffect, useMemo } from 'react';
import { create } from 'zustand';

type UseNavigationReturn = {
  router: ReturnType<typeof useRouter>;
  backstack: string[];
  currentIndex: number;
  hasForward: boolean;
  hasBack: boolean;
  setBackstack: (backstack: string[]) => void;
  setCurrentIndex: (currentIndex: number) => void;
  routerFired: boolean;
  setRouterFired: (routerFired: boolean) => void;
};

type UseNavigationArgs = [
  routerListener?: <T extends keyof ReturnType<typeof useRouter>>(
    type: T,
    ...args: Parameters<ReturnType<typeof useRouter>[T]>
  ) => void
];

type UseNavigation = (...args: UseNavigationArgs) => UseNavigationReturn;

type NavigationStore = {
  backstack: string[];
  currentIndex: number;
  routerFired: boolean;
  setBackstack: (backstack: string[]) => void;
  setCurrentIndex: (currentIndex: number) => void;
  setRouterFired: (routerFired: boolean) => void;
};

const useNavigationStore = create<NavigationStore>(set => ({
  backstack: [],
  currentIndex: 0,
  routerFired: false,
  setBackstack: backstack => set({ backstack }),
  setCurrentIndex: currentIndex => set({ currentIndex }),
  setRouterFired: routerFired => set({ routerFired }),
}));

export const useNavigation: UseNavigation = listener => {
  const router = useRouter();

  const backstack = useNavigationStore(state => state.backstack);
  const setBackstack = useNavigationStore(state => state.setBackstack);

  const currentIndex = useNavigationStore(state => state.currentIndex);
  const setCurrentIndex = useNavigationStore(state => state.setCurrentIndex);

  const routerFired = useNavigationStore(state => state.routerFired);
  const setRouterFired = useNavigationStore(state => state.setRouterFired);

  const hasBack = useMemo(() => currentIndex > 0, [currentIndex]);
  const hasForward = useMemo(
    () => currentIndex < backstack.length - 1,
    [currentIndex, backstack]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!routerFired) return;
      setRouterFired(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [routerFired]);

  return {
    router: {
      prefetch: (...args) => {
        listener?.('prefetch', ...args);
        setRouterFired(true);
        router.prefetch(...args);
      },
      refresh: (...args) => {
        listener?.('refresh', ...args);
        setRouterFired(true);
        router.refresh(...args);
      },
      back: () => {
        if (currentIndex === 0) return;
        listener?.('back');
        setRouterFired(true);
        setCurrentIndex(currentIndex - 1);
        router.back();
      },
      forward: () => {
        if (currentIndex === backstack.length - 1) return;
        listener?.('forward');
        setRouterFired(true);
        setCurrentIndex(currentIndex + 1);
        router.forward();
      },
      push: (...args) => {
        listener?.('push', ...args);
        setRouterFired(true);
        const newBackstack = backstack.length
          ? [...backstack.slice(0, currentIndex + 1), args[0]]
          : [args[0]];
        setBackstack(newBackstack);
        setCurrentIndex(newBackstack.length - 1);
        router.push(...args);
      },
      replace: (...args) => {
        listener?.('replace', ...args);
        setRouterFired(true);
        const newBackstack = [...backstack];
        newBackstack[currentIndex] = args[0];
        setBackstack(newBackstack);
        router.replace(...args);
      },
    },
    backstack,
    currentIndex,
    setBackstack,
    setCurrentIndex,
    hasForward,
    hasBack,
    routerFired,
    setRouterFired,
  };
};

type ToNavigate = boolean | undefined | void;

type NavigationLinkProps = Omit<Parameters<typeof Link>[0], 'onClick'> & {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => ToNavigate;
};

export const NavigationLink = forwardRef<
  HTMLAnchorElement,
  NavigationLinkProps
>(({ children, ...props }: NavigationLinkProps, ref) => {
  const router = useNavigationRouter();
  const setSticky = useNavbarStore(state => state.setSticky);
  const collapsePx = useNavbarStore(state => state.collapsePx);
  const pathname = usePathname();

  useEffect(() => {
    const scrollElement = document.getElementById('root')!;
    setSticky(scrollElement.scrollTop > (collapsePx ?? 64));
  }, [pathname, collapsePx]);

  return (
    <Link
      ref={ref}
      {...props}
      onClick={e => {
        e.preventDefault();
        const result = props.onClick?.(e);
        if (typeof result === 'boolean' && result !== true) return;
        router.push(props.href.toString());
      }}
      prefetch
    >
      {children}
    </Link>
  );
});

export const useNavigationRouter = () => useNavigation().router;
