import { SongItem } from '@/components';
import { prisma } from '@/lib/database';

export default async function Home() {
  const songs = await prisma.song.findMany();

  return (
    <div className="">
      {songs.map(song => (
        <SongItem key={song.id} song={song} />
      ))}
    </div>
  );
}
