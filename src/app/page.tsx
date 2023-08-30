import { SongList } from '@/components/songs/SongList';
import { getSongs } from '@/actions/songs';
import { getCreatedPlaylists } from '@/actions/playlist';
import { getServerSession } from '@/lib/auth';

export default async function Home() {
  const songs = await getSongs();
  const session = await getServerSession();
  const playlists = session ? await getCreatedPlaylists(session) : [];

  return <SongList songs={songs} playlists={playlists} />;
}
