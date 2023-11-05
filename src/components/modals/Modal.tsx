'use client';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { MdClose } from 'react-icons/md';

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: React.ReactNode;
};

export const Modal = ({ isOpen, close, children, title }: ModalProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref,
    callback: close,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-md z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={ref}
            className="bg-slate-800 p-6 rounded-md min-w-[450px] w-1/3 max-w-[550px]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl text-white font-bold">{title}</h1>
              <button onClick={close} type="button">
                <MdClose className="text-2xl text-white cursor-pointer" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
