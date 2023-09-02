import { Playlist } from '@/actions/playlist';
import { create } from 'zustand';

type EditPlaylistModalStore = {
  isOpen: boolean;
  playlist: Playlist | null;
  open: (playlist: Playlist) => void;
  close: () => void;
};

export const useEditPlaylistModalStore = create<EditPlaylistModalStore>(
  set => ({
    isOpen: false,
    playlist: null,
    open: (playlist: Playlist) => {
      set({ isOpen: true, playlist });
    },
    close: () => {
      set({ isOpen: false, playlist: null });
    },
  })
);
