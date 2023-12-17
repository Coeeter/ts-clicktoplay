import { getSongs } from '@/actions/songs';
import { getFavoriteSongs } from '@/actions/library';
import { getQueue } from '@/actions/queue';
import { getServerSession } from '@/lib/auth';
import { extractMainColor } from '@/utils/extractMainColor';
import { SongControlPanelContent } from './SongControlPanelContent';

export const SongControlPanel = async () => {
  const songs = await getSongs();
  const session = await getServerSession();
  const queue = session ? await getQueue(session) : null;

  const currentlyPlayingSong = songs.find(
    song =>
      song.id ===
      queue?.items.find(item => item.id === queue.currentlyPlayingId)?.songId
  );

  const primaryColor = await extractMainColor(
    currentlyPlayingSong?.albumCover || null
  );

  const [err, favorites] = await getFavoriteSongs();
  if (err || !favorites) console.error(err);

  return (
    <SongControlPanelContent
      songs={songs}
      favorites={favorites ?? []}
      session={session}
      primaryColor={primaryColor}
    />
  );
};
