'use client';

import { NavbarMetadata } from '@/components/navigation/navbar/NavbarMetadata';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigationRouter } from '@/hooks/useNavigation';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useNavigationRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (pathname === '/search') {
      setQuery('');
    } else {
      setQuery(pathname.replace('/search/', ''));
    }
  }, []);

  useDebounce(query, 500, q => {
    if (!q) return router.replace('/search');
    router.replace(`/search/${q}`);
  });

  return (
    <>
      {children}
      <NavbarMetadata type="search" onTextChange={setQuery} text={query} />
    </>
  );
}
