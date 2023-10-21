'use client';

import { createPlaylist } from '@/actions/playlist';
import { useToastStore } from '@/store/ToastStore';
import { usePathname } from 'next/navigation';
import React from 'react';
import { MdAdd } from 'react-icons/md';

export const SidebarNewPlaylistButton = () => {
  const pathname = usePathname()
  const createToast = useToastStore(state => state.createToast)

  return (
    <button
      type="submit"
      className="text-sm flex items-center text-slate-300/50 gap-2 hover:text-slate-200 transition rounded-md"
      onClick={async () => {
        await createPlaylist({
          title: 'New Playlist',
          image: null,
          path: pathname,
        });
        createToast('Playlist created', 'success');
      }}
    >
      <MdAdd size={20} />
      <span>New Playlist</span>
    </button>
  );
};
