import { SongList } from '@/components/songs/SongList';
import { getSongs } from '@/actions/songs';
import { getCreatedPlaylists } from '@/actions/playlist';
import { getServerSession } from '@/lib/auth';
import { getFavoriteSongs } from '@/actions/library';

export default async function Home() {
  const songs = await getSongs();
  const session = await getServerSession();
  const playlists = session ? await getCreatedPlaylists(session) : [];

  let [err, favoriteSongs] = session ? await getFavoriteSongs() : [null, []];
  if (err || !favoriteSongs) {
    favoriteSongs = [];
  }

  return (
    <div className="pt-[64px]">
      <SongList
        songs={songs}
        playlists={playlists.filter(p => !p.isFavoritePlaylist)}
        favoriteSongs={favoriteSongs}
      />
    </div>
  );
}
