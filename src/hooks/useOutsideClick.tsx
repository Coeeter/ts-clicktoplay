import { RefObject, useEffect } from 'react';

export const useOutsideClick = (
  ref: RefObject<HTMLElement>,
  callback: () => void,
  ignoreRef?: RefObject<HTMLElement>
) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      ref.current &&
      !ref.current.contains(event.target as Node) &&
      ignoreRef?.current != event.target
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
