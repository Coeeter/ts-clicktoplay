import { QueueList } from '@/components/queue/QueueList';
import { withAuth } from '@/components/auth/WithAuth';
import { getSongs } from '@/actions/songs';
import { Metadata } from 'next';
import { getCreatedPlaylists } from '@/actions/playlist';

export const metadata: Metadata = {
  title: 'Queue | ClickToPlay',
};

const QueuePage = withAuth(async ({ session }) => {
  const songs = await getSongs();
  const playlists = session ? await getCreatedPlaylists(session) : [];
  const favoriteSongs =
    playlists
      .find(playlist => playlist.isFavoritePlaylist)
      ?.items?.map(item => songs.find(song => song.id === item.songId)) ?? [];

  return (
    <div className="px-6 pt-[64px]">
      <QueueList
        songs={songs}
        favoriteSongs={favoriteSongs}
        playlists={playlists.filter(p => !p.isFavoritePlaylist)}
      />
    </div>
  );
});

export default QueuePage;
