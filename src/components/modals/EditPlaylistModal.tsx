'use client';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useEditPlaylistModalStore } from '@/store/EditPlaylistModalStore';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose, MdEdit } from 'react-icons/md';
import { TextField } from '../forms/TextField';
import { Button } from '../forms/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getPlaylistUpdateImageUrl, updatePlaylist } from '@/actions/playlist';
import { useToastStore } from '@/store/ToastStore';

type FormValues = {
  title: string;
  description: string;
  image: FileList;
};

export const EditPlaylistModal = () => {
  const { isOpen, playlist, close } = useEditPlaylistModalStore();
  const ref = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const createToast = useToastStore(state => state.createToast);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      title: playlist?.title,
      description: playlist?.description ?? '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async data => {
    let imageUrl = playlist!.image;
    if (data.image && data.image.length) {
      const extension = data.image[0].name.split('.').pop() ?? 'jpg';
      const fileType = data.image[0].type;
      const url = await getPlaylistUpdateImageUrl(
        playlist!.id,
        extension,
        fileType
      );
      await fetch(url, {
        method: 'PUT',
        body: data.image[0],
        headers: {
          'Content-Type': fileType,
        },
      });
      imageUrl = url.split('?')[0];
    }
    await updatePlaylist({
      playlistId: playlist!.id,
      title: data.title,
      description: data.description,
      image: imageUrl,
    });
    close();
    createToast('Playlist updated!', 'success');
  };

  useOutsideClick({
    ref,
    callback: close,
  });

  useEffect(() => {
    if (playlist) {
      setValue('title', playlist.title);
      setValue('description', playlist.description ?? '');
    }
  }, [playlist?.title, playlist?.description]);

  useEffect(() => {
    const fileList = getValues('image');
    if (!fileList) return;
    if (fileList.length === 0) return;
    const file = fileList[0];
    const url = URL.createObjectURL(file);
    setPreview(url);
  }, [watch('image')]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.files;
      if (!items?.length) return;
      setValue('image', items);
    }
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('paste', onPaste);
    }
  }, [])

  return (
    <AnimatePresence>
      {isOpen && playlist && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <motion.form
            key="edit-playlist-modal"
            ref={ref}
            className="bg-slate-800 p-6 rounded-md min-w-[450px] w-1/3 max-w-[550px]"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl text-white font-bold">Edit Playlist</h1>
              <button onClick={close} type="button">
                <MdClose className="text-2xl text-white cursor-pointer" />
              </button>
            </div>
            <div className="w-full flex gap-3">
              <div className="w-56 shadow-2xl h-56 rounded-md group relative">
                <img
                  src={preview ?? playlist.image ?? '/playlist-cover.png'}
                  alt={playlist.title}
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
                  {...register('title', { required: 'Title is required!' })}
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
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};
