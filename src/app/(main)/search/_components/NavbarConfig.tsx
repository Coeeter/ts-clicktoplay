'use client';
import { NavbarMetadata } from '@/components/navigation/navbar/NavbarMetadata';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigationRouter } from '@/hooks/useNavigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const NavbarConfig = () => {
  const router = useNavigationRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (pathname === '/search') {
      setQuery('');
    } else {
      const q = decodeURIComponent(pathname.split('/')[2]);
      setQuery(q);
    }
  }, []);

  useDebounce(query, 500, q => {
    if (!q) {
      if (pathname === '/search') return;
      return router.replace('/search');
    }
    if (pathname.startsWith(`/search/${q}/`)) return;
    router.replace(`/search/${q}`);
  });

  return <NavbarMetadata type="search" onTextChange={setQuery} text={query} />;
};
