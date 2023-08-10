import { getSongs } from '@/lib/songs';
import { SongDetail } from './SongDetail';
import { VolumeTrackbar } from './VolumeTrackbar';

export const SongControlPanel = async () => {
  const songs = await getSongs();

  return (
    <div className="bg-slate-800 text-slate-300 p-3 flex sticky bottom-0 w-full justify-between">
      <SongDetail songs={songs} />
      <VolumeTrackbar />
    </div>
  );
};

export const dynamic = 'full-dynamic';
