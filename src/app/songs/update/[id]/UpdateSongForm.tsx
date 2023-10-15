'use client';
import { Button } from '@/components/forms/Button';
import { TextField } from '@/components/forms/TextField';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  const [preview, setPreview] = useState(song.albumCover ?? '/album-cover.png');
  const createToast = useToastStore(state => state.createToast);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateSongFormValues>({
    defaultValues: {
      title: song.title,
      artist: song.artist ?? '',
      albumCover: null,
    },
  });

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

  useEffect(() => {
    const listener = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files ?? null;
      setValue('albumCover', files);
      if (!files?.[0]) return;
      setPreview(URL.createObjectURL(files[0]));
    };
    window.addEventListener('paste', listener);
    return () => window.removeEventListener('paste', listener);
  }, []);

  return (
    <form
      className="flex flex-col gap-5 bg-slate-800 p-6 rounded-md max-w-md w-full mx-auto mt-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="text-slate-200 text-2xl">
        <span className="font-bold">{song.title}</span> around{' '}
        <span className="font-bold">{duration}</span> long
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="albumCover">
            <img
              src={preview}
              alt="Album Cover"
              className="w-full aspect-square rounded-md box-border object-cover"
            />
          </label>
          {errors.albumCover && (
            <div className="text-red-500 text-sm">
              {errors.albumCover.message}
            </div>
          )}
          <input
            id="albumCover"
            type="file"
            accept="image/*"
            className="hidden"
            {...register('albumCover', {
              onChange: e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPreview(URL.createObjectURL(file));
              },
            })}
          />
        </div>
        <div className="flex flex-col gap-4">
          <TextField
            label="Title"
            id="title"
            defaultValue={song.title ?? ''}
            {...register('title', { required: true })}
            error={errors.title?.message}
          />
          <TextField
            label="Artist"
            id="artist"
            defaultValue={song.artist ?? ''}
            {...register('artist')}
            error={errors.artist?.message}
          />
        </div>
      </div>
      <Button type="submit" isLoading={isUploading}>
        Submit
      </Button>
    </form>
  );
};
