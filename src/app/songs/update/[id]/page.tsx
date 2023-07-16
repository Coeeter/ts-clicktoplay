import { prisma } from '@/lib/database';
import { redirect } from 'next/navigation';

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
    <audio controls={true}>
      <source src={song.url} type="audio/mpeg" />
    </audio>
  );
}
