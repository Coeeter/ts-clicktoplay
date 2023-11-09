import { getQueue } from '@/actions/queue';
import { Toast } from '@/components/Toast';
import { ContextMenu } from '@/components/menu/ContextMenu';
import { DeletePlaylistModal } from '@/components/modals/PlaylistModal/DeletePlaylistModal';
import { EditPlaylistModal } from '@/components/modals/PlaylistModal/EditPlaylistModal';
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
    <MainProvider queue={queue}>
      <div className="min-h-screen flex flex-col">
        <div className="flex relative p-3 pb-0 gap-3 flex-1">
          <Sidebar />
          <div
            id="root"
            className="flex flex-col w-full bg-slate-800 min-h-[calc(100vh-6.25rem)] max-h-[calc(100vh-6.25rem)] rounded-md pb-3 no-scrollbar overflow-y-scroll relative"
          >
            <Navbar />
            <main className="h-full">{children}</main>
          </div>
        </div>
        <ContextMenu />
        <Toast />
        <SongControlPanel />
      </div>
      <EditPlaylistModal />
      <DeletePlaylistModal />
      <Tooltip />
    </MainProvider>
  );
};

export default MainLayout;
