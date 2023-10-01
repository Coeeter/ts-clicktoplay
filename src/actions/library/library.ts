'use server';

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { Song, User } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import {
  Playlist,
  addSongsToPlaylist,
  removeSongFromPlaylist,
} from '../playlist';
import { getSongs } from '../songs';

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
}): Promise<[error: string | null, playlist: Playlist | null]> => {
  try {
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
    revalidatePath(path);
    return [err, updatedPlaylist];
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

export const removeFavoriteSongFromLibrary = async ({
  songId,
  path,
}: {
  songId: string;
  path: string;
}): Promise<[error: string | null, playlist: Playlist | null]> => {
  try {
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
    revalidatePath(path);
    return [err, updatedPlaylist];
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
