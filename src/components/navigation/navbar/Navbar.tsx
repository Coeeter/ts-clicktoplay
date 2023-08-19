import Link from 'next/link';
import { getServerSession } from '@/lib/auth';
import { NavbarItem, NavbarItemProps } from './NavbarItem';
import { ProfileButton } from './ProfileButton';
import Image from 'next/image';

export const Navbar = async () => {
  const session = await getServerSession();
  const navItems: NavbarItemProps[] = [
    session?.user
      ? { name: 'Upload Songs', href: '/songs/upload' }
      : { name: 'Login', href: '/login', callbackUrl: true },
  ];

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
          {navItems.map((item, i) => (
            <NavbarItem key={i} {...item} />
          ))}
          {session?.user ? <ProfileButton session={session} /> : null}
        </div>
      </div>
    </nav>
  );
};
