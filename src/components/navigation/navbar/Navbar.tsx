import { getServerSession } from '@/lib/auth';
import { NavbarContent } from './NavbarContent';

export const Navbar = async () => {
  const session = await getServerSession();

  return <NavbarContent session={session} />;
};
