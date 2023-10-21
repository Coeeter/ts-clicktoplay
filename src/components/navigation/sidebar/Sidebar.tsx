import { getCreatedPlaylists } from '@/actions/playlist/playlist';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { SidebarContent } from './SidebarContent';

export const Sidebar = async () => {
  const session = await getServerSession();
  const playlists = session
    ? (await getCreatedPlaylists(session))
        .filter(item => !item.isFavoritePlaylist || item.items.length)
        .sort(
          (a, b) => Number(b.isFavoritePlaylist) - Number(a.isFavoritePlaylist)
        )
    : [];

  const playHistory = await Promise.all(
    playlists.map(async playlist => {
      const history = await prisma.playHistory.aggregate({
        where: {
          userId: session?.user?.id,
          playlistId: playlist.id,
        },
        _max: {
          createdAt: true,
        },
      });
      return {
        id: playlist.id,
        lastPlayedAt: history._max?.createdAt,
      };
    })
  );

  const sideBarOpen = await prisma.user.findUnique({
    where: {
      id: session?.user.id,
    },
    select: {
      sideBarOpen: true,
    },
  })

  return (
    <SidebarContent
      session={session}
      playlists={playlists}
      playHistory={playHistory}
      sideBarOpen={sideBarOpen?.sideBarOpen ?? true}
    />
  );
};
