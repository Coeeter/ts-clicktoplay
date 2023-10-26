'use client';

import { Playlist } from '@/actions/playlist';
import { PlayButton } from '@/app/(main)/songs/[songId]/_components/PlayButton';
import { PlaylistPlayButton } from '@/components/playlist/PlayButton';
import { useNavbarStore } from '@/store/NavbarStore/NavbarStore';
import { Song } from '@prisma/client';
import { Session } from 'next-auth';
import { useEffect, useRef } from 'react';

type NavbarMetadataProps = {
  session: Session | null;
  colors: {
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
      setContent(
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
      );
      return () => {
        setContent(null);
      };
    }, [props.playlist]);
  }

  if (props.type === 'song') {
    useEffect(() => {
      setContent(
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
      );
      return () => {
        setContent(null);
      };
    }, [props.song]);
  }

  useEffect(() => {
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
