import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { useEffect, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { MdEdit } from 'react-icons/md';

type ImageInputProps = {
  defaultPreview?: string | null;
  setValue: (value: FileList | null) => void;
  value?: FileList | null;
  registerValues: UseFormRegisterReturn;
  inModal?: boolean;
};

export const ImageInput = ({
  defaultPreview,
  setValue,
  value,
  registerValues,
  inModal,
}: ImageInputProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  const [preview, setPreview] = useState<string | null>(defaultPreview ?? null);
  const isOpen = usePlaylistModalStore(state => state.isOpen);

  useEffect(() => {
    if (!defaultPreview) return;
    setPreview(defaultPreview);
  }, [defaultPreview]);

  useEffect(() => {
    if (
      !value ||
      !value?.[0] ||
      value! instanceof Blob ||
      value! instanceof MediaSource
    )
      return;
    setPreview(URL.createObjectURL(value[0]));
  }, [value]);

  useEffect(() => {
    if (isOpen && !inModal) return;
    const listener = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = e.clipboardData?.files ?? null;
      if (!files?.length) return;
      setValue(files);
      if (!files?.[0]) return;
      setPreview(URL.createObjectURL(files[0]));
    };
    window.addEventListener('paste', listener);
    return () => window.removeEventListener('paste', listener);
  }, [isOpen]);

  return (
    <div className="group cursor-pointer relative">
      <img
        src={preview ?? '/album-cover.png'}
        alt="Album Cover"
        className="w-full aspect-square rounded-md box-border object-cover cursor-pointer"
      />
      <label
        htmlFor={id}
        className="cursor-pointer absolute inset-0 gap-2 bg-slate-900/50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MdEdit className="text-white text-6xl" />
        <input
          id={id}
          type="file"
          className="hidden"
          accept="image/*"
          {...registerValues}
        />
      </label>
    </div>
  );
};
