'use client';
import { useContextMenu, useContextMenuItems } from '@/hooks/useContextMenu';
import { NavigationLink } from '@/hooks/useNavigation';
import { useQueueStore } from '@/store/QueueStore';
import { Artist, Song } from '@prisma/client';
import { Session } from 'next-auth';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';

type ArtistListProps = {
  artists: (Artist & {
    songs: Song[];
  })[];
  session: Session | null;
};

export const ArtistList = ({ artists, session }: ArtistListProps) => {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const element = document.querySelector('#root')!;
    const onResize = () => {
      setCols(Math.floor(element.clientWidth / 216));
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(element);
    onResize();
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex justify-between">
      {artists.slice(0, cols).map(artist => (
        <ArtistCard key={artist.id} artist={artist} session={session} />
      ))}
    </div>
  );
};

type ArtistCardProps = {
  artist: Artist & {
    songs: Song[];
  };
  session: Session | null;
};

const ArtistCard = ({ artist, session }: ArtistCardProps) => {
  const currentlyPlayingSong = useQueueStore(state => state.currentlyPlayingId);
  const queueItems = useQueueStore(state => state.items);
  const isPlaying = useQueueStore(state => state.isPlaying);
  const setPlaying = useQueueStore(state => state.setIsPlaying);
  const playSong = useQueueStore(state => state.playSong);
  const isCurrentArtist = useMemo(() => {
    const currentSongId = queueItems.find(
      item => item.id === currentlyPlayingSong
    )?.songId;
    if (!currentSongId) return false;
    const currentSong = artist.songs.find(song => song.id === currentSongId);
    return !!currentSong;
  }, [queueItems, currentlyPlayingSong]);

  const ref = useRef<HTMLButtonElement | null>(null);

  const contextMenuItems = useContextMenuItems({
    type: 'artist',
    artist,
    session,
  });

  const { contextMenuHandler } = useContextMenu(contextMenuItems);

  return (
    <NavigationLink
      onContextMenu={contextMenuHandler}
      className="w-48 flex flex-col gap-2 my-2 transition rounded-md p-2 bg-slate-100/5 hover:bg-slate-600 group"
      href={`/artist/${artist.id}`}
      onClick={e => {
        const isBtnClicked =
          e.target === ref.current ||
          ref.current?.contains(e.target as Node) === true;
        return !isBtnClicked;
      }}
    >
      <div className="relative w-full aspect-square">
        <Image
          src={artist.image ?? '/default-user.png'}
          alt={artist.name}
          className={`w-full aspect-square object-cover rounded-full group-hover:shadow-xl group-hover:shadow-slate-800 transition ${
            artist.image ? '' : 'bg-slate-200'
          }`}
          width={184}
          height={184}
        />
        <button
          ref={ref}
          className={`absolute right-0 bottom-0 m-3 p-4 rounded-full hover:scale-110 bg-blue-700 duration-300 transition-all ${
            isPlaying && isCurrentArtist
              ? 'opacity-100'
              : 'opacity-0 translate-y-5 group-hover:translate-y-0 group-hover:opacity-100'
          }`}
          onClick={() => {
            if (isCurrentArtist) {
              setPlaying(!isPlaying);
              return;
            }
            playSong(artist.songIds[0], artist.songIds);
          }}
        >
          {isPlaying && isCurrentArtist ? (
            <FaPause className="text-white" size={16} />
          ) : (
            <FaPlay className="text-white" size={16} />
          )}
        </button>
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-slate-200 truncate">
          {artist.name}
        </h3>
        <p className="text-sm text-slate-300/75 truncate">
          Artist • {artist.songs.length} songs
        </p>
      </div>
    </NavigationLink>
  );
};
