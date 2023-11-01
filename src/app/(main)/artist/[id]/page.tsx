import { getFavoriteSongs } from '@/actions/library';
import { getCreatedPlaylists } from '@/actions/playlist';
import { SongList } from '@/components/songs/SongList';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';

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
    return <div>Not found</div>;
  }

  return (
    <>
      <img
        src={artist.image ?? '/default-user.png'}
        alt={artist.name}
        className="w-48 h-48 rounded-full shadow-xl"
      />
      <h2 className="text-4xl font-bold">{artist.name}</h2>
      <h3 className="text-2xl font-bold mt-4">Songs</h3>
      <p className="text-slate-300/75">
        {artist._count?.songs} songs • {artist._count?.playHistory} plays
      </p>
      <SongList
        favoriteSongs={favoriteSongs}
        playlists={playlists}
        session={session}
        songs={artist.songs}
        type="list"
      />
    </>
  );
};

export default ArtistPage;
