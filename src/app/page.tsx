import { SongList } from '@/components/songs/SongList';
import { getSongs } from '@/actions/songs';

export default async function Home() {
  const songs = await getSongs();

  return <SongList songs={songs} />;
}
