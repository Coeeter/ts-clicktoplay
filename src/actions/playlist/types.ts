import { getCreatedPlaylists } from './playlist';
import { SongId } from '../songs';

export type PlaylistId = string;

export type PlaylistItemId = string;

export type Playlist = Awaited<ReturnType<typeof getCreatedPlaylists>>[0];

export type CreatePlaylistProps = {
  title: string;
  image: string | null;
};

export type UpdatePlaylistProps = {
  playlistId: PlaylistId;
  title: string;
  image: string | null;
  description: string | null;
};

export type AddSongsToPlaylistProps = {
  playlistId: PlaylistId;
  songIds: SongId[];
};

export type RemoveSongFromPlaylistProps = {
  playlistId: PlaylistId;
  songId: SongId;
};

export type MoveSongsInPlaylistProps = {
  playlistId: PlaylistId;
  songIds: SongId[];
  prevId: PlaylistItemId | null;
  nextId: PlaylistItemId | null;
};

export type DeletePlaylistProps = {
  playlistId: PlaylistId;
};
