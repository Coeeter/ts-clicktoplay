'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type SidebarItemProps = {
  name: string;
  href: string;
  icon: JSX.Element;
};

export const SidebarLink = ({ name, href, icon }: SidebarItemProps) => {
  const pathName = usePathname();

  return (
    <Link
      href={href}
      className={`text-md hover:text-slate-200 duration-150 font-semibold ${
        pathName === href ? 'text-slate-200' : 'text-slate-300/50'
      }`}
    >
      <div className="flex items-center gap-4">
        {icon}
        {name}
      </div>
    </Link>
  );
};
