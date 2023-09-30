'use server';

import { prisma } from '@/lib/database';
import { BadRequestError, NotFoundError, sortLinkedList } from '@/utils';
import { Session } from 'next-auth';
import {
  Library,
  MovePlaylistInLibraryProps,
  RemovePlaylistFromLibraryProps,
} from './types';
import { addSongsToPlaylist, removeSongFromPlaylist } from '../playlist';
import { revalidatePath } from 'next/cache';
import { getServerSession } from '@/lib/auth';
import { Song, User } from '@prisma/client';
import { getSongs } from '../songs';

export const getLibrary = async (session: Session) => {
  const playlists = await prisma.playlist.findMany({
    where: {
      creatorId: session.user.id,
      isFavoritePlaylist: false,
    },
    include: {
      items: true,
      creator: true,
    },
  });
  const favoritePlaylist = await prisma.playlist.findFirst({
    where: {
      creatorId: session.user.id,
      isFavoritePlaylist: true,
    },
    include: {
      items: true,
      creator: true,
    },
  });
  const createdPlaylists = [
    ...(favoritePlaylist ? [favoritePlaylist] : []),
    ...playlists.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
  ];
  const library = await prisma.libraryItem.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  });
  await prisma.$transaction(
    createdPlaylists
      .filter(
        playlist => !library.find(item => item.playlistId === playlist.id)
      )
      .map((playlist, index) =>
        prisma.libraryItem.create({
          data: {
            id: `${session.user.id}-${playlist.id}`,
            playlistId: playlist.id,
            userId: session.user.id,
            prevId:
              index === 0
                ? null
                : `${session.user.id}-${createdPlaylists[index - 1]?.id}`,
            nextId:
              index === createdPlaylists.length - 1
                ? null
                : `${session.user.id}-${createdPlaylists[index + 1]?.id}`,
          },
        })
      )
  );
  const libraryItems = (
    await prisma.libraryItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    })
  ).map(item => ({
    ...item,
    playlist: createdPlaylists.find(playlist => playlist.id === item.playlistId)!,
  }));
  return sortLinkedList(libraryItems);
};

export const getFavoriteSongs = async (): Promise<
  [
    error: string | null,
    songs:
      | (Song & {
          uploader: User;
        })[]
      | null
  ]
> => {
  try {
    const session = await getServerSession();
    if (!session) return ['Session not found', null];
    const favoritePlaylist = await prisma.playlist.findFirst({
      where: {
        isFavoritePlaylist: true,
        creatorId: session.user.id,
      },
      include: {
        items: true,
      },
    });
    if (!favoritePlaylist) return ['Favorite playlist not found', null];
    const songs = await getSongs();
    const favoriteSongs = favoritePlaylist.items.map(
      item => songs.find(song => song.id === item.songId)!
    );
    return [null, favoriteSongs];
  } catch (e) {
    if (e instanceof Error) {
      return [e.message, null];
    }
    if (typeof e === 'string') {
      return [e, null];
    }
    return ['Something went wrong', null];
  }
};

export const addFavoriteSongToLibrary = async ({
  songId,
  path,
}: {
  songId: string;
  path: string;
}): Promise<[error: string | null, library: Library | null]> => {
  const session = await getServerSession();
  if (!session) return ['Session not found', null];
  const favoritePlaylist = await prisma.playlist.upsert({
    where: {
      id: session.user.id,
    },
    update: {},
    create: {
      id: session.user.id,
      title: 'Favorite Songs',
      description: 'Your favorite songs',
      creatorId: session.user.id,
      isFavoritePlaylist: true,
    },
  });
  const [err, updatedPlaylist] = await addSongsToPlaylist({
    playlistId: favoritePlaylist.id,
    songIds: [songId],
    path: path,
  });
  if (err || !updatedPlaylist) return [err, null];
  const library = await getLibrary(session);
  if (library.find(item => item.playlistId === favoritePlaylist.id)) {
    return [null, library];
  }
  revalidatePath(path);
  return [null, await getLibrary(session)];
};

export const removeFavoriteSongFromLibrary = async ({
  songId,
  path,
}: {
  songId: string;
  path: string;
}): Promise<[error: string | null, library: Library | null]> => {
  const session = await getServerSession();
  if (!session) return ['Session not found', null];
  const favoritePlaylist = await prisma.playlist.findFirst({
    where: {
      creatorId: session.user.id,
      isFavoritePlaylist: true,
    },
  });
  if (!favoritePlaylist) {
    return ["Favorite playlist doesn't exist", null];
  }
  const [err, updatedPlaylist] = await removeSongFromPlaylist({
    playlistId: favoritePlaylist.id,
    songId: songId,
    path: path,
  });
  if (err || !updatedPlaylist) {
    return [err, null];
  }
  revalidatePath(path);
  return [null, await getLibrary(session)];
};

export const removePlaylistFromLibrary = async ({
  session,
  playlistId,
}: RemovePlaylistFromLibraryProps): Promise<Library> => {
  const items = await getLibrary(session);
  const item = items.find(item => item.playlistId === playlistId);
  if (!item) {
    throw new NotFoundError('Playlist not in library');
  }
  const prevItem = items.find(item => item.nextId === item.id);
  const nextItem = items.find(item => item.prevId === item.id);
  await prisma.$transaction(async tx => {
    await tx.libraryItem.delete({
      where: {
        id: item.id,
      },
    });
    if (prevItem) {
      await tx.libraryItem.update({
        where: {
          id: prevItem.id,
        },
        data: {
          nextId: nextItem?.id || null,
        },
      });
    }
    if (nextItem) {
      await tx.libraryItem.update({
        where: {
          id: nextItem.id,
        },
        data: {
          prevId: prevItem?.id || null,
        },
      });
    }
  });
  return await getLibrary(session);
};

export const movePlaylistInLibrary = async ({
  session,
  itemId,
  newNextId,
  newPrevId,
}: MovePlaylistInLibraryProps): Promise<Library> => {
  const items = await getLibrary(session);
  const itemToMove = items.find(item => item.id === itemId);
  if (!itemToMove) {
    throw new NotFoundError('Item not in library');
  }
  const prevItem = items.find(item => item.nextId === item.id);
  const nextItem = items.find(item => item.prevId === item.id);
  const newPrevItem = items.find(item => item.id === newPrevId);
  const newNextItem = items.find(item => item.id === newNextId);
  if (!newPrevId && !newNextId) {
    throw new BadRequestError('newNextId or newPrevId is required');
  }
  if (newPrevId && !newPrevItem) {
    throw new NotFoundError('newPrevId not found in library');
  }
  if (newNextId && !newNextItem) {
    throw new NotFoundError('newNextId not found in library');
  }
  if (
    (newPrevItem && newPrevItem?.nextId !== (newNextItem?.id ?? null)) ||
    (newNextItem && newNextItem?.prevId !== (newPrevItem?.id ?? null))
  ) {
    throw new BadRequestError('Invalid newNextId or newPrevId');
  }
  await prisma.$transaction(async tx => {
    await tx.libraryItem.update({
      where: {
        id: itemToMove.id,
      },
      data: {
        prevId: newPrevId,
        nextId: newNextId,
      },
    });
    if (prevItem) {
      await tx.libraryItem.update({
        where: {
          id: prevItem.id,
        },
        data: {
          nextId: nextItem?.id || null,
        },
      });
    }
    if (nextItem) {
      await tx.libraryItem.update({
        where: {
          id: nextItem.id,
        },
        data: {
          prevId: prevItem?.id || null,
        },
      });
    }
    if (newPrevItem) {
      await tx.libraryItem.update({
        where: {
          id: newPrevItem.id,
        },
        data: {
          nextId: itemToMove.id,
        },
      });
    }
    if (newNextItem) {
      await tx.libraryItem.update({
        where: {
          id: newNextItem.id,
        },
        data: {
          prevId: itemToMove.id,
        },
      });
    }
  });
  return await getLibrary(session);
};
