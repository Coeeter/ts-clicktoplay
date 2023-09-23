'use client';

import { Button } from '@/components/forms/Button';
import { Modal } from '../Modal';
import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { deletePlaylist } from '@/actions/playlist';
import { useToastStore } from '@/store/ToastStore';
import { usePathname } from 'next/navigation';

export const DeletePlaylistModal = () => {
  const isOpen = usePlaylistModalStore(state => state.isOpen);
  const close = usePlaylistModalStore(state => state.close);
  const type = usePlaylistModalStore(state => state.type);
  const playlist = usePlaylistModalStore(state => state.playlist);
  const createToast = useToastStore(state => state.createToast);
  const pathname = usePathname();

  return (
    <Modal
      isOpen={isOpen && type === 'delete' && !!playlist}
      close={close}
      title="Delete Playlist"
    >
      <p className="text-md text-slate-200">
        Are you sure you want to delete the playlist{' '}
        <span className="font-bold">{playlist?.title}</span>? This action cannot
        be undone.
      </p>
      <div className="flex gap-2 mt-4">
        <Button className="flex-1" onClick={close}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-red-500 hover:bg-red-600"
          onClick={async () => {
            const [error] = await deletePlaylist({
              playlistId: playlist!.id,
              path: pathname,
            });
            if (error) return createToast(error, 'error');
            close();
          }}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
};
