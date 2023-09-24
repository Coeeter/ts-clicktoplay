import { randomUUID } from 'crypto';
import { deleteFileFromS3, getPresignedUploadUrl } from '../../lib/s3';
import { prisma } from '../../lib/database';
import { ForbiddenError, NotFoundError } from '@/utils/response';
import {
  CreateSongProps,
  GetSongFileUploadUrlProps,
  GetUpdateFileUploadUrlProps,
  UpdateSongProps,
} from './types';
import { PlayHistory, Song, User } from '@prisma/client';

export const getSongFileUploadUrl = async ({
  fileType,
  extension,
  type,
}: GetSongFileUploadUrlProps) => {
  let key = `songs/${randomUUID()}.${extension ?? 'mp3'}`;
  if (type !== 'audio') {
    key = `images/${randomUUID()}.${extension ?? 'jpg'}`;
  }

  const presignedUrl = await getPresignedUploadUrl({
    key: key,
    contentType: fileType ?? (type !== 'audio' ? 'image/jpeg' : 'audio/mpeg'),
  });

  return presignedUrl;
};

export const createSong = async (createSongProps: CreateSongProps) => {
  return await prisma.song.create({
    data: {
      url: createSongProps.url,
      title: createSongProps.title,
      duration: createSongProps.duration,
      artist: createSongProps.artist ?? '',
      albumCover: createSongProps.albumCover,
      uploaderId: createSongProps.session.user.id,
    },
  });
};

export const getUpdateAlbumCoverUploadUrl = async ({
  id,
  fileType,
  extension,
  session,
}: GetUpdateFileUploadUrlProps) => {
  const song = await prisma.song.findUnique({
    where: {
      id: id ?? '',
    },
  });
  if (!song) {
    throw new NotFoundError('Song not found');
  }
  if (song.uploaderId !== session.user.id) {
    throw new ForbiddenError('You are not the owner of this song');
  }
  if (song.albumCover) {
    await deleteFileFromS3({ url: song.albumCover });
  }
  return await getSongFileUploadUrl({
    fileType,
    extension,
    type: 'image',
  });
};

export const updateSong = async ({
  id,
  title,
  artist,
  albumCover,
  session,
}: UpdateSongProps) => {
  const song = await prisma.song.findUnique({
    where: {
      id: id ?? '',
    },
  });
  if (!song) {
    throw new NotFoundError('Song not found');
  }
  if (song.uploaderId !== session.user.id) {
    throw new ForbiddenError('You are not the owner of this song');
  }
  return await prisma.song.update({
    where: {
      id: song.id,
    },
    data: {
      title: title ?? song.title,
      artist: artist ?? song.artist,
      albumCover: albumCover ?? song.albumCover,
    },
  });
};

export const getSongs = async () => {
  return await prisma.song.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      uploader: true,
    },
  });
};

export const getSongById = async (
  id: string
): Promise<
  [
    error: string | null,
    song:
      | (Song & {
          uploader: User;
          playhistories: PlayHistory[];
        })
      | null
  ]
> => {
  try {
    return [
      null,
      await prisma.song.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          uploader: true,
          playhistories: true,
        },
      }),
    ];
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

export const getCreatedSongs = async (
  userId: string
): Promise<
  [
    error: string | null,
    song:
      | (Song & {
          uploader: User;
        })[]
      | null
  ]
> => {
  try {
    return [
      null,
      await prisma.song.findMany({
        where: {
          uploaderId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          uploader: true,
        },
      }),
    ];
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
