import { Metadata } from 'next';
import React from 'react';
import { NavbarConfig } from './_components/NavbarConfig';

export const metadata: Metadata = {
  title: 'Search | ClickToPlay',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <NavbarConfig />
    </>
  );
}
