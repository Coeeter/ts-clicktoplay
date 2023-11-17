import { getSongs } from '@/actions/songs';
import { SongDetail } from './SongDetail';
import { VolumeTrackbar } from './VolumeTrackbar';
import { SongPlayer } from './SongPlayer';
import { getFavoriteSongs } from '@/actions/library';

export const SongControlPanel = async () => {
  const songs = await getSongs();

  const [err, favorites] = await getFavoriteSongs();
  if (err || !favorites) console.error(err);

  return (
    <div className="bg-slate-900 text-slate-300 p-3 flex justify-between sticky bottom-0 w-full">
      <SongDetail songs={songs} favoriteSongs={[...(favorites ?? [])]} />
      <SongPlayer songs={songs} />
      <VolumeTrackbar />
    </div>
  );
};
