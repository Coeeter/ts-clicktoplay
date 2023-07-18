'use client';

import { Button, TextField, useToast } from '@/components';
import { Song } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  const toast = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateSongFormValues>({
    defaultValues: {
      title: song.title,
      artist: song.artist ?? '',
      albumCover: null,
    },
  });

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
        albumCover?: string;
      } = {
        title,
        artist,
      };
      if (albumCover) {
        const { url } = await fetch(
          `/api/songs/update/${song.id}?fileType=${
            albumCover[0].type
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
        return toast.createToast(json.message, 'error');
      }
      toast.createToast('Song updated successfully', 'success');
      router.push('/');
    } catch (e) {
      console.error(e);
      toast.createToast('Error updating song', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-5 bg-slate-800 p-6 rounded-md max-w-md w-full mx-auto mt-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-5">
        <TextField
          label="Title"
          id="title"
          defaultValue={song.title ?? ''}
          {...register('title', { required: true })}
          error={errors.title?.message}
        />
      </div>
      <div className="flex flex-col gap-5">
        <TextField
          label="Artist"
          id="artist"
          defaultValue={song.artist ?? ''}
          {...register('artist')}
          error={errors.artist?.message}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="albumCover">Album Cover</label>
        <img
          src={preview}
          alt="Album Cover"
          className="w-24 h-24 rounded-md box-border object-cover"
        />
        <div className="flex flex-col gap-1">
          <input
            type="file"
            id="albumCover"
            className="bg-slate-700 p-3 rounded-md outline-none text-slate-300 focus:outline-blue-600"
            {...register('albumCover', {
              onChange: e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPreview(URL.createObjectURL(file));
              },
            })}
          />
          {errors.albumCover && (
            <div className="text-red-500 text-sm">
              {errors.albumCover.message}
            </div>
          )}
        </div>
      </div>
      <Button type="submit" isLoading={isUploading}>
        Submit
      </Button>
    </form>
  );
};
