'use client';

import { LibraryItem } from '@prisma/client';
import { Session } from 'next-auth';
import { SidebarItem } from './SidebarItem';
import { Playlist } from '@/actions/playlist';

type SidebarItemListProps = {
  items: (LibraryItem & {
    playlist: Playlist;
  })[];
  session: Session;
};

export const SidebarItemList = ({ items, session }: SidebarItemListProps) => {
  //TODO: make reordering possible
  return (
    <div className="flex flex-col gap-1">
      {items.map(libraryItem => (
        <SidebarItem
          key={libraryItem.id}
          playlist={libraryItem.playlist}
          session={session}
        />
      ))}
    </div>
  );
};
