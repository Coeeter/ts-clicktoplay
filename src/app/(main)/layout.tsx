import { getQueue } from '@/actions/queue';
import { Toast } from '@/components/Toast';
import { ContextMenu } from '@/components/menu/ContextMenu';
import { DeletePlaylistModal } from '@/components/modals/PlaylistModal/DeletePlaylistModal';
import { EditPlaylistModal } from '@/components/modals/PlaylistModal/EditPlaylistModal';
import BottomNavigationBar from '@/components/navigation/bottom-navbar/bottom-navbar';
import { Navbar } from '@/components/navigation/navbar/Navbar';
import { Sidebar } from '@/components/navigation/sidebar/Sidebar';
import { MainProvider } from '@/components/providers/MainProvider';
import { SongControlPanel } from '@/components/songs/controlPanel/SongControlPanel';
import { Tooltip } from '@/components/tooltip/ToolTip';
import { getServerSession } from '@/lib/auth';
import { ReactNode } from 'react';

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession();
  const queue = session ? await getQueue(session) : null;

  return (
    <MainProvider queue={queue} session={session}>
      <div className="flex flex-col w-full h-full">
        <div className="flex relative md:p-3 pb-0 gap-3 flex-1">
          <Sidebar />
          <div
            id="root"
            className="flex flex-col w-full min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] md:bg-slate-800 md:min-h-[calc(100vh-6.25rem)] md:max-h-[calc(100vh-6.25rem)] rounded-md pb-3 no-scrollbar overflow-y-scroll relative"
          >
            <Navbar />
            <main className="h-full">{children}</main>
          </div>
        </div>
        <ContextMenu />
        <Toast />
        <SongControlPanel />
        <BottomNavigationBar />
      </div>
      <EditPlaylistModal />
      <DeletePlaylistModal />
      <Tooltip />
    </MainProvider>
  );
};

export default MainLayout;
