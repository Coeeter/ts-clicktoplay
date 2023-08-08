import { SongItem } from '@/components/songs/SongItem';
import { getServerSession } from '@/lib/auth';
import { getSongs } from '@/lib/songs';

export default async function Home() {
  const session = await getServerSession();
  const songs = await getSongs();

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {session ? (
        songs.map(song => <SongItem key={song.id} song={song} />)
      ) : (
        <div className="text-md text-slate-300/50 font-semibold">
          Please login to view songs
        </div>
      )}
    </div>
  );
}
