import { getCreatedPlaylists, getPlaylistById } from '@/actions/playlist';
import { getSongs } from '@/actions/songs';
import { MoreOptionsButton } from '@/components/playlist/MoreOptionsButton';
import { OpenPlaylistModal } from '@/components/playlist/OpenEditModal';
import { PlaylistPlayButton } from '@/components/playlist/PlayButton';
import { PlaylistItemList } from '@/components/playlist/PlaylistItemList';
import { getServerSession } from '@/lib/auth';
import { NotFoundError, sortLinkedList } from '@/utils';
import { extractMainColor } from '@/utils/extractMainColor';
import { Metadata } from 'next';
import Link from 'next/link';
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
  const session = await getServerSession();
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

  const primaryColor = await extractMainColor(
    playlist.image,
    playlist.isFavoritePlaylist ? '#35547f' : '#64748b'
  );

  return (
    <div className="flex flex-col h-full">
      <div
        className="p-6 pb-0 rounded-t-lg"
        style={{
          background: `linear-gradient(${primaryColor.vibrant}, ${primaryColor.darkVibrant})`,
        }}
      >
        <header className="flex gap-4">
          <OpenPlaylistModal session={session} playlist={playlist} type="edit">
            <img
              src={
                playlist.isFavoritePlaylist
                  ? '/favorites.png'
                  : playlist.image ?? '/playlist-cover.png'
              }
              alt={playlist.title}
              className={`w-48 shadow-2xl h-48 rounded-xl object-cover ${
                !playlist.isFavoritePlaylist && !playlist.image
                  ? 'bg-slate-100'
                  : ''
              }`}
            />
          </OpenPlaylistModal>
          <div className="flex flex-col justify-end">
            <span className="text-lg text-slate-200">Playlist</span>
            <OpenPlaylistModal
              session={session}
              playlist={playlist}
              type="edit"
            >
              <div className="text-6xl text-slate-200 font-bold mb-6">
                {playlist.title}
              </div>
              {playlist.description && (
                <div className="text-md line-clamp-2 text-slate-300/50 max-w-12 mb-3">
                  {playlist.description}
                </div>
              )}
            </OpenPlaylistModal>
            <span className="text-md truncate">
              <span className="text-slate-200 font-semibold">
                <Link
                  href={`/profile/${playlist.creatorId}`}
                  className="hover:underline"
                >
                  {playlist.creator.name}
                </Link>
                {' • ' + playlist.items.length + ' songs'}
              </span>
              {', around ' + totalDuration}
            </span>
          </div>
        </header>
      </div>
      <div
        className="pt-4 px-6 h-full gap-4 flex flex-col"
        style={{
          background: `linear-gradient(${primaryColor.darkVibrant} , rgb(30 41 59 / 1) 300px)`,
        }}
      >
        <section className="flex gap-4 mt-3">
          <PlaylistPlayButton playlist={playlist} session={session} />
          {playlist.creatorId !== session?.user.id && (
            <button className="text-blue-500 p-3 rounded-full transition hover:scale-[1.1]">
              <MdFavorite className="w-8 h-8" />
            </button>
          )}
          {session && (
            <MoreOptionsButton playlist={playlist} session={session} />
          )}
        </section>
        <header className="grid grid-cols-3 px-6 py-3 text-slate-300/50 font-semibold border-b-2 border-slate-300/20 sticky top-0">
          <div className="flex gap-6">
            <div className="w-8 text-center">#</div>
            <div>Title</div>
          </div>
          <div className="text-start">Date added</div>
          <div className="text-end mr-8">Time</div>
        </header>
        <PlaylistItemList
          songs={songsInPlaylist}
          playlist={playlist}
          session={session}
          createdPlaylists={playlists.filter(p => !p.isFavoritePlaylist)}
          favoriteSongs={
            playlists
              .find(p => p.isFavoritePlaylist)
              ?.items.map(item =>
                songs.find(song => song.id === item.songId)
              ) ?? []
          }
        />
      </div>
    </div>
  );
}
