import { getFavoriteSongs } from '@/actions/library';
import { getCreatedPlaylists } from '@/actions/playlist';
import { NavbarMetadata } from '@/components/navigation/navbar/NavbarMetadata';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { extractMainColor } from '@/utils/extractMainColor';
import { notFound } from 'next/navigation';
import { PlayButton } from '../../songs/[songId]/_components/PlayButton';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { SongList } from '@/components/songs/SongList';
import { ArtistMoreOptionsButton } from './_components/ArtistMoreOptionsButton';

const ArtistPage = async ({ params: { id } }: { params: { id: string } }) => {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      songs: true,
      _count: {
        select: {
          songs: true,
          playHistory: true,
        },
      },
    },
  });
  const session = await getServerSession();
  const [err, favoriteSongs] = await getFavoriteSongs();
  const playlists = session ? await getCreatedPlaylists(session) : [];

  if (!artist || err || !favoriteSongs) {
    notFound();
  }

  const primaryColor = await extractMainColor(artist.image, '#243d82');

  return (
    <div className="flex flex-col min-h-full">
      <NavbarMetadata
        session={session}
        type="artist"
        artist={artist}
        colors={primaryColor}
      >
        <div
          className="p-6 pb-0 rounded-t-lg pt-[76px]"
          style={{
            background: `linear-gradient(${primaryColor.vibrant}, ${primaryColor.darkVibrant})`,
          }}
        >
          <header className="flex gap-4">
            <img
              src={artist.image ?? '/default-user.png'}
              alt={artist.name}
              className={`w-48 h-48 overflow-hidden rounded-full object-cover ${
                !artist.image ? 'bg-slate-100' : ''
              }`}
            />
            <div className="flex flex-col justify-end">
              <span className="text-lg text-slate-200">Artist</span>
              <div className="text-6xl text-slate-200 font-bold mb-6">
                {artist.name}
              </div>
              {artist.description && (
                <div className="text-md line-clamp-2 text-slate-300/50 max-w-12 mb-3">
                  {artist.description}
                </div>
              )}
              <span className="text-md truncate text-slate-300/75">
                <span className="text-slate-200 font-semibold">
                  {artist.songIds.length + ' songs'}
                </span>
                {' • '}
                {artist._count.playHistory.toLocaleString() + ' total plays'}
              </span>
            </div>
          </header>
        </div>
      </NavbarMetadata>
      <div
        className="pt-4 h-full gap-4 flex flex-col min-h-[500px]"
        style={{
          background: `linear-gradient(${primaryColor.darkVibrant} , rgb(30 41 59 / 1) 300px)`,
        }}
      >
        <section className="flex gap-4 mt-3 items-center px-6">
          <PlayButton
            session={session}
            song={artist.songs[0]}
            songs={artist.songs}
          />
          <button className="text-4xl cursor-pointer">
            {true ? (
              <MdFavorite className="text-blue-700 hover:scale-110" />
            ) : (
              <MdFavoriteBorder className="text-slate-300/50 hover:scale-110" />
            )}
          </button>
          {session && (
            <ArtistMoreOptionsButton artist={artist} session={session} />
          )}
        </section>
        <div className="px-6">
          <SongList
            favoriteSongs={favoriteSongs}
            playlists={playlists}
            session={session}
            songs={artist.songs}
            type="list"
          />
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
