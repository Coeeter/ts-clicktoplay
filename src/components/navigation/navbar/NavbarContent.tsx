'use client';
import { ProfileButton } from './ProfileButton';
import { Session } from 'next-auth';
import { useEffect, useRef, useState } from 'react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { useToolTip } from '@/hooks/useToolTip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavbarContentProps = {
  session: Session | null;
};

export const NavbarContent = ({ session }: NavbarContentProps) => {
  const [sticky, setSticky] = useState(false);
  const heightRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { register: registerForBackBtn } = useToolTip({
    content: 'Go back',
  });

  const { register: registerForFrontBtn } = useToolTip({
    content: 'Go forward',
  });

  useEffect(() => {
    const element = document.getElementById('root')!;

    const handleScroll = () => {
      setSticky(element.scrollTop >= (heightRef.current?.offsetHeight ?? 0));
    };

    document.getElementById('root')?.addEventListener('scroll', handleScroll);

    return () =>
      document
        .getElementById('root')
        ?.removeEventListener('scroll', handleScroll);
  }, [heightRef]);

  return (
    <nav
      className={`sticky top-0 w-full z-10 text-slate-300 rounded-md -mb-[64px] ${
        sticky ? 'shadow-xl bg-slate-700' : 'bg-transparent'
      }`}
      ref={heightRef}
    >
      <div className="mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            disabled={false}
            className="bg-slate-900/70 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
            {...registerForBackBtn({
              place: 'bottom-center',
            })}
          >
            <MdNavigateBefore size={36} />
          </button>
          <button
            onClick={() => {}}
            disabled={false}
            className="bg-slate-900/70 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
            {...registerForFrontBtn({
              place: 'bottom-center',
            })}
          >
            <MdNavigateNext size={36} />
          </button>
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
