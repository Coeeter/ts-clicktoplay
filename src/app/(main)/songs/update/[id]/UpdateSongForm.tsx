'use client';
import { searchArtists } from '@/actions/artist/artist';
import { Button } from '@/components/forms/Button';
import { ImageInput } from '@/components/forms/ImageInput';
import { TextField } from '@/components/forms/TextField';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigationRouter } from '@/hooks/useNavigation';
import { useToastStore } from '@/store/ToastStore';
import { Artist, Song } from '@prisma/client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type UpdateSongProps = {
  song: Song;
};

type UpdateSongFormValues = {
  title: string;
  artist: string;
  albumCover: FileList | null;
};

export const UpdateSongForm = ({ song }: UpdateSongProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const createToast = useToastStore(state => state.createToast);
  const router = useNavigationRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<UpdateSongFormValues>({
    defaultValues: {
      title: song.title,
      artist: song.artist ?? '',
      albumCover: null,
    },
  });

  const albumCover = watch('albumCover');
  const artist = watch('artist');

  const [loading, setLoading] = useState(false);
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const { ref, ...registerValues } = register('artist');
  const dropdownRef = useRef<HTMLInputElement | null>(null);
  useDebounce(artist, 1000, value => {
    try {
      if (!value) return;
      searchArtists(value).then(setArtistResults);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    try {
      if (!artist) return;
      setLoading(true);
    } finally {
      setArtistResults([]);
    }
  }, [artist]);

  const duration = useMemo(() => {
    const minutes = Math.floor(song.duration / 60);
    const seconds = Math.floor(song.duration % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  }, [song]);

  const onSubmit = async ({
    title,
    artist,
    albumCover,
  }: UpdateSongFormValues) => {
    try {
      setIsUploading(true);
      const body: {
        title: string;
        artist: string;
        albumCover: string | null;
      } = {
        title,
        artist,
        albumCover: null,
      };
      if (albumCover) {
        const { url } = await fetch(
          `/api/songs/update/${song.id}?fileType=${
            albumCover[0]?.type ??
            'image/' + albumCover[0].name.split('.').pop()
          }&extension=${albumCover[0].name.split('.').pop()}`
        ).then(res => res.json());
        await fetch(url, {
          method: 'PUT',
          body: albumCover[0],
          headers: {
            'Content-Type': albumCover[0].type,
          },
        });
        body.albumCover = url.split('?')[0];
      }
      const result = await fetch(`/api/songs/update/${song.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const json = await result.json();
      if (!result.ok) {
        return createToast(json.message, 'error');
      }
      createToast('Song updated successfully', 'success');
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
      createToast('Error updating song', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-5 bg-slate-900 p-6 rounded-md max-w-md w-full mx-auto mt-[calc(1.5rem+64px)]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="text-slate-200 text-2xl">
        <span className="font-bold">{song.title}</span> around{' '}
        <span className="font-bold">{duration}</span> long
      </div>
      <div className="flex flex-col gap-1">
        <ImageInput
          defaultPreview={song.albumCover ?? undefined}
          registerValues={register('albumCover')}
          setValue={value => setValue('albumCover', value)}
          value={albumCover}
        />
        {errors.albumCover && (
          <div className="text-red-500 text-sm">
            {errors.albumCover.message}
          </div>
        )}
      </div>
      <TextField
        label="Title"
        id="title"
        defaultValue={song.title ?? ''}
        {...register('title', { required: true })}
        error={errors.title?.message}
      />
      <div className="relative group">
        <TextField
          id="artist"
          ref={e => {
            ref(e);
            dropdownRef.current = e;
          }}
          onKeyDown={e => {
            if (e.key !== 'ArrowDown') return;
            if (!artistResults.length) return;
            e.preventDefault();
            document.getElementById(artistResults[0].id)?.focus();
          }}
          label="Artist"
          error={errors.artist?.message}
          {...registerValues}
        />
        <div className="flex-col bg-slate-600 rounded-md absolute top-full right-0 left-0 z-10 translate-y-1 hidden group-focus-within:flex shadow-lg max-h-[120px] overflow-y-auto">
          {loading && (
            <div className="w-full text-start px-4 py-2 hover:bg-slate-800 transition outline-none focus:bg-slate-800 border-b border-slate-300/75 last:border-0 first:rounded-t-md last:rounded-b-md">
              Loading...
            </div>
          )}
          {!loading && !artistResults.length && artist && (
            <div className="w-full text-start px-4 py-2 hover:bg-slate-800 transition outline-none focus:bg-slate-800 border-b border-slate-300/75 last:border-0 first:rounded-t-md last:rounded-b-md">
              No results found, we will create this artist for you.
            </div>
          )}
          {!artist && (
            <div className="w-full text-start px-4 py-2 hover:bg-slate-800 transition outline-none focus:bg-slate-800 border-b border-slate-300/75 last:border-0 first:rounded-t-md last:rounded-b-md">
              Enter an artist name
            </div>
          )}
          {artistResults.map(artist => (
            <button
              id={artist.id}
              key={artist.id}
              type="button"
              onKeyDown={e => {
                if (e.key === 'ArrowDown') {
                  const next = e.currentTarget.nextSibling;
                  if (!next) return;
                  e.preventDefault();
                  (next as HTMLElement).focus();
                }
                if (e.key === 'ArrowUp') {
                  const prev = e.currentTarget.previousSibling;
                  if (!prev) return;
                  e.preventDefault();
                  (prev as HTMLElement).focus();
                }
              }}
              onClick={e => {
                e.currentTarget.blur();
                dropdownRef.current?.blur();
                setValue('artist', artist.name);
              }}
              className="w-full text-start px-4 py-2 hover:bg-slate-800 transition outline-none focus:bg-slate-800 border-b text-slate-200 border-slate-300/75 last:border-0 first:rounded-t-md last:rounded-b-md"
            >
              {artist.name}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-300/50 -mt-3">
        If this artist does not exist we will create the artist for you.
      </p>
      <Button type="submit" isLoading={isUploading}>
        Submit
      </Button>
    </form>
  );
};
