import { getCreatedSongs, getSongById } from '@/actions/songs';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PlayButton } from './_components/PlayButton';
import { MoreOptionsButton } from './_components/MoreOptionsButton';
import { getServerSession } from '@/lib/auth';
import { SongList } from '@/components/songs/SongList';
import { getFavoriteSongs } from '@/actions/library';
import { getCreatedPlaylists } from '@/actions/playlist';
import { FavoriteButton } from './_components/FavoriteButton';

type SongPageProps = {
  params: { songId: string };
  searchParams: { page: string };
};

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

  const [error, favoriteSongs] = await getFavoriteSongs();

  if (error || !favoriteSongs) return redirect('/');

  const minutes = Math.floor(song.duration / 60);
  const seconds = Math.floor(song.duration % 60);
  const duration = `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex gap-4">
        <img
          src={song?.albumCover ?? '/album-cover.png'}
          alt={song.title}
          className={`w-48 shadow-2xl h-48 rounded-xl object-cover bg-slate-100`}
        />
        <div className="flex flex-col justify-end">
          <span className="text-lg">Song</span>
          <div className="text-6xl text-slate-200 font-bold mb-6">
            {song.title}
          </div>
          <span className="text-md truncate mb-3">
            <span className="text-slate-200 font-semibold">{song.artist}</span>
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
      <section className="flex gap-6 mt-3">
        <PlayButton song={song} songs={[song, ...allSongs]} />
        <FavoriteButton
          song={song}
          isFavorite={favoriteSongs.find(s => s.id === song.id) !== undefined}
        />
        <MoreOptionsButton
          song={song}
          session={session}
          songs={[song, ...allSongs]}
          isFavorite={favoriteSongs.find(s => s.id === song.id) !== undefined}
          playlists={createdPlaylists}
        />
      </section>
      <section className="flex flex-col gap-2">
        <header className="flex flex-col mt-4 items-start">
          <span className="text-sm">Other songs uploaded by </span>
          <Link
            href={`/profile/${song.uploaderId}`}
            className="text-slate-200 text-3xl font-bold hover:underline inline"
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
      </section>
    </div>
  );
};

export default SongPage;
