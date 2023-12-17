import { getFavoriteSongs } from '@/actions/library';
import { ArtistList } from '@/components/artists/ArtistList';
import { PlaylistList } from '@/components/playlist/search/PlaylistList';
import { SongList } from '@/components/songs/SongList';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import Link from 'next/link';

const badges = [
  {
    name: 'Songs',
    href: '/songs',
  },
  {
    name: 'Artists',
    href: '/artists',
  },
  {
    name: 'Playlists',
    href: '/playlists',
  },
  {
    name: 'Profiles',
    href: '/profiles',
  },
];

export default async function SearchResultsPage({
  params: { query },
}: {
  params: { query: string };
}) {
  const session = await getServerSession();

  const songs = prisma.song.findMany({
    where: {
      title: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
    },
    take: 6,
  });

  const playlists = prisma.playlist.findMany({
    where: {
      title: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
      isFavoritePlaylist: false,
    },
    include: {
      items: true,
      creator: true,
    },
  });

  const artists = prisma.artist.findMany({
    where: {
      name: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
    },
    include: {
      songs: true,
    },
  });

  const profiles = prisma.user.findMany({
    where: {
      name: {
        contains: decodeURIComponent(query),
        mode: 'insensitive',
      },
    },
    include: {
      uploadedSongs: true,
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

  const createdPlaylists = session
    ? await prisma.playlist.findMany({
        where: {
          creatorId: session?.user.id,
        },
        include: {
          items: true,
          creator: true,
        },
      })
    : [];

  const [, favoriteSongs] = session ? await getFavoriteSongs() : [null, []];

  return (
    <div className="px-6 pt-[64px] pb-5">
      <h2 className="text-2xl text-slate-300/50 mt-6 mb-3 font-normal">
        {resultsCount} results for "{decodeURIComponent(query)}"
      </h2>
      <div className="flex flex-wrap gap-2 pb-3 w-full">
        {badges.map(badge => (
          <Link
            key={badge.name}
            href={`/search/${encodeURIComponent(query)}${badge.href}`}
            className="inline-block bg-slate-100/5 px-3 py-1 rounded-md text-sm font-bold text-slate-300/75 hover:bg-slate-600 hover:text-slate-200 transition mr-2"
          >
            {badge.name}
          </Link>
        ))}
      </div>
      <SongList
        songs={songsResult}
        playlists={createdPlaylists}
        favoriteSongs={favoriteSongs ?? []}
        highlight={true}
        type="list"
        title={'Songs'}
      />
      {artistResult.length > 0 && (
        <h2 className="text-2xl font-bold text-slate-200 mb-2 mt-3">Artists</h2>
      )}
      <ArtistList artists={artistResult} justify="start" />
      {playlistResult.length > 0 && (
        <h2 className="text-2xl font-bold text-slate-200 mb-2 mt-3">
          Playlists
        </h2>
      )}
      <PlaylistList playlists={playlistResult} justify="start" />
      {profileResult.length > 0 && (
        <h2 className="text-2xl font-bold text-slate-200 mb-2 mt-3">
          Profiles
        </h2>
      )}
      {profileResult.map(profile => (
        <Link
          key={profile.id}
          className="flex items-center gap-3 py-2 px-3 rounded-md bg-slate-100/5 hover:bg-slate-600 transition cursor-pointer"
          href={`/profile/${profile.id}`}
        >
          <img
            src={profile.image ?? '/default-profile.png'}
            alt={profile.name ?? "User's profile picture"}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-200">{profile.name}</h3>
            <p className="text-slate-300/75 text-sm">
              <span className="font-bold">{profile.uploadedSongs.length}</span>{' '}
              Songs Uploaded
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
