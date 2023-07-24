import { SongItem } from '@/components';
import { getSongs } from '@/lib/songs';

export default async function Home() {
  const songs = await getSongs();

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {songs.map(song => (
        <SongItem key={song.id} song={song} />
      ))}
    </div>
  );
}
