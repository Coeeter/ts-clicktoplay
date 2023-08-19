'use client';

import { useCallbackUrl } from '@/hooks/useCallbackUrl';
import { useContextMenuStore } from '@/store/ContextMenuStore';
import { motion } from 'framer-motion';
import { Session } from 'next-auth';
import { useRef } from 'react';

type ProfileButtonProps = {
  session: Session;
};

const getDropDownItems = (session: Session) => {
  const callbackUrl = useCallbackUrl({ checkForPathname: '/logout' });
  return [
    {
      label: 'Profile',
      href: `/profile/${session.user!.id}`,
    },
    {
      label: 'Settings',
      href: '/settings',
    },
    {
      label: 'Logout',
      href: `/logout?callbackUrl=${callbackUrl}`,
    },
  ];
};

export const ProfileButton = ({ session }: ProfileButtonProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const dropDownItems = getDropDownItems(session);
  const showContextMenu = useContextMenuStore(state => state.openContextMenu);

  return (
    <div className="relative">
      <div className="animate-pulse absolute right-0">
        <div className="bg-slate-700 w-10 h-10 rounded-full"></div>
      </div>
      <div className="relative">
        <motion.img
          src={session.user!.image ?? '/default-user.png'}
          alt={session.user!.name ?? ''}
          ref={imgRef}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => {
            if (!imgRef.current) return;
            const rect = imgRef.current.getBoundingClientRect();
            showContextMenu(rect.right, rect.bottom + 8, dropDownItems);
          }}
          whileHover={{ scale: 1.1 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        />
      </div>
    </div>
  );
};
