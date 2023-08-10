import { getSongs } from '@/lib/songs';
import { SongDetail } from './SongDetail';

export const SongControlPanel = async () => {
  const songs = await getSongs();

  return (
    <div className="bg-slate-800 text-slate-300 p-3 flex w-full sticky bottom-0">
      <SongDetail songs={songs} />
    </div>
  );
};

export const dynamic = 'full-dynamic';
