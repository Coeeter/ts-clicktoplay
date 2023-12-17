import { getFavoriteSongs } from '@/actions/library';
import { getCreatedPlaylists } from '@/actions/playlist';
import { ArtistList } from '@/components/artists/ArtistList';
import { PlaylistList } from '@/components/playlist/search/PlaylistList';
import { SongList } from '@/components/songs/SongList';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { TbPlaylist } from 'react-icons/tb';

export default async function SearchPage() {
  const session = await getServerSession();

  const createdPlaylists = session ? await getCreatedPlaylists(session) : [];
  let [err, favoriteSongs] = await getFavoriteSongs();

  if (err || !favoriteSongs) {
    favoriteSongs = [];
  }

  const mostPlayedSongs = await prisma.song.findMany({
    orderBy: {
      playhistories: {
        _count: 'desc',
      },
    },
    take: 6,
    include: {
      playhistories: true,
    },
  });

  const mostPlayedPlayists = await prisma.playlist.findMany({
    orderBy: {
      PlayHistory: {
        _count: 'desc',
      },
    },
    take: 20,
    include: {
      PlayHistory: true,
      creator: true,
      items: true,
    },
    where: {
      isFavoritePlaylist: false,
      isPublic: true,
    },
  });

  const mostPlayedArtists = await prisma.artist.findMany({
    orderBy: {
      playHistory: {
        _count: 'desc',
      },
    },
    take: 20,
    include: {
      playHistory: true,
      songs: true,
    },
  });

  return (
    <div className="px-6 pt-[64px] pb-8">
      <SongList
        favoriteSongs={favoriteSongs}
        playlists={createdPlaylists}
        songs={mostPlayedSongs}
        type="list"
        highlight
      />
      <h2 className="text-2xl font-bold mt-3 mb-2 text-slate-200">
        Featured Playlists <TbPlaylist className="inline" />
      </h2>
      <PlaylistList playlists={mostPlayedPlayists} />
      <h2 className="text-2xl font-bold my-3 text-slate-200">
        Popular Artists
      </h2>
      <ArtistList artists={mostPlayedArtists} />
    </div>
  );
}
