import { Prisma } from '@prisma/client';
import { SongId } from '../songs';
import { PlaylistId } from './types';

export const generatePlaylistItemId = (
  playlistId: PlaylistId,
  songId: SongId
) => {
  return `${playlistId}-${songId}`;
};

export const createPlaylistItems = (
  songIds: SongId[],
  playlistId: string
): Prisma.PlaylistItemCreateManyPlaylistInput[] => {
  return songIds.map((songId, index) => ({
    id: generatePlaylistItemId(playlistId, songId),
    songId,
    nextId:
      index === songIds.length - 1
        ? null
        : generatePlaylistItemId(playlistId, songIds[index + 1]),
    prevId:
      index === 0
        ? null
        : generatePlaylistItemId(playlistId, songIds[index - 1]),
  }));
};
