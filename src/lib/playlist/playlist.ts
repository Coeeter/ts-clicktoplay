import { Session } from 'next-auth';
import { prisma } from '../database';
import {
  AddSongsToPlaylistProps,
  CreatePlaylistProps,
  DeletePlaylistProps,
  MoveSongsInPlaylistProps,
  Playlist,
  UpdatePlaylistProps,
} from './types';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  checkLinkedListNodesAreInOrder,
} from '@/utils';
import { createPlaylistItems } from './helper';

export const getCreatedPlaylists = async (session: Session) => {
  const playlists = await prisma.playlist.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      items: true,
      creator: true,
    },
  });
  return playlists;
};

export const getPlaylistById = async (id: string): Promise<Playlist> => {
  const playlist = await prisma.playlist.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
      creator: true,
    },
  });
  if (!playlist) {
    throw new NotFoundError('Playlist not found');
  }
  return playlist;
};

export const searchPlaylists = async (query: string) => {
  const playlists = await prisma.playlist.findMany({
    where: {
      title: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: {
      items: true,
      creator: true,
    },
  });
  return playlists;
};

export const createPlaylist = async ({
  session,
  title,
}: CreatePlaylistProps) => {
  return await prisma.playlist.create({
    data: {
      title,
      creatorId: session.user.id,
    },
    include: {
      items: true,
      creator: true,
    },
  });
};

export const updatePlaylist = async ({
  session,
  playlistId,
  title,
}: UpdatePlaylistProps) => {
  const playlist = await getPlaylistById(playlistId);
  if (playlist.creatorId !== session.user.id) {
    throw new UnauthorizedError(
      'You are not authorized to update this playlist'
    );
  }
  return await prisma.playlist.update({
    where: {
      id: playlistId,
    },
    data: {
      title,
    },
    include: {
      items: true,
      creator: true,
    },
  });
};

export const addSongsToPlaylist = async ({
  session,
  playlistId,
  songIds,
}: AddSongsToPlaylistProps) => {
  const playlist = await getPlaylistById(playlistId);
  if (playlist.creatorId !== session.user.id) {
    throw new UnauthorizedError(
      'You are not authorized to update this playlist'
    );
  }
  const { id, items } = playlist;
  const lastItem = items.find(item => !item.nextId);
  const playlistItems = createPlaylistItems(songIds, playlistId);
  playlistItems[0].prevId = lastItem?.id;
  return await prisma.playlist.update({
    where: { id },
    data: {
      items: {
        createMany: {
          data: playlistItems,
        },
        update: {
          where: {
            id: lastItem?.id,
          },
          data: {
            nextId: playlistItems[0].id,
          },
        },
      },
    },
    include: {
      items: true,
      creator: true,
    },
  });
};

export const removeSongsFromPlaylist = async ({
  session,
  playlistId,
  songIds,
}: AddSongsToPlaylistProps): Promise<Playlist> => {
  const playlist = await getPlaylistById(playlistId);
  if (playlist.creatorId !== session.user.id) {
    throw new UnauthorizedError(
      'You are not authorized to update this playlist'
    );
  }
  const { id, items } = playlist;
  const playlistItemsToRemove = songIds.map(songId => {
    const item = items.find(item => item.songId === songId);
    if (!item) {
      throw new NotFoundError('Song not found in playlist');
    }
    return item;
  });
  if (!checkLinkedListNodesAreInOrder(playlistItemsToRemove, true)) {
    throw new BadRequestError('Playlist items are not in order');
  }
  const firstItem = playlistItemsToRemove[0];
  const lastItem = playlistItemsToRemove[playlistItemsToRemove.length - 1];
  const prevItem = items.find(item => item.nextId === firstItem.id);
  const nextItem = items.find(item => item.prevId === lastItem.id);
  await prisma.$transaction([
    prisma.playlistItem.deleteMany({
      where: {
        id: {
          in: songIds,
        },
      },
    }),
    prisma.playlistItem.update({
      where: {
        id: prevItem?.id,
      },
      data: {
        nextId: nextItem?.id,
      },
    }),
    prisma.playlistItem.update({
      where: {
        id: nextItem?.id,
      },
      data: {
        prevId: prevItem?.id,
      },
    }),
  ]);
  return await getPlaylistById(id);
};

export const moveSongsInPlaylist = async ({
  session,
  playlistId,
  songIds,
  prevId,
  nextId,
}: MoveSongsInPlaylistProps): Promise<Playlist> => {
  const playlist = await getPlaylistById(playlistId);
  if (playlist.creatorId !== session.user.id) {
    throw new UnauthorizedError(
      'You are not authorized to update this playlist'
    );
  }
  const { id, items } = playlist;
  const playlistItemsToMove = songIds.map(songId => {
    const item = items.find(item => item.songId === songId);
    if (!item) {
      throw new NotFoundError('Song not found in playlist');
    }
    return item;
  });
  if (!checkLinkedListNodesAreInOrder(playlistItemsToMove, true)) {
    throw new BadRequestError('Playlist items are not in order');
  }
  const firstItem = playlistItemsToMove[0];
  const lastItem = playlistItemsToMove[playlistItemsToMove.length - 1];
  const oldPrevItem = items.find(item => item.nextId === firstItem.id);
  const oldNextItem = items.find(item => item.prevId === lastItem.id);
  const newPrevItem = items.find(item => prevId === item.id);
  const newNextItem = items.find(item => nextId === item.id);
  if (!prevId && !nextId) {
    throw new BadRequestError('nextId or prevId is required');
  }
  if (prevId && !newPrevItem) {
    throw new NotFoundError('prevId not found in playlist');
  }
  if (nextId && !newNextItem) {
    throw new NotFoundError('nextId not found in playlist');
  }
  if (
    (newPrevItem && newPrevItem?.nextId !== newNextItem?.id) ||
    (newNextItem && newNextItem?.prevId !== newPrevItem?.id)
  ) {
    throw new BadRequestError('Invalid nextId or prevId');
  }
  await prisma.$transaction([
    prisma.playlistItem.update({
      where: {
        id: firstItem.id,
      },
      data: {
        prevId,
      },
    }),
    prisma.playlistItem.update({
      where: {
        id: lastItem.id,
      },
      data: {
        nextId,
      },
    }),
    prisma.playlistItem.update({
      where: {
        id: newPrevItem?.id,
      },
      data: {
        nextId: firstItem.id,
      },
    }),
    prisma.playlistItem.update({
      where: {
        id: newNextItem?.id,
      },
      data: {
        prevId: lastItem.id,
      },
    }),
    prisma.playlistItem.update({
      where: {
        id: oldPrevItem?.id,
      },
      data: {
        nextId: lastItem.nextId,
      },
    }),
    prisma.playlistItem.update({
      where: {
        id: oldNextItem?.id,
      },
      data: {
        prevId: firstItem.prevId,
      },
    }),
  ]);
  return await getPlaylistById(id);
};

export const deletePlaylist = async ({
  session,
  playlistId,
}: DeletePlaylistProps) => {
  const playlist = await getPlaylistById(playlistId);
  if (playlist.creatorId !== session.user.id) {
    throw new UnauthorizedError(
      'You are not authorized to delete this playlist'
    );
  }
  return await prisma.playlist.delete({
    where: {
      id: playlistId,
    },
  });
};
