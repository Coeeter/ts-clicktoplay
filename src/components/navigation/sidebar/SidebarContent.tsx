'use client';
import { Playlist } from '@/actions/playlist';
import {
  setSideBarMoreDetails,
  setSideBarOpen,
  setSidebarWidth,
} from '@/actions/settings/settings';
import { useDebounce } from '@/hooks/useDebounce';
import { useToolTip } from '@/hooks/useToolTip';
import { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BiSolidCloudUpload } from 'react-icons/bi';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import { MdArrowBack, MdArrowForward, MdHome, MdSearch } from 'react-icons/md';
import { SidebarItemList } from './SidebarItemList';
import { SidebarNewPlaylistButton } from './SidebarNewPlaylistButton';

const sidebarItems = [
  {
    name: 'Home',
    href: '/',
    icon: <MdHome size={32} />,
  },
  {
    name: 'Search',
    href: '/search',
    icon: <MdSearch size={32} />,
  },
  {
    name: 'Upload Songs',
    href: '/songs/upload',
    icon: <BiSolidCloudUpload size={32} />,
  },
] as const;

type SidebarContentProps = {
  session: Session | null;
  playlists: Playlist[];
  playHistory: { id: string; lastPlayedAt: Date | null }[];
  sideBarOpen: boolean;
  sideBarMoreDetails: boolean;
  sideBarWidth?: number;
};

export const SidebarContent = ({
  session,
  playlists,
  playHistory,
  sideBarOpen,
  sideBarMoreDetails,
  sideBarWidth,
}: SidebarContentProps) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(sideBarOpen);
  const [showMoreDetails, setshowMoreDetails] = useState(sideBarMoreDetails);
  const [widthPx, setWidthPx] = useState(sideBarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const width = useMemo(() => {
    if (!expanded) return 'fit-content';
    return `${widthPx}px`;
  }, [widthPx, expanded, showMoreDetails]);

  const minWidth = useMemo(() => {
    if (!expanded) return undefined;
    if (showMoreDetails) return '30%';
    return '20%';
  }, [expanded, showMoreDetails]);

  const maxWidth = useMemo(() => {
    if (!expanded) return undefined;
    if (showMoreDetails) return '50%';
    return '30%';
  }, [expanded, showMoreDetails]);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const rect = sidebarRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (!expanded) {
        if (e.clientX >= window.innerWidth / 5) {
          setExpanded(true);
          setWidthPx(e.clientX - rect.left);
        }
        return;
      }
      if (e.clientX <= window.innerWidth / 10) {
        setExpanded(false);
        return;
      }
      if (showMoreDetails && e.clientX <= window.innerWidth * 0.3) {
        setshowMoreDetails(false);
        return;
      }
      if (e.clientX >= window.innerWidth * 0.3) {
        setshowMoreDetails(true);
        setWidthPx(e.clientX - rect.left);
        return;
      }
      setWidthPx(width => (width ?? rect.width) + e.movementX);
    },
    [isResizing, sidebarRef, expanded, showMoreDetails]
  );

  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = async () => {
    if (!isResizing) return;
    setIsResizing(false);
    const width = sidebarRef.current!.getBoundingClientRect().width;
    await setSidebarWidth(width);
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  useDebounce(expanded, 2000, async value => {
    if (!session) return;
    await setSideBarOpen(value);
  });

  useDebounce(showMoreDetails, 2000, async value => {
    if (!session) return;
    await setSideBarMoreDetails(value);
  });

  const { register: registerLibraryButton } = useToolTip({
    content: expanded ? 'Collapse Your Library' : 'Expand Your Library',
  });

  const { register, removeTooltip } = useToolTip({
    content: showMoreDetails ? 'Show less' : 'Show more',
  });

  return (
    <aside
      ref={sidebarRef}
      className={`sticky top-3 bottom-0 max-h-[calc(100vh-6.25rem)] flex flex-row-reverse grow-0 shrink-0`}
      style={{ width, minWidth, maxWidth }}
      onMouseDown={e => e.preventDefault()}
    >
      <div
        className={`h-full w-1 bg-transparent px-2 -mx-2 z-40 opacity-0 hover:opacity-100 ${
          expanded ? 'cursor-col-resize' : 'cursor-e-resize'
        }`}
        onMouseDown={startResizing}
      >
        <div className="w-[2px] rounded-full h-full bg-blue-500"></div>
      </div>
      <div
        className={`gap-3 flex flex-col sticky top-3 bottom-0 max-h-[calc(100vh-6.25rem)] transition w-full h-full`}
      >
        <div className="flex flex-col bg-slate-800 rounded-md px-4 py-3 gap-3">
          {sidebarItems
            .filter(item => session || item.name !== 'Upload Songs')
            .map(({ href, icon, name }, index) => (
              <Link
                key={index}
                href={href}
                className={`text-md hover:text-slate-200 duration-150 font-semibold ${
                  pathname === href ? 'text-slate-200' : 'text-slate-300/50'
                }`}
                {...useToolTip({ content: name }).register({ place: 'right' })}
              >
                <div
                  className={`flex items-center gap-4 ${
                    expanded ? '' : 'justify-center'
                  }`}
                >
                  {icon}
                  {expanded && name}
                </div>
              </Link>
            ))}
        </div>
        <div className="flex-grow bg-slate-800 rounded-md max-h-[calc(100vh-6.25rem-112px)]">
          <div
            className={`flex flex-col max-h-full py-3 ${
              expanded ? 'px-4 gap-3' : 'px-2 gap-6 items-center'
            }`}
          >
            <div className={`flex justify-between items-center`}>
              <button
                className="text-lg text-slate-300/50 transition hover:text-slate-300 font-semibold cursor-pointer flex items-center gap-2"
                onClick={() => setExpanded(exp => !exp)}
                {...registerLibraryButton({
                  place: expanded ? 'top-center' : 'right',
                })}
              >
                <span className="rotate-90 scale-x-[-1]">
                  {expanded ? (
                    <FaFolderOpen size={24} />
                  ) : (
                    <FaFolder size={32} className="mx-3" />
                  )}
                </span>
                {expanded && 'Your Library'}
              </button>
              {session && expanded && (
                <div className="flex gap-2">
                  <SidebarNewPlaylistButton />
                  <button
                    className="text-slate-300/50 hover:text-slate-200 transition"
                    onClick={() => {
                      removeTooltip();
                      setshowMoreDetails(exp => !exp);
                    }}
                    {...register({ place: 'top-center' })}
                  >
                    {showMoreDetails ? (
                      <MdArrowBack size={24} />
                    ) : (
                      <MdArrowForward size={24} />
                    )}
                  </button>
                </div>
              )}
            </div>
            {session?.user ? (
              playlists.length === 0 ? (
                <p className="text-md text-slate-300/50 font-semibold">
                  No playlists found
                </p>
              ) : (
                <div className="overflow-y-auto max-h-full no-scrollbar">
                  <SidebarItemList
                    playlists={playlists}
                    session={session}
                    history={playHistory}
                    expanded={expanded!}
                    showMoreDetails={showMoreDetails}
                    isResizing={isResizing}
                  />
                </div>
              )
            ) : (
              <div className="text-md text-slate-300/50 font-semibold">
                {expanded && 'Please login to view your playlists'}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
