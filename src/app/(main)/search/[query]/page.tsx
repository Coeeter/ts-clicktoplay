import { prisma } from '@/lib/database';
import { z } from 'zod';

const SearchTypeSchema = z
  .enum(['songs', 'playlists', 'artists', 'profiles'])
  .optional();

type SearchType = z.infer<typeof SearchTypeSchema>;

const searchTypeToTitle = {
  songs: 'Songs',
  playlists: 'Playlists',
  artists: 'Artists',
  profiles: 'Profiles',
} as const;

const searchOrder = ['artists', 'playlists', 'songs', 'profiles'] as const;

export default async function SearchResultsPage({
  params: { query },
}: {
  params: { query: string };
}) {
  const results = {
    songs: await prisma.song.findMany({
      where: {
        title: {
          contains: decodeURIComponent(query),
          mode: 'insensitive',
        },
      },
    }),
    playlists: await prisma.playlist.findMany({
      where: {
        title: {
          contains: decodeURIComponent(query),
          mode: 'insensitive',
        },
        isFavoritePlaylist: false,
      },
    }),
    artists: await prisma.song.findMany({
      where: {
        artist: {
          contains: decodeURIComponent(query),
          mode: 'insensitive',
        },
      },
      distinct: ['artist'],
      select: {
        artist: true,
      },
    }),
    profiles: await prisma.user.findMany({
      where: {
        name: {
          contains: decodeURIComponent(query),
          mode: 'insensitive',
        },
      },
    }),
  } as const;

  const resultsCount = Object.values(results).reduce(
    (acc, cur) => acc + cur.length,
    0
  );

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
