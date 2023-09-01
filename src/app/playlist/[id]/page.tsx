import { Playlist, getPlaylistById } from '@/actions/playlist';
import { getSongs } from '@/actions/songs';
import { NotFoundError, sortLinkedList } from '@/utils';
import { redirect } from 'next/navigation';

export default async function PlaylistScreen({
  params: { id },
}: {
  params: { id: string };
}) {
  let playlist: Playlist;
  try {
    playlist = await getPlaylistById(id);
  } catch (e) {
    redirect('/');
  }
  const songs = await getSongs();
  const songsInPlaylist = sortLinkedList(playlist.items).map(playlistItem => {
    const song = songs.find(song => song.id === playlistItem.songId);
    if (!song) throw new NotFoundError('Song not found');
    return song;
  });
  const totalDurationInMinutes = songsInPlaylist.reduce(
    (acc, song) => acc + song.duration,
    0
  );
  const totalDuration = Math.floor(totalDurationInMinutes / 60);


  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <img
          src={playlist.image ?? '/playlist-cover.png'}
          alt={playlist.title}
          className="w-48 shadow-2xl aspect-square rounded-md bg-slate-100 object-cover"
        />
        <div className="flex flex-col justify-end">
          <span className='text-lg'>Playlist</span>
          <div className="text-6xl text-slate-200 font-bold mb-6">
            {playlist.title}
          </div>
          <span className="text-md truncate">
            <span className="text-slate-200 font-semibold">
              {playlist.creator.name + ' • ' + playlist.items.length + ' songs'}
            </span>
            {', around ' + totalDuration + ' minutes'}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-2xl text-slate-200 font-semibold">
          {'Songs in ' + playlist.title}
        </div>
        <div className="flex flex-col gap-4">
          {playlist.items.map(playlistItem => {
            const song = songs.find(song => song.id === playlistItem.songId);
            if (!song) return null;
            return (
              <div className="flex gap-3 p-3">
                <img
                  src={song.albumCover ?? '/album-cover.png'}
                  alt={song.title}
                  className="w-14 aspect-square rounded-md bg-slate-100 object-cover"
                />
                <div className="flex flex-col justify-between">
                  <div className="text-md text-slate-200 font-semibold">
                    {song.title}
                  </div>
                  <span className="text-sm truncate">
                    {song.artist ?? 'Unknown'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
