import { QueueList } from '@/components/queue/QueueList';
import { WithAuth } from '@/components/server/WithAuth';
import { getSongs } from '@/actions/songs';
import { Metadata } from 'next';
import { getCreatedPlaylists } from '@/actions/playlist';
import { getServerSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Queue | ClickToPlay',
};

export default async function QueuePage() {
  const songs = await getSongs();
  const session = await getServerSession();
  const playlists = session ? await getCreatedPlaylists(session) : [];
  const favoriteSongs =
    playlists
      .find(playlist => playlist.isFavoritePlaylist)
      ?.items?.map(item => songs.find(song => song.id === item.songId)) ?? [];

  return (
    <WithAuth>
      <QueueList
        songs={songs}
        favoriteSongs={favoriteSongs}
        playlists={playlists.filter(p => !p.isFavoritePlaylist)}
      />
    </WithAuth>
  );
}
