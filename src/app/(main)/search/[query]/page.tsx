import { prisma } from '@/lib/database';

const searchTypeToTitle = {
  songs: 'Songs',
  playlists: 'Playlists',
  artists: 'Artists',
  profiles: 'Profiles',
} as const;

const searchOrder = ['songs', 'playlists', 'artists', 'profiles'] as const;

export default async function SearchResultsPage({
  params: { query },
}: {
  params: { query: string };
}) {
  const songs = prisma.song.findMany({
    where: {
      title: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
    },
  });

  const playlists = prisma.playlist.findMany({
    where: {
      title: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
      isFavoritePlaylist: false,
    },
  });

  const artists = prisma.artist.findMany({
    where: {
      name: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
    },
  });

  const profiles = prisma.user.findMany({
    where: {
      name: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
    },
  });

  const [songsResult, playlistResult, artistResult, profileResult] =
    await Promise.all([songs, playlists, artists, profiles]);

  const resultsCount =
    songsResult.length +
    playlistResult.length +
    artistResult.length +
    profileResult.length;

  if (resultsCount === 0) {
    return (
      <div className="px-6 pt-[64px]">
        <h2 className="text-xl text-slate-300 mt-6">No results found</h2>
      </div>
    );
  }

  return (
    <div className="px-6 pt-[64px]">
      <h2 className="text-xl text-slate-300 mt-6">
        {resultsCount} results for "{decodeURIComponent(query)}"
      </h2>
    </div>
  );
}
