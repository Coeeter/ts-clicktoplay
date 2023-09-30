import { Session } from 'next-auth';
import { getLibrary } from './library';
import { PlaylistId } from '../playlist';

export type Library = Awaited<ReturnType<typeof getLibrary>>;

export type LibraryItemId = string;

export type AddPlaylistToLibraryProps = {
  session: Session;
  playlistId: PlaylistId;
};

export type RemovePlaylistFromLibraryProps = AddPlaylistToLibraryProps;

export type MovePlaylistInLibraryProps = {
  session: Session;
  itemId: LibraryItemId;
  newNextId: LibraryItemId | null;
  newPrevId: LibraryItemId | null;
};
