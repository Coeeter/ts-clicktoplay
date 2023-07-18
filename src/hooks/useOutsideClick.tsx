import { RefObject, useEffect } from 'react';

type Props = {
  ref: RefObject<HTMLElement>;
  callback: () => void;
  ignoreRef?: RefObject<HTMLElement>;
}

export const useOutsideClick = ({
  ref,
  callback,
  ignoreRef,
}: Props) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      ref.current &&
      !ref.current.contains(event.target as Node) &&
      !ignoreRef?.current?.contains(event.target as Node) &&
      event.target !== ignoreRef?.current
    ) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};
