import { Playlist } from '@/actions/playlist';
import { create } from 'zustand';

type PlaylistModalStore = {
  isOpen: boolean;
  type: 'edit' | 'delete' | null;
  playlist: Playlist | null;
  open: (playlist: Playlist, type: 'edit' | 'delete') => void;
  close: () => void;
};

export const usePlaylistModalStore = create<PlaylistModalStore>(set => ({
  isOpen: false,
  playlist: null,
  type: null,
  open: (playlist: Playlist, type) => {
    set({ isOpen: true, playlist, type });
  },
  close: () => {
    set({ isOpen: false, playlist: null, type: null });
  },
}));
