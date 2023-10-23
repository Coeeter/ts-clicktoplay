import { QueueList } from '@/components/queue/QueueList';
import { WithAuth } from '@/components/server/WithAuth';
import { getSongs } from '@/actions/songs';
import { Metadata } from 'next';
import { getCreatedPlaylists } from '@/actions/playlist';
import { getServerSession } from '@/lib/auth';
import { Navbar } from '@/components/navigation/navbar/Navbar';

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
      <div className='px-6 pt-[64px]'>
        <QueueList
          session={session}
          songs={songs}
          favoriteSongs={favoriteSongs}
          playlists={playlists.filter(p => !p.isFavoritePlaylist)}
        />
      </div>
    </WithAuth>
  );
}
