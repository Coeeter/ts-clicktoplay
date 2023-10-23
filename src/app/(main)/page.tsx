import { SongList } from '@/components/songs/SongList';
import { getSongs } from '@/actions/songs';
import { getCreatedPlaylists } from '@/actions/playlist';
import { getServerSession } from '@/lib/auth';

export default async function Home() {
  const songs = await getSongs();
  const session = await getServerSession();
  const playlists = session ? await getCreatedPlaylists(session) : [];

  const favoriteSongs =
    playlists
      .find(p => p.isFavoritePlaylist)
      ?.items.map(i => songs.find(s => s.id === i.songId)!) ?? [];

  return (
    <div className='pt-[64px]'>
      <SongList
        songs={songs}
        playlists={playlists.filter(p => !p.isFavoritePlaylist)}
        session={session}
        favoriteSongs={favoriteSongs}
      />
    </div>
  );
}
