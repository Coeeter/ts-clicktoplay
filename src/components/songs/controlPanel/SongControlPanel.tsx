import { getSongs } from '@/actions/songs';
import { SongDetail } from './SongDetail';
import { VolumeTrackbar } from './VolumeTrackbar';
import { SongPlayer } from './SongPlayer';
import { getServerSession } from '@/lib/auth';

export const SongControlPanel = async () => {
  const songs = await getSongs();
  const session = await getServerSession();

  return (
    <div className="bg-slate-800 text-slate-300 p-3 flex justify-between sticky bottom-0 w-full">
      <SongDetail songs={songs} />
      <SongPlayer songs={songs} session={session} />
      <VolumeTrackbar />
    </div>
  );
};
