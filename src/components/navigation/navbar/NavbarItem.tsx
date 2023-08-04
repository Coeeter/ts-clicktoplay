'use client';

import { useCallbackUrl } from '@/hooks/useCallbackUrl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavbarItemProps = {
  name: string;
  href: string;
  callbackUrl?: boolean;
};

export const NavbarItem = ({
  name,
  href,
  callbackUrl = false,
}: NavbarItemProps) => {
  const pathName = usePathname();
  href = callbackUrl
    ? `${href}?callbackUrl=${useCallbackUrl({ checkForPathname: href })}`
    : href;

  return (
    <Link
      key={name}
      href={href}
      className={`text-md hover:text-slate-200 duration-150 font-semibold ${
        pathName === href.split('?')[0] ? 'text-slate-200' : 'text-slate-300/50'
      }`}
    >
      {name}
    </Link>
  );
};
