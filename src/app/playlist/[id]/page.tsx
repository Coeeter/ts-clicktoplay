import { getCreatedPlaylists, getPlaylistById } from '@/actions/playlist';
import { getSongs } from '@/actions/songs';
import { MoreOptionsButton } from '@/components/playlist/MoreOptionsButton';
import { OpenPlaylistModal } from '@/components/playlist/OpenEditModal';
import { PlaylistPlayButton } from '@/components/playlist/PlayButton';
import { PlaylistItemList } from '@/components/playlist/PlaylistItemList';
import { getServerSession } from '@/lib/auth';
import { NotFoundError, sortLinkedList } from '@/utils';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MdFavorite } from 'react-icons/md';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const [error, playlist] = await getPlaylistById(params.id);
  if (error || !playlist) return { title: 'ClickToPlay' };
  return {
    title: `${playlist.title} - playlist by ${playlist.creator.name} | ClickToPlay`,
  };
}

export default async function PlaylistScreen({
  params: { id },
}: {
  params: { id: string };
}) {
  const [error, playlist] = await getPlaylistById(id);
  if (error || !playlist) redirect('/');
  let session = await getServerSession();
  const playlists = session ? await getCreatedPlaylists(session) : [];
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
      <header className="flex gap-4">
        <OpenPlaylistModal session={session} playlist={playlist} type="edit">
          <img
            src={playlist.image ?? '/playlist-cover.png'}
            alt={playlist.title}
            className="w-48 shadow-2xl h-48 rounded-xl bg-slate-100 object-cover cursor-pointer"
          />
        </OpenPlaylistModal>
        <div className="flex flex-col justify-end">
          <span className="text-lg">Playlist</span>
          <OpenPlaylistModal session={session} playlist={playlist} type="edit">
            <div className="text-6xl text-slate-200 font-bold mb-6 cursor-pointer">
              {playlist.title}
            </div>
            {playlist.description && (
              <div className="text-md line-clamp-2 text-slate-300/50 max-w-12 mb-3 cursor-pointer">
                {playlist.description}
              </div>
            )}
          </OpenPlaylistModal>
          <span className="text-md truncate">
            <span className="text-slate-200 font-semibold">
              {playlist.creator.name + ' • ' + playlist.items.length + ' songs'}
            </span>
            {', around ' + totalDuration}
          </span>
        </div>
      </header>
      <section className="flex gap-4 mt-3">
        <PlaylistPlayButton playlist={playlist} />
        {playlist.creatorId !== session?.user.id && (
          <button className="text-blue-500 p-3 rounded-full transition hover:scale-[1.1]">
            <MdFavorite className="w-8 h-8" />
          </button>
        )}
        <MoreOptionsButton playlist={playlist} session={session} />
      </section>
      <header className="grid grid-cols-3 px-6 py-3 bg-slate-900 text-slate-300/50 font-semibold border-b-2 border-slate-300/20 sticky top-0">
        <div className="flex gap-6">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
        </div>
        <div className="text-start">Date added</div>
        <div className="text-end">Time</div>
      </header>
      <PlaylistItemList
        songs={songsInPlaylist}
        playlist={playlist}
        createdPlaylists={playlists}
      />
    </div>
  );
}
