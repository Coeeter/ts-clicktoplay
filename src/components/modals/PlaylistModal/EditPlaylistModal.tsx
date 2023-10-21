'use client';

import { getPlaylistUpdateImageUrl, updatePlaylist } from '@/actions/playlist';
import { ImageInput } from '@/components/forms/ImageInput';
import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { useToastStore } from '@/store/ToastStore';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '../../forms/Button';
import { TextField } from '../../forms/TextField';
import { Modal } from '../Modal';

type FormValues = {
  title: string;
  description: string;
  image: FileList | null;
};

export const EditPlaylistModal = () => {
  const pathname = usePathname();
  const isOpen = usePlaylistModalStore(state => state.isOpen);
  const playlist = usePlaylistModalStore(state => state.playlist);
  const close = usePlaylistModalStore(state => state.close);
  const type = usePlaylistModalStore(state => state.type);
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
      image: null,
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
    reset();
    setValue('image', null);
    if (!playlist) return;
    setValue('title', playlist.title);
    setValue('description', playlist.description ?? '');
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen && type === 'edit' && !!playlist}
      close={close}
      title="Edit Playlist"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full flex gap-3">
          <div className="w-56 shadow-2xl h-56 rounded-md group relative">
            <ImageInput
              defaultPreview={playlist?.image}
              registerValues={register('image')}
              setValue={value => value && setValue('image', value)}
              value={image}
              inModal={true}
            />
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
