'use client';
import { createPlaylist } from '@/actions/playlist';
import { useToolTip } from '@/hooks/useToolTip';
import { useToastStore } from '@/store/ToastStore';
import { usePathname } from 'next/navigation';
import { MdAdd } from 'react-icons/md';

type SidebarNewPlaylistButtonProps = {
  expanded?: boolean;
};

export const SidebarNewPlaylistButton = ({
  expanded = true,
}: SidebarNewPlaylistButtonProps) => {
  const pathname = usePathname();
  const createToast = useToastStore(state => state.createToast);
  const { register } = useToolTip({
    content: 'Create a new playlist',
  });

  if (!expanded) {
    return (
      <button
        type="submit"
        className="w-full flex justify-center items-center aspect-square rounded-md bg-slate-700 hover:bg-slate-600 transition text-slate-300"
        onClick={async () => {
          await createPlaylist({
            title: 'New Playlist',
            image: null,
            path: pathname,
          });
          createToast('Playlist created', 'success');
        }}
        {...register({
          place: 'right',
        })}
      >
        <MdAdd size={24} />
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="text-sm flex items-center text-slate-300/50 gap-2 hover:text-slate-200 transition rounded-md"
      onClick={async () => {
        await createPlaylist({
          title: 'New Playlist',
          image: null,
          path: pathname,
        });
        createToast('Playlist created', 'success');
      }}
    >
      <MdAdd size={20} />
      <span>New Playlist</span>
    </button>
  );
};
