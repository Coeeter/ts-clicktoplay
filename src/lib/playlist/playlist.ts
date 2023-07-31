import { Session } from 'next-auth';
import { prisma } from '../database';
import {
  AddSongsToPlaylistProps,
  CreatePlaylistProps,
  DeletePlaylistProps,
  Playlist,
  UpdatePlaylistProps,
} from './types';
import { NotFoundError, UnauthorizedError } from '@/utils';
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
  throw new Error('Not implemented');
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
