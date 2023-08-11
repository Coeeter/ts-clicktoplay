import { SongList } from '@/components/songs/SongList';
import { getSongs } from '@/lib/songs';

export default async function Home() {
  const songs = await getSongs();

  return <SongList songs={songs} />;
}
