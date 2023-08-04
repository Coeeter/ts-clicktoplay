import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type UseCallbackUrlProps = {
  checkForPathname?: string;
};

export const useCallbackUrl = ({ checkForPathname }: UseCallbackUrlProps) => {
  const pathname = usePathname();
  const [callbackUrl, setCallbackUrl] = useState('');

  useEffect(() => {
    setCallbackUrl(
      checkForPathname && pathname === checkForPathname
        ? new URLSearchParams(window.location.search)
            .get('callbackUrl')!
            .toString()
        : window.location.href
    );
  }, [pathname]);

  return encodeURIComponent(callbackUrl);
};
