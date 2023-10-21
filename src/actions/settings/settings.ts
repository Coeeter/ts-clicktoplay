'use server';

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const setSideBarOpen = async (isOpen: boolean) => {
  const session = await getServerSession();

  if (!session) {
    return;
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      sideBarOpen: isOpen,
    },
  });
};

export const setSidebarWidthOpen = async (width: number) => {
  const session = await getServerSession();

  if (!session) {
    return;
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      sideBarWidth: width,
    },
  });
};
