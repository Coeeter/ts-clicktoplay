import { prisma } from '@/lib/database';
import { redirect } from 'next/navigation';
import { UpdateSongForm } from './UpdateSongForm';
import { WithAuth } from '@/components/server/WithAuth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Update Song | ClickToPlay',
};

export default async function UpdateSongPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const song = await prisma.song.findUnique({
    where: {
      id: id,
    },
  });

  if (!song) {
    return redirect('/');
  }

  return (
    <WithAuth userId={song.uploaderId}>
      <UpdateSongForm song={song} />
    </WithAuth>
  );
}
