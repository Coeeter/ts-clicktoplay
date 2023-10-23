'use client';
import { getUpdateAlbumCoverUploadUrl } from '@/actions/songs';
import { Button } from '@/components/forms/Button';
import { ImageInput } from '@/components/forms/ImageInput';
import { TextField } from '@/components/forms/TextField';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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
  const router = useRouter();
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
      <div className="flex gap-4">
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
