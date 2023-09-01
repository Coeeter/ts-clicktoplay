import { prisma } from '@/lib/database';
import { BadRequestError, NotFoundError } from '@/utils';
import { Session } from 'next-auth';
import {
  AddPlaylistToLibraryProps,
  Library,
  MovePlaylistInLibraryProps,
  RemovePlaylistFromLibraryProps,
} from './types';

export const getLibrary = async (session: Session) => {
  return await prisma.library.upsert({
    where: {
      userId: session.user.id,
    },
    create: {
      userId: session.user.id,
    },
    update: {},
    include: {
      items: true,
      user: true,
    },
  });
};

export const addPlaylistToLibrary = async ({
  session,
  playlistId,
}: AddPlaylistToLibraryProps): Promise<Library> => {
  const { id, items } = await getLibrary(session);
  if (items.some(item => item.playlistId === playlistId)) {
    throw new BadRequestError('Playlist already in library');
  }
  const lastItem = items.find(item => !item.nextId);
  await prisma.$transaction(async tx => {
    const createdItem = await tx.libraryItem.create({
      data: {
        playlistId,
        prevId: lastItem?.id,
        libraryId: id,
      },
    });
    if (lastItem) {
      await tx.libraryItem.update({
        where: {
          id: lastItem.id,
        },
        data: {
          nextId: createdItem.id,
        },
      });
    }
  });
  return await getLibrary(session);
};

export const removePlaylistFromLibrary = async ({
  session,
  playlistId,
}: RemovePlaylistFromLibraryProps): Promise<Library> => {
  const { items } = await getLibrary(session);
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
  const { items } = await getLibrary(session);
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
