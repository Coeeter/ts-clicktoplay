import { Playlist, PlaylistId, PlaylistItemId } from '@/actions/playlist';
import { SongId } from '@/actions/songs';
import { create } from 'zustand';

type PlaylistState = {
  createdPlaylists: Playlist[];
  searchedPlaylists: Playlist[];
};

type PlaylistActions = {
  createNewPlaylist: (title: string) => void;
  searchPlaylists: (query: string) => void;
  deletePlaylist: (playlistId: PlaylistId) => void;
  addSongToPlaylist: (playlistId: PlaylistId, songId: SongId) => void;
  removeSongFromPlaylist: (
    playlistId: PlaylistId,
    playlistItemId: PlaylistItemId
  ) => void;
  moveSongsInPlaylist: () => void;
  updatePlaylist: (playlistId: PlaylistId, title: string) => void;
  setCreatedPlaylists: (createdPlaylists: Playlist[]) => void;
};

export const usePlaylistStore = create<PlaylistState & PlaylistActions>(
  set => ({
    createdPlaylists: [],
    searchedPlaylists: [],
    createNewPlaylist: title => {},
    searchPlaylists: query => {},
    deletePlaylist: playlistId => {},
    addSongToPlaylist: (playlistId, songId) => {},
    removeSongFromPlaylist: (playlistId, playlistItemId) => {},
    moveSongsInPlaylist: () => {},
    updatePlaylist: (playlistId, title) => {},
    setCreatedPlaylists: createdPlaylists => set({ createdPlaylists }),
  })
);
