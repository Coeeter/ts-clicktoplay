import { getServerSession } from '@/lib/auth';
import { NavbarItemProps } from './NavbarItem';
import { NavbarContent } from './NavbarContent';

export const Navbar = async () => {
  const session = await getServerSession();
  const navItems: NavbarItemProps[] = [
    session?.user
      ? { name: 'Upload Songs', href: '/songs/upload' }
      : { name: 'Login', href: '/login', callbackUrl: true },
  ];

  return <div className='relative'>
    <NavbarContent items={navItems} session={session} />
  </div>;
};
