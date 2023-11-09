'use client';
import { useToolTip } from '@/hooks/useToolTip';
import { useNavbarStore } from '@/store/NavbarStore/NavbarStore';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { ProfileButton } from './ProfileButton';
import { NavigationLink, useNavigation } from '@/hooks/useNavigation';
import { useMounted } from '@/hooks/useMounted';

type NavbarContentProps = {
  session: Session | null;
};

export const NavbarContent = ({ session }: NavbarContentProps) => {
  const {
    router,
    backstack,
    setBackstack,
    currentIndex,
    setCurrentIndex,
    hasBack,
    hasForward,
    routerFired,
  } = useNavigation();
  const isMounted = useMounted();

  const heightRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const sticky = useNavbarStore(state => state.sticky);
  const setSticky = useNavbarStore(state => state.setSticky);
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
    if (routerFired) return;
    if (pathname === backstack[currentIndex]) return;
    if (pathname === backstack.at(currentIndex + 1)) {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    if (pathname === backstack.at(currentIndex - 1)) {
      setCurrentIndex(currentIndex - 1);
      return;
    }
  }, [pathname, backstack, currentIndex]);

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
                router.back();
              }}
              disabled={!isMounted || !hasBack}
              className="bg-slate-900/70 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
              {...registerForBackBtn({
                place: 'bottom-center',
              })}
            >
              <MdNavigateBefore size={36} />
            </button>
            <button
              onClick={router.forward}
              disabled={!isMounted || !hasForward}
              className="bg-slate-900/70 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
              {...registerForFrontBtn({
                place: 'bottom-center',
              })}
            >
              <MdNavigateNext size={36} />
            </button>
          </div>
          {content
            ? content.sticky
              ? sticky && content.node
              : content.node
            : null}
        </div>
        <div className="flex items-center gap-6">
          {session?.user ? (
            <ProfileButton session={session} />
          ) : (
            <NavigationLink
              href="/login"
              className={`text-lg font-semibold hover:text-slate-200 transition duration-150 ${
                pathname === '/login' ? 'text-slate-200' : 'text-slate-300/75'
              }`}
            >
              Sign in
            </NavigationLink>
          )}
        </div>
      </div>
    </nav>
  );
};
