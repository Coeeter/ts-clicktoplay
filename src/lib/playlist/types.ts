import { Session } from 'next-auth';
import { getCreatedPlaylists } from './playlist';
import { SongId } from '../songs';

export type PlaylistId = string;

export type PlaylistItemId = string;

export type Playlist = Awaited<ReturnType<typeof getCreatedPlaylists>>[0];

export type CreatePlaylistProps = {
  session: Session;
  title: string;
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

export type MoveSongInPlaylistProps = {
  session: Session;
  playlistId: PlaylistId;
  songIds: SongId[];
  prevId: PlaylistItemId | null;
  nextId: PlaylistItemId | null;
};

export type DeletePlaylistProps = {
  session: Session;
  playlistId: PlaylistId;
};
