'use client';
import { useToolTip } from '@/hooks/useToolTip';
import { useNavbarStore } from '@/store/NavbarStore/NavbarStore';
import { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { ProfileButton } from './ProfileButton';

type NavbarContentProps = {
  session: Session | null;
};

export const NavbarContent = ({ session }: NavbarContentProps) => {
  const [backStack, setBackStack] = useState<string[]>([]);
  const [backStackIndex, setBackStackIndex] = useState<number>(0);
  const isPoppedRef = useRef(false);

  const [sticky, setSticky] = useState(false);
  const heightRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const collapseColor = useNavbarStore(state => state.collapseColor);
  const collapsePixels = useNavbarStore(state => state.collapsePx);
  const content = useNavbarStore(state => state.content);

  const { register: registerForBackBtn } = useToolTip({
    content: 'Go back',
  });

  const { register: registerForFrontBtn } = useToolTip({
    content: 'Go forward',
  });

  useEffect(() => {
    const element = document.getElementById('root')!;

    const handleScroll = () => {
      const pixels = collapsePixels ?? heightRef.current?.offsetHeight ?? 0;
      setSticky(element.scrollTop >= pixels);
    };

    element.addEventListener('scroll', handleScroll);

    return () => element.removeEventListener('scroll', handleScroll);
  }, [heightRef, collapsePixels]);

  useEffect(() => {
    if (backStackIndex !== 0 && pathname === backStack[backStackIndex - 1]) {
      setBackStackIndex(backStackIndex - 1);
      return;
    }
    if (
      backStackIndex !== backStack.length - 1 &&
      pathname === backStack[backStackIndex + 1]
    ) {
      setBackStackIndex(backStackIndex + 1);
      return;
    }
    if (pathname === backStack[backStack.length - 1]) return;
    if (isPoppedRef.current) {
      isPoppedRef.current = false;
      return;
    }
    const newBackStack = [
      ...(backStackIndex === backStack.length - 1
        ? backStack
        : backStack.slice(0, backStackIndex + 1)),
      pathname,
    ];
    setBackStack(newBackStack);
    setBackStackIndex(newBackStack.length - 1);
  }, [pathname, backStack]);

  return (
    <nav
      className={`sticky top-0 w-full z-10 text-slate-300 rounded-t-md transition -mb-[64px] ${
        sticky ? 'shadow-xl' : ''
      }`}
      ref={heightRef}
      style={{
        backgroundColor: sticky
          ? collapseColor ?? 'rgb(51 65 85 / 1)'
          : 'transparent',
      }}
    >
      <div className="mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                isPoppedRef.current = true;
                window.history.back();
                setBackStackIndex(backStackIndex - 1);
              }}
              disabled={backStack.slice(0, backStackIndex).length === 0}
              className="bg-slate-900/70 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
              {...registerForBackBtn({
                place: 'bottom-center',
              })}
            >
              <MdNavigateBefore size={36} />
            </button>
            <button
              onClick={() => {
                isPoppedRef.current = true;
                window.history.forward();
                setBackStackIndex(backStackIndex + 1);
              }}
              disabled={backStackIndex === backStack.length - 1}
              className="bg-slate-900/70 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
              {...registerForFrontBtn({
                place: 'bottom-center',
              })}
            >
              <MdNavigateNext size={36} />
            </button>
          </div>
          {sticky && content}
        </div>
        <div className="flex items-center gap-6">
          {session?.user ? (
            <ProfileButton session={session} />
          ) : (
            <Link
              href="/login"
              className={`text-lg font-semibold hover:text-slate-200 transition duration-150 ${
                pathname === '/login' ? 'text-slate-200' : 'text-slate-300/75'
              }`}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
