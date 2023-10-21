import {
  ToolTipPlace,
  useToolTipStore,
} from '@/store/ToolTipStore/ToolTipStore';
import { MouseEventHandler, useRef } from 'react';

type UseToolTipRegister = <T extends HTMLElement>({
  onMouseEnter,
  onMouseLeave,
  place,
}: {
  onMouseEnter?: MouseEventHandler<T>;
  onMouseLeave?: MouseEventHandler<T>;
  place?: ToolTipPlace;
}) => {
  onMouseEnter?: MouseEventHandler<T>;
  onMouseLeave?: MouseEventHandler<T>;
  ref: (instance: any) => void;
};

type UseToolTipReturn = {
  register: UseToolTipRegister;
  removeTooltip: () => void;
  setToolTip: (
    ref: React.RefObject<any>,
    content: React.ReactNode,
    place?: ToolTipPlace
  ) => void;
};

type UseToolTipProps = {
  content: React.ReactNode;
};

export const useToolTip = ({ content }: UseToolTipProps): UseToolTipReturn => {
  const ref = useRef<HTMLElement | null>(null);
  const setToolTip = useToolTipStore(state => state.addTooltop);
  const removeTooltip = useToolTipStore(state => state.removeTooltip);

  const register: UseToolTipRegister = <T extends HTMLElement>({
    onMouseEnter,
    onMouseLeave,
    place,
  }: {
    onMouseEnter?: MouseEventHandler<T>;
    onMouseLeave?: MouseEventHandler<T>;
    ref?: React.RefObject<T>;
    place?: ToolTipPlace;
  }) => {
    const onMouseEnterHandler: MouseEventHandler<T> = e => {
      onMouseEnter?.(e);
      if (!ref) return;
      setToolTip(ref, content, place);
    };

    const onMouseLeaveHandler: MouseEventHandler<T> = e => {
      onMouseLeave?.(e);
      removeTooltip();
    };

    return {
      onMouseEnter: onMouseEnterHandler,
      onMouseLeave: onMouseLeaveHandler,
      ref: instance => {
        ref.current = instance;
      },
    };
  };

  return {
    register,
    removeTooltip,
    setToolTip,
  };
};
