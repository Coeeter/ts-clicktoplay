'use client';

import { Playlist } from '@/actions/playlist';
import { PlayButton } from '@/app/(main)/songs/[songId]/_components/PlayButton';
import { PlaylistPlayButton } from '@/components/playlist/PlayButton';
import { useNavbarStore } from '@/store/NavbarStore/NavbarStore';
import { Artist, Song } from '@prisma/client';
import { Session } from 'next-auth';
import { useEffect, useRef } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';

type NavbarMetadataProps = {
  session?: Session | null;
  colors?: {
    darkVibrant?: string;
  };
} & (
  | {
      type: 'playlist';
      playlist: Playlist;
    }
  | {
      type: 'song';
      song: Song;
      songsInQueue: Song[];
    }
  | {
      type: 'search';
      text: string;
      onTextChange: (text: string) => void;
    }
  | {
      type: 'artist';
      artist: Artist & {
        songs: Song[];
      };
    }
) &
  (
    | {
        children?: React.ReactNode;
      }
    | {
        collapsePx?: number;
      }
  );

export const NavbarMetadata = ({
  colors,
  session,
  ...props
}: NavbarMetadataProps) => {
  const sticky = useNavbarStore(state => state.sticky);
  const setColor = useNavbarStore(state => state.setCollapseColor);
  const setContent = useNavbarStore(state => state.setContent);
  const setCollapsePx = useNavbarStore(state => state.setCollapsePx);
  const heightRef = useRef<HTMLDivElement | null>(null);

  if (props.type === 'playlist') {
    useEffect(() => {
      if (!session) return;
      setContent({
        node: (
          <div className="flex items-center gap-2">
            <PlaylistPlayButton
              playlist={props.playlist}
              session={session}
              size="small"
            />
            <h1 className="text-2xl font-bold text-slate-200">
              {props.playlist.title}
            </h1>
          </div>
        ),
        sticky: true,
      });
      return () => {
        setContent(null);
      };
    }, [props.playlist]);
  }

  if (props.type === 'song') {
    useEffect(() => {
      if (!session) return;
      setContent({
        node: (
          <div className="flex items-center gap-2">
            <PlayButton
              session={session}
              song={props.song}
              songs={props.songsInQueue}
              size="small"
            />
            <h1 className="text-2xl font-bold text-slate-200">
              {props.song.title}
            </h1>
          </div>
        ),
        sticky: true,
      });
      return () => {
        setContent(null);
      };
    }, [props.song]);
  }

  if (props.type === 'artist') {
    useEffect(() => {
      if (!session) return;
      setContent({
        node: (
          <div className="flex items-center gap-2">
            <PlayButton
              session={session}
              song={props.artist.songs[0]}
              songs={props.artist.songs}
              size="small"
            />
            <h1 className="text-2xl font-bold text-slate-200">
              {props.artist.name}
            </h1>
          </div>
        ),
        sticky: true,
      });
      return () => {
        setContent(null);
      };
    }, [props.artist]);
  }

  if (props.type === 'search') {
    useEffect(() => {
      setContent({
        node: (
          <div className="relative group scale-110 left-3 origin-center border-slate-700 border-2 transition rounded-full focus-within:border-slate-300/75">
            <MdSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-300/50 transition group-focus-within:text-slate-300"
              size={24}
            />
            <input
              id="search"
              type="text"
              placeholder="Search"
              className={`min-w-[256px] h-full text-slate-300 bg-slate-900 rounded-full px-10 py-2 outline-none`}
              onChange={e => {
                props.onTextChange(e.target.value);
              }}
              value={props.text}
              autoFocus={true}
            />
            {props.text && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-300/50 focus:outline focus:outline-slate-300 focus:-outline-offset-2 transition outline-none group-focus-within:text-slate-300"
                onClick={() => {
                  document.getElementById('search')?.focus();
                  props.onTextChange('');
                }}
              >
                <MdClose size={24} />
              </button>
            )}
          </div>
        ),
        sticky: false,
      });
      return () => {
        setContent(null);
      };
    }, [props.text, sticky]);
  }

  useEffect(() => {
    if (!colors) return;
    setColor(colors.darkVibrant ?? null);
    return () => {
      setColor(null);
    };
  }, [colors]);

  if ('collapsePx' in props) {
    useEffect(() => {
      setCollapsePx(props.collapsePx ?? null);
      return () => setCollapsePx(null);
    }, [props.collapsePx]);
    return <></>;
  }

  if ('children' in props) {
    useEffect(() => {
      if (!heightRef.current) return;
      const height = heightRef.current.getBoundingClientRect().height;
      if (!height) return;
      setCollapsePx(height - 64);
      return () => setCollapsePx(null);
    }, [heightRef]);
    return <div ref={heightRef}>{props.children}</div>;
  }

  return null;
};
