'use client';

import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { useEffect, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { TextField } from '../../forms/TextField';
import { Button } from '../../forms/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getPlaylistUpdateImageUrl, updatePlaylist } from '@/actions/playlist';
import { useToastStore } from '@/store/ToastStore';
import { Modal } from '../Modal';
import { usePathname } from 'next/navigation';

type FormValues = {
  title: string;
  description: string;
  image: FileList;
};

export const EditPlaylistModal = () => {
  const pathname = usePathname();
  const isOpen = usePlaylistModalStore(state => state.isOpen);
  const playlist = usePlaylistModalStore(state => state.playlist);
  const close = usePlaylistModalStore(state => state.close);
  const type = usePlaylistModalStore(state => state.type);
  const [preview, setPreview] = useState<string | null>(null);
  const createToast = useToastStore(state => state.createToast);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      title: playlist?.title,
      description: playlist?.description ?? '',
    },
  });

  const image = watch('image');

  const onSubmit: SubmitHandler<FormValues> = async data => {
    let imageUrl = playlist!.image;
    if (data.image && data.image.length) {
      const extension = data.image[0].name.split('.').pop() ?? 'jpg';
      const fileType = data.image[0].type;
      const [error, url] = await getPlaylistUpdateImageUrl(
        playlist!.id,
        extension,
        fileType
      );
      if (error || !url) return createToast('Failed to upload image!', 'error');
      await fetch(url, {
        method: 'PUT',
        body: data.image[0],
        headers: {
          'Content-Type': fileType,
        },
      });
      imageUrl = url.split('?')[0];
    }
    const [error] = await updatePlaylist({
      playlistId: playlist!.id,
      title: data.title,
      description: data.description,
      image: imageUrl,
      path: pathname,
    });
    if (error) {
      if (error.indexOf('Unique constraint failed on the constraint') !== -1) {
        return setError('title', { message: 'Title should be unique!' });
      }
      return createToast('Failed to update playlist!', 'error');
    }
    close();
    createToast('Playlist updated!', 'success');
  };

  useEffect(() => {
    if (!playlist) return;
    reset();
    setValue('title', playlist.title);
    setValue('description', playlist.description ?? '');
    setPreview(playlist.image ?? null);
  }, [isOpen]);

  useEffect(() => {
    if (!image) return;
    if (image.length === 0) return;
    const file = image[0];
    const url = URL.createObjectURL(file);
    setPreview(url);
  }, [image]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.files;
      if (!items?.length) return;
      setValue('image', items);
    };
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('paste', onPaste);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen && type === 'edit' && !!playlist}
      close={close}
      title="Edit Playlist"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full flex gap-3">
          <div className="w-56 shadow-2xl h-56 rounded-md group relative">
            <img
              src={preview ?? '/playlist-cover.png'}
              alt={playlist?.title ?? ''}
              className="w-56 shadow-2xl h-56 rounded-xl bg-slate-100 object-cover cursor-pointer"
            />
            <label
              htmlFor="file"
              className="cursor-pointer absolute inset-0 gap-2 bg-slate-900/50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MdEdit className="text-white text-6xl" />
              <input
                id="file"
                type="file"
                className="hidden"
                accept="image/*"
                {...register('image')}
              />
            </label>
          </div>
          <div className="flex flex-col flex-1 gap-2">
            <TextField
              label="Title"
              error={errors.title?.message}
              {...register('title', {
                required: 'Title is required!',
                pattern: {
                  value: /^[a-zA-Z0-9 ]*$/,
                  message: 'Title should only contain alphanumeric characters!',
                },
              })}
            />
            <TextField
              label="Description"
              variant="textarea"
              height="flex-1"
              error={errors.description?.message}
              {...register('description', {
                maxLength: {
                  value: 200,
                  message: 'Description cannot be longer than 200 characters!',
                },
              })}
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="w-32" type="submit" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
