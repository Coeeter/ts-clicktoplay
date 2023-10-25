import { getFavoriteSongs } from '@/actions/library';
import { getCreatedPlaylists } from '@/actions/playlist';
import { getCreatedSongs, getSongById } from '@/actions/songs';
import { SongList } from '@/components/songs/SongList';
import { getServerSession } from '@/lib/auth';
import { extractMainColor } from '@/utils/extractMainColor';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FavoriteButton } from './_components/FavoriteButton';
import { MoreOptionsButton } from './_components/MoreOptionsButton';
import { PlayButton } from './_components/PlayButton';
import { Metadata } from 'next';
import { NavbarMetadata } from '@/components/navigation/navbar/NavbarMetadata';

type SongPageProps = {
  params: { songId: string };
  searchParams: { page: string };
};

export async function generateMetadata({
  params,
}: {
  params: { songId: string };
}): Promise<Metadata> {
  const [error, song] = await getSongById(params.songId);
  if (error || !song) return { title: 'ClickToPlay' };
  return {
    title: `${song.title} - song by ${song.artist} | ClickToPlay`,
  };
}

const SongPage = async ({ params: { songId } }: SongPageProps) => {
  const session = await getServerSession();

  const [err, song] = await getSongById(songId);

  if (err || !song) return redirect('/');

  const createdPlaylists = session
    ? (await getCreatedPlaylists(session)).filter(p => !p.isFavoritePlaylist)
    : [];

  const [errorGettingSongs, songs] = await getCreatedSongs(song.uploaderId);

  if (errorGettingSongs || !songs) return redirect('/');

  const allSongs = songs.filter(s => s.id !== song.id);

  const [error, favoriteSongs] = session
    ? await getFavoriteSongs()
    : [null, []];

  if (error || favoriteSongs === null) return redirect('/');

  const minutes = Math.floor(song.duration / 60);
  const seconds = Math.floor(song.duration % 60);
  const duration = `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;

  const primaryColor = await extractMainColor(song.albumCover, '#64748b');

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="p-6 pb-0 rounded-t-lg pt-[76px]"
        style={{
          backgroundImage: `linear-gradient(${primaryColor.vibrant}, ${primaryColor.darkVibrant})`,
        }}
      >
        <header className="flex gap-4">
          <img
            src={song?.albumCover ?? '/album-cover.png'}
            alt={song.title}
            className={`w-48 shadow-2xl h-48 rounded-xl object-cover bg-slate-100`}
          />
          <div className="flex flex-col justify-end">
            <span className="text-lg text-slate-200">Song</span>
            <div className="text-6xl text-slate-200 font-bold mb-6">
              {song.title}
            </div>
            <span className="text-md truncate mb-3">
              <span className="text-slate-200 font-semibold">
                {song.artist?.length ? song.artist : 'Unknown artist'}
              </span>
              {' • ' +
                duration +
                ' • ' +
                song.playhistories.length.toLocaleString() +
                ' plays'}
            </span>
            <span>
              {'Uploaded by '}
              <Link
                href={`/profile/${song.uploaderId}`}
                className="text-slate-200 font-semibold hover:underline"
              >
                {song.uploader.name}
              </Link>
              {', ' +
                formatDistanceToNow(new Date(song.createdAt), {
                  addSuffix: true,
                }).toString()}
            </span>
          </div>
        </header>
      </div>
      <div
        className="pt-4 px-6 h-full gap-4 flex flex-col min-h-[500px]"
        style={{
          background: `linear-gradient(${primaryColor.darkVibrant} , rgb(30 41 59 / 1) 300px)`,
        }}
      >
        <section className="flex gap-6 mt-3">
          <PlayButton
            song={song}
            songs={[song, ...allSongs]}
            session={session}
          />
          <FavoriteButton
            song={song}
            session={session}
            isFavorite={favoriteSongs.find(s => s.id === song.id) !== undefined}
          />
          {session && (
            <MoreOptionsButton
              song={song}
              session={session}
              songs={[song, ...allSongs]}
              isFavorite={
                favoriteSongs.find(s => s.id === song.id) !== undefined
              }
              playlists={createdPlaylists}
            />
          )}
        </section>
        <section className="flex flex-col gap-2">
          <header>
            Other songs by{' '}
            <Link
              href={`/profile/${song.uploaderId}`}
              className="text-slate-200 font-semibold hover:underline"
            >
              {song.uploader.name}
            </Link>
          </header>
          <SongList
            songs={allSongs}
            favoriteSongs={favoriteSongs}
            playlists={createdPlaylists}
            session={session}
            type="list"
          />
          <NavbarMetadata
            session={session}
            type="song"
            colors={primaryColor}
            song={song}
            songsInQueue={[song, ...allSongs]}
          />
        </section>
      </div>
    </div>
  );
};

export default SongPage;
