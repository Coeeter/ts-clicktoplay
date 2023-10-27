'use client';

import { Playlist } from '@/actions/playlist';
import { PlayButton } from '@/app/(main)/songs/[songId]/_components/PlayButton';
import { PlaylistPlayButton } from '@/components/playlist/PlayButton';
import { useNavbarStore } from '@/store/NavbarStore/NavbarStore';
import { Song } from '@prisma/client';
import { Session } from 'next-auth';
import { useEffect, useRef } from 'react';

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

  if (props.type === 'search') {
    useEffect(() => {
      setContent({
        node: (
          <input
            type="text"
            placeholder="Search"
            className="w-[256px] h-full bg-slate-700 text-slate-200 rounded-full px-3 py-2 focus:outline-none"
            onChange={e => props.onTextChange(e.target.value)}
            defaultValue={props.text}
          />
        ),
        sticky: false,
      });
      return () => {
        setContent(null);
      };
    }, []);
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
