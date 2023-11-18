import { FaFolderOpen } from 'react-icons/fa';
import { NavigationLink } from './navigation-link';
import { MdHome, MdSearch } from 'react-icons/md';
import { BiSolidCloudUpload } from 'react-icons/bi';

export const navigationBarItems = [
  {
    name: 'Home',
    href: '/',
    icon: <MdHome size={32} />,
  },
  {
    name: 'Search',
    href: '/search',
    icon: <MdSearch size={32} />,
  },
  {
    name: 'Upload Songs',
    href: '/songs/upload',
    icon: <BiSolidCloudUpload size={32} />,
  },
  {
    name: 'Library',
    href: '/library',
    icon: <FaFolderOpen size={32} />,
  },
] as const;

export const BottomNavigationBar = () => {
  return (
    <nav className="absolute bottom-0 shadow-lg w-full flex items-center justify-evenly md:hidden bg-slate-700 p-3 px-0 min-h-[64px]">
      {navigationBarItems.map(item => (
        <NavigationLink key={item.name} item={item} />
      ))}
    </nav>
  );
};

export default BottomNavigationBar;
