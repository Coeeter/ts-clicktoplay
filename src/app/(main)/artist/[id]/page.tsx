import { getFavoriteSongs } from '@/actions/library';
import { getCreatedPlaylists } from '@/actions/playlist';
import { NavbarMetadata } from '@/components/navigation/navbar/NavbarMetadata';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { extractMainColor } from '@/utils/extractMainColor';
import { notFound } from 'next/navigation';
import { PlayButton } from '../../songs/[songId]/_components/PlayButton';
import { SongList } from '@/components/songs/SongList';
import { ArtistMoreOptionsButton } from './_components/ArtistMoreOptionsButton';
import { ArtistImage } from './_components/ArtistImage';
import { Metadata } from 'next/types';

const getArtist = async (id: string) => {
  return await prisma.artist.findUnique({
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
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const artist = await getArtist(params.id);
  if (!artist) return { title: 'ClickToPlay' };
  return {
    title: `${artist.name} - Artist | ClickToPlay`,
  };
}

const ArtistPage = async ({ params: { id } }: { params: { id: string } }) => {
  const artist = await getArtist(id);
  const session = await getServerSession();
  const [err, favoriteSongs] = session ? await getFavoriteSongs() : [null, []];
  const playlists = session ? await getCreatedPlaylists(session) : [];

  if (!artist || err || !favoriteSongs) {
    notFound();
  }

  const primaryColor = await extractMainColor(artist.image, '#243d82');

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarMetadata type="artist" artist={artist} colors={primaryColor}>
        <div
          className="p-6 pb-0 rounded-t-lg pt-[76px] relative"
          style={{
            background: `linear-gradient(${primaryColor.vibrant}, ${primaryColor.darkVibrant})`,
          }}
        >
          {artist.image && (
            <ArtistImage
              image={artist.image}
              primaryColor={primaryColor.vibrant}
            />
          )}
          <header className="flex flex-col justify-end h-[calc(100vh*0.3)] relative pb-6">
            <span className="text-lg text-slate-200">Artist</span>
            <div className="text-8xl text-slate-200 font-bold mb-6">
              {artist.name}
            </div>
            <span className="text-md truncate text-slate-300/75">
              <span className="text-slate-200 font-semibold">
                {artist.songIds.length +
                  ' songs' +
                  ' • ' +
                  artist._count.playHistory +
                  ' plays'}
              </span>
            </span>
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
          <PlayButton song={artist.songs[0]} songs={artist.songs} />
          {session && <ArtistMoreOptionsButton artist={artist} />}
        </section>
        <div className="px-6">
          <SongList
            favoriteSongs={favoriteSongs}
            playlists={playlists}
            songs={artist.songs}
            type="list"
          />
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
