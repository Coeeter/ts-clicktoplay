'use server';

import { Session } from 'next-auth';
import { prisma } from '../../lib/database';
import {
  AddSongsToPlaylistProps,
  CreatePlaylistProps,
  DeletePlaylistProps,
  MoveSongsInPlaylistProps,
  Playlist,
  RemoveSongsFromPlaylistProps,
  UpdatePlaylistProps,
} from './types';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  checkLinkedListNodesAreInOrder,
} from '@/utils';
import { createPlaylistItems } from './helper';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth';
import { getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';

export const getCreatedPlaylists = async (session: Session) => {
  const playlists = await prisma.playlist.findMany({
    where: {
      creatorId: session.user.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      items: true,
      creator: true,
    },
  });
  return playlists;
};

export const getPlaylistById = async (
  id: string
): Promise<[string | null, Playlist | null]> => {
  try {
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
    return [null, playlist];
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    return ['An error has occured', null];
  }
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

export const createPlaylist = async ({ title, image }: CreatePlaylistProps) => {
  const session = (await getServerSession())!;
  const playlistWithCommonTitle = await prisma.playlist.findMany({
    where: {
      title: {
        startsWith: title,
      },
    },
  });
  const number = playlistWithCommonTitle.length + 1;
  const result = await prisma.playlist.create({
    data: {
      title: title + (number > 1 ? ` #${number}` : ''),
      image,
      creatorId: session.user.id,
    },
    include: {
      items: true,
      creator: true,
    },
  });
  revalidatePath('/');
  return result;
};

export const getPlaylistUpdateImageUrl = async (
  playlistId: string,
  extension: string,
  fileType: string
): Promise<[error: string | null, url: string | null]> => {
  try {
    const session = (await getServerSession())!;
    const [error, playlist] = await getPlaylistById(playlistId);
    if (error) {
      throw new NotFoundError('Playlist not found');
    }
    if (playlist!.creatorId !== session.user.id) {
      throw new UnauthorizedError(
        'You are not authorized to update this playlist'
      );
    }
    let key = `images/${randomUUID()}.${extension ?? 'jpg'}`;
    const presignedUrl = await getPresignedUploadUrl({
      key: key,
      contentType: fileType ?? 'image/jpeg',
    });
    return [null, presignedUrl];
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    return ['An error has occured', null];
  }
};

export const updatePlaylist = async ({
  playlistId,
  title,
  description,
  image,
}: UpdatePlaylistProps): Promise<
  [error: string | null, playlist: Playlist | null]
> => {
  try {
    const session = (await getServerSession())!;
    const [error, playlist] = await getPlaylistById(playlistId);
    if (error) {
      throw new NotFoundError('Playlist not found');
    }
    if (playlist!.creatorId !== session.user.id) {
      throw new UnauthorizedError(
        'You are not authorized to update this playlist'
      );
    }
    const result = await prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        title,
        description,
        image,
      },
      include: {
        items: true,
        creator: true,
      },
    });
    revalidatePath('/');
    return [null, result];
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    return ['An error has occured', null];
  }
};

export const addSongsToPlaylist = async ({
  playlistId,
  songIds,
}: AddSongsToPlaylistProps): Promise<
  [error: string | null, playlist: Playlist | null]
> => {
  try {
    const session = (await getServerSession())!;
    const [error, playlist] = await getPlaylistById(playlistId);
    if (error) {
      throw new NotFoundError('Playlist not found');
    }
    if (playlist!.creatorId !== session.user.id) {
      throw new UnauthorizedError(
        'You are not authorized to update this playlist'
      );
    }
    const { id, items } = playlist!;
    if (songIds.some(songId => items.some(item => item.songId === songId))) {
      throw new BadRequestError('Song already exists in playlist');
    }
    const lastItem = items.find(item => !item.nextId);
    const playlistItems = createPlaylistItems(songIds, playlistId);
    playlistItems[0].prevId = lastItem?.id ?? null;
    await prisma.$transaction([
      prisma.playlistItem.createMany({
        data: playlistItems.map(item => ({ ...item, playlistId })),
      }),
      ...(lastItem
        ? [
            prisma.playlistItem.update({
              where: {
                id: lastItem?.id,
              },
              data: {
                nextId: playlistItems[0].id,
              },
            }),
          ]
        : []),
    ]);
    const result = await getPlaylistById(id);
    revalidatePath('/');
    return result;
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    return ['An error has occured', null];
  }
};

export const removeSongsFromPlaylist = async ({
  playlistId,
  songIds,
}: RemoveSongsFromPlaylistProps): Promise<
  [error: string | null, playlist: Playlist | null]
> => {
  try {
    const session = (await getServerSession())!;
    const [error, playlist] = await getPlaylistById(playlistId);
    if (error) {
      throw new NotFoundError('Playlist not found');
    }
    if (playlist!.creatorId !== session.user.id) {
      throw new UnauthorizedError(
        'You are not authorized to update this playlist'
      );
    }
    const { id, items } = playlist!;
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
    const transaction: any[] = [
      prisma.playlistItem.deleteMany({
        where: {
          id: {
            in: playlistItemsToRemove.map(item => item.id),
          },
        },
      }),
    ];
    if (prevItem) {
      transaction.push(
        prisma.playlistItem.update({
          where: {
            id: prevItem?.id,
          },
          data: {
            nextId: nextItem?.id,
          },
        })
      );
    }
    if (nextItem) {
      transaction.push(
        prisma.playlistItem.update({
          where: {
            id: nextItem?.id,
          },
          data: {
            prevId: prevItem?.id,
          },
        })
      );
    }
    await prisma.$transaction(transaction);
    const result = await getPlaylistById(id);
    revalidatePath('/');
    return result;
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    return ['An error has occured', null];
  }
};

export const moveSongsInPlaylist = async ({
  playlistId,
  songIds,
  prevId,
  nextId,
}: MoveSongsInPlaylistProps): Promise<
  [error: string | null, playlist: Playlist | null]
> => {
  try {
    const session = (await getServerSession())!;
    const [error, playlist] = await getPlaylistById(playlistId);
    if (error) {
      throw new NotFoundError('Playlist not found');
    }
    if (playlist!.creatorId !== session.user.id) {
      throw new UnauthorizedError(
        'You are not authorized to update this playlist'
      );
    }
    const { id, items } = playlist!;
    const playlistItemsToMove = songIds.map((songId: string) => {
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
      (newPrevItem && newPrevItem?.nextId !== (newNextItem?.id ?? null)) ||
      (newNextItem && newNextItem?.prevId !== (newPrevItem?.id ?? null))
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
      ...(newPrevItem
        ? [
            prisma.playlistItem.update({
              where: {
                id: newPrevItem?.id,
              },
              data: {
                nextId: firstItem.id,
              },
            }),
          ]
        : []),
      ...(newNextItem
        ? [
            prisma.playlistItem.update({
              where: {
                id: newNextItem?.id,
              },
              data: {
                prevId: lastItem.id,
              },
            }),
          ]
        : []),
      ...(oldPrevItem
        ? [
            prisma.playlistItem.update({
              where: {
                id: oldPrevItem?.id,
              },
              data: {
                nextId: lastItem.nextId,
              },
            }),
          ]
        : []),
      ...(oldNextItem
        ? [
            prisma.playlistItem.update({
              where: {
                id: oldNextItem?.id,
              },
              data: {
                prevId: firstItem.prevId,
              },
            }),
          ]
        : []),
    ]);
    const result = await getPlaylistById(id);
    revalidatePath('/');
    return result;
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    return ['An error has occured', null];
  }
};

export const deletePlaylist = async ({
  playlistId,
}: DeletePlaylistProps): Promise<
  [error: string | null, playlistId: string | null]
> => {
  try {
    const session = (await getServerSession())!;
    const [error, playlist] = await getPlaylistById(playlistId);
    if (error) {
      throw new NotFoundError('Playlist not found');
    }
    if (playlist!.creatorId !== session.user.id) {
      throw new UnauthorizedError(
        'You are not authorized to delete this playlist'
      );
    }
    const result = await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });
    revalidatePath('/');
    return [null, result.id];
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    return ['An error has occured', null];
  }
};
