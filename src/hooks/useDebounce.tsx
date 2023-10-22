import { useEffect, useState } from 'react';

export const useDebounce = <T,>(
  value: T,
  delay: number,
  setValue?: (value: T) => void
) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
      if (setValue) setValue(value);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value]);

  return debouncedValue;
};
