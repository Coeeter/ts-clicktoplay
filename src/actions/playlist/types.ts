import { Session } from 'next-auth';
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
  session: Session;
  playlistId: PlaylistId;
  title: string;
};

export type AddSongsToPlaylistProps = {
  session: Session;
  playlistId: PlaylistId;
  songIds: SongId[];
};

export type RemoveSongsFromPlaylistProps = AddSongsToPlaylistProps;

export type MoveSongsInPlaylistProps = {
  session: Session;
  playlistId: PlaylistId;
  songIds: SongId[];
  prevId: PlaylistItemId | null;
  nextId: PlaylistItemId | null;
};

export type DeletePlaylistProps = {
  playlistId: PlaylistId;
};
