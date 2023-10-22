'use client';

import Image from 'next/image';
import { NavbarItem, NavbarItemProps } from './NavbarItem';
import Link from 'next/link';
import { ProfileButton } from './ProfileButton';
import { Session } from 'next-auth';

type NavbarContentProps = {
  session: Session | null;
  items: NavbarItemProps[];
};

export const NavbarContent = ({ items, session }: NavbarContentProps) => {
  return (
    <nav className="bg-slate-800 text-slate-300 rounded-md">
      <div className="mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-3xl text-slate-200 font-bold flex items-center"
        >
          <Image
            src="/brand/icon.png"
            alt="ClickToPlay"
            width={32}
            height={32}
            className="w-8 h-8 mr-2"
          />
          <span>ClickToPlay</span>
        </Link>
        <div className="flex items-center gap-6">
          {items.map((item, i) => (
            <NavbarItem key={i} {...item} />
          ))}
          {session?.user ? <ProfileButton session={session} /> : null}
        </div>
      </div>
    </nav>
  );
};
