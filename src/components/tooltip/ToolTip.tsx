'use client';

import { useToolTipStore } from '@/store/ToolTipStore/ToolTipStore';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export const Tooltip = () => {
  const ref = useToolTipStore(state => state.ref);
  const content = useToolTipStore(state => state.content);
  const place = useToolTipStore(state => state.place);

  const style = useMemo(() => {
    if (!ref?.current) return {};

    const refRect = ref.current.getBoundingClientRect();

    switch (place) {
      case 'left':
        return {
          top: refRect.top + refRect.height / 2,
          left: refRect.left + 10,
          transform: 'translateX(-100%) translateY(-50%)',
        };
      case 'right':
        return {
          top: refRect.top + refRect.height / 2,
          left: refRect.right + 10,
          transform: 'translateY(-50%)',
        };
      case 'bottom-center':
        return {
          top: refRect.bottom + 10,
          left: refRect.left + refRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'top-center':
        return {
          top: refRect.top - 10,
          left: refRect.left + refRect.width / 2,
          transform: 'translateX(-50%) translateY(-100%)',
        };
      case 'bottom-left':
        return {
          top: refRect.bottom + 10,
          left: refRect.left,
        };
      case 'bottom-right':
        return {
          top: refRect.bottom + 10,
          left: refRect.right,
          transform: 'translateX(-100%)',
        };
      case 'top-left':
        return {
          top: refRect.top - 10,
          left: refRect.left,
          transform: 'translateY(-100%)',
        };
      case 'top-right':
        return {
          top: refRect.top - 10,
          left: refRect.right,
          transform: 'translateX(-100%) translateY(-100%)',
        };
      default:
        return {};
    }
  }, [ref?.current, content, place]);

  if (!ref?.current) return null;

  return (
    <div
      className={`absolute ${
        typeof content !== 'string' ? '' : 'text-slate-200 text-sm'
      }`}
      style={style}
    >
      <motion.div
        className="bg-slate-700 p-2 rounded-md shadow-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {content}
      </motion.div>
    </div>
  );
};
