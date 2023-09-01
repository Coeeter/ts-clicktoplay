import { Playlist, getPlaylistById } from '@/actions/playlist';
import { getSongs } from '@/actions/songs';
import { NotFoundError, sortLinkedList } from '@/utils';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const playlist = await getPlaylistById(params.id);
  return {
    title: `${playlist.title} - playlist by ${playlist.creator.name} | ClickToPlay`,
  };
}

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
  const totalDurationInMinutes = Math.floor(
    songsInPlaylist.reduce((acc, song) => acc + song.duration, 0) / 60
  );

  const hours = Math.floor(totalDurationInMinutes / 60);
  const minutes = totalDurationInMinutes % 60;
  const isInMinutes = totalDurationInMinutes < 60;
  const totalDuration = isInMinutes
    ? `${totalDurationInMinutes} min`
    : `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <img
          src={playlist.image ?? '/playlist-cover.png'}
          alt={playlist.title}
          className="w-48 shadow-2xl aspect-square rounded-md bg-slate-100 object-cover"
        />
        <div className="flex flex-col justify-end">
          <span className="text-lg">Playlist</span>
          <div className="text-6xl text-slate-200 font-bold mb-6">
            {playlist.title}
          </div>
          <span className="text-md truncate">
            <span className="text-slate-200 font-semibold">
              {playlist.creator.name + ' • ' + playlist.items.length + ' songs'}
            </span>
            {', around ' + totalDuration}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-2xl text-slate-200 font-semibold">
          {'Songs in ' + playlist.title}
        </div>
        <div className="flex flex-col gap-4">
          {songsInPlaylist.map(song => {
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
