'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type ArtistImageProps = {
  image: string;
  primaryColor: string | undefined;
};

export const ArtistImage = ({ image, primaryColor }: ArtistImageProps) => {
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const parent = document.getElementById('root');

    const handleScroll = () => {
      setScrollY(parent?.scrollTop || 0);
    };

    parent?.addEventListener('scroll', handleScroll);
    return () => parent?.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = useMemo(() => {
    const height = imageRef.current?.clientHeight ?? 300;
    const percent = 1 - scrollY / (height * 0.3);
    return percent;
  }, [scrollY, imageRef]);

  return (
    <div
      ref={imageRef}
      className={`absolute top-0 left-0 w-full h-full bg-no-repeat bg-cover `}
      style={{
        backgroundImage: `url('${image}')`,
        opacity: opacity,
        backgroundPositionY: `${scrollY * 0.5}px`,
      }}
    >
      <div
        className="w-full h-full opacity-50"
        style={{
          background: primaryColor,
        }}
      ></div>
    </div>
  );
};
