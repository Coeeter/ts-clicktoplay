import { Song } from '@prisma/client';

export const SongItem = ({ song }: { song: Song }) => {
  const minutes = Math.floor(song.duration / 60);
  const seconds = Math.floor(song.duration % 60);
  const duration = `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;

  return (
    <div className="flex bg-slate-800">
      <img
        src={song.albumCover || 'album-cover.png'}
        className="w-24 aspect-square"
        alt={song.title}
      />
      {song.title} {song.artist} {duration}
    </div>
  );
};
