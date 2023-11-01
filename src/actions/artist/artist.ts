'use server';

import { prisma } from '@/lib/database';

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
