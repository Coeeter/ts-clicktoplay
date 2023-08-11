import { getSongs } from '@/lib/songs';
import { SongDetail } from './SongDetail';
import { VolumeTrackbar } from './VolumeTrackbar';
import { SongPlayer } from './SongPlayer';

export const SongControlPanel = async () => {
  const songs = await getSongs();

  return (
    <div className="bg-slate-800 text-slate-300 p-3 flex justify-between sticky bottom-0 w-full">
      <SongDetail songs={songs} />
      <SongPlayer songs={songs} />
      <VolumeTrackbar />
    </div>
  );
};
