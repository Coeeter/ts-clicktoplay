'use client';
import { Song } from '@prisma/client';
import Link from 'next/link';
import { FaPlay } from 'react-icons/fa';
import { useRef } from 'react';
import { useQueueStore } from '@/store/QueueStore';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useToastStore } from '@/store/ToastStore';
import {
  Playlist,
  addSongsToPlaylist,
  createPlaylist,
} from '@/actions/playlist';

type SongItemProps = {
  song: Song;
  playlists: Playlist[];
  playSong: () => void;
};

export const SongItem = ({ song, playlists, playSong }: SongItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const minutes = Math.floor(song.duration / 60);
  const seconds = Math.floor(song.duration % 60);
  const duration = `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
  const albumCover = song.albumCover ?? '/album-cover.png';
  const artist = song.artist?.length ? song.artist : 'Unknown';

  const { contextMenuHandler } = useContextMenu();
  const addToQueue = useQueueStore(state => state.addSongToQueue);
  const showToast = useToastStore(state => state.createToast);

  return (
    <Link
      href={`/songs/${song.id}`}
      onContextMenu={contextMenuHandler([
        {
          label: 'Play',
          onClick: playSong,
        },
        {
          label: 'Add to Queue',
          onClick: () => {
            addToQueue(song.id);
            showToast('Added to Queue', 'success');
          },
        },
        {
          label: 'Add to Playlist',
          subMenu: [
            {
              label: 'New Playlist',
              onClick: async () => {
                const playlist = await createPlaylist({
                  title: song.title,
                  image: song.albumCover,
                });
                await addSongsToPlaylist({
                  playlistId: playlist.id,
                  songIds: [song.id],
                });
                showToast(`Added to playlist '${playlist.title}'`, 'success');
              },
              divider: true,
            },
            ...playlists.map(playlist => ({
              label: playlist.title,
              onClick: async () => {
                try {
                  await addSongsToPlaylist({
                    playlistId: playlist.id,
                    songIds: [song.id],
                  });
                  showToast(`Added to playlist '${playlist.title}'`, 'success');
                } catch (e) {
                  if (e instanceof Error) showToast(e.message, 'error');
                }
              },
            })),
            ...(!playlists.length
              ? [{ label: 'No playlists found', selectable: false }]
              : []),
          ],
        },
        {
          label: 'Add to Library',
          onClick: () => {},
        },
      ])}
      onClick={e => {
        e.preventDefault();
        if (
          e.target === ref.current ||
          ref.current?.contains(e.target as Node)
        ) {
          return;
        }
        e.defaultPrevented = false;
      }}
    >
      <div className="flex flex-col gap-2 bg-gradient-to-b from-slate-900 to-slate-100/5 p-3 rounded-md w-48 group cursor-pointer hover:bg-slate-700 transition-colors duration-300">
        <div className="relative">
          <img
            src={albumCover}
            alt="Album Cover"
            className="w-full aspect-square rounded-md box-border object-cover group-hover:shadow-xl transition-shadow duration-300 group-hover:shadow-slate-800"
          />
          <div
            ref={ref}
            className="absolute right-0 bottom-0 p-4 rounded-full bg-blue-700 m-3 opacity-0 translate-y-5 hover:scale-110 group-hover:translate-y-0 group-hover:opacity-100 duration-300 transition-all"
            onClick={playSong}
          >
            <FaPlay className="text-white" size={16} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white font-bold">{song.title}</span>
          <div className="flex justify-between gap-2 w-full max-w-full">
            <span className="text-gray-400 truncate">{artist}</span>
            <span className="text-gray-400">{duration}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
