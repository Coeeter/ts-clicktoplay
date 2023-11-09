'use server';

import { prisma } from '@/lib/database';
import { deleteFileFromS3, getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

export const getArtists = async () => {
  return await prisma.artist.findMany();
};

export const searchArtists = async (query: string) => {
  return await prisma.artist.findMany({
    where: {
      name: {
        mode: 'insensitive',
        contains: query,
      },
    },
  });
};

export const getUpdateArtistUploadUrl = async (
  id: string,
  extension: string,
  contentType: string
) => {
  const artist = await prisma.artist.findUnique({
    where: { id },
  });

  if (!artist) return;

  if (artist.image) {
    await deleteFileFromS3({
      url: artist.image,
    });
  }

  return await getPresignedUploadUrl({
    contentType: contentType,
    key: `artists/${randomUUID()}.${extension}`,
  });
};

export const updateArtist = async ({
  id,
  name,
  description,
  image,
}: {
  id: string;
  name: string;
  description: string;
  image?: string;
}) => {
  await prisma.artist.update({
    where: { id },
    data: {
      name,
      description,
      image,
    },
  });
  revalidatePath('/', 'layout');
};
