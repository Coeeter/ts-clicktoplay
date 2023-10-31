'use client';
import { searchArtists } from '@/actions/artist/artist';
import { Button } from '@/components/forms/Button';
import { ImageInput } from '@/components/forms/ImageInput';
import { TextField } from '@/components/forms/TextField';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigationRouter } from '@/hooks/useNavigation';
import { useToastStore } from '@/store/ToastStore';
import { Artist } from '@prisma/client';
import { parseBlob } from 'music-metadata-browser';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BiSolidCloudUpload } from 'react-icons/bi';

type Metadata = Awaited<ReturnType<typeof getMetadata>>;

const getMetadata = async (file: File) => {
  const metadata = await parseBlob(file);

  const extractNameFromFile = (file: File) => {
    return file.name.lastIndexOf('.') > 0
      ? file.name.substring(0, file.name.lastIndexOf('.'))
      : file.name;
  };

  const extractImageFromMetadata = (data: typeof metadata) => {
    const image = data.common.picture?.[0];
    if (!image) return null;
    const extension = image?.format.split('/').pop();
    const imageData = new Uint8Array(image.data);
    const imageFile = new File([imageData], 'image', {
      type: image.format,
    });
    return {
      url: URL.createObjectURL(imageFile),
      file: imageFile,
      extension: extension,
      format: image.format,
    };
  };

  const title = metadata.common.title ?? extractNameFromFile(file);
  const artist = metadata.common.artist ?? '';
  const duration = metadata.format.duration ?? 0.0;
  const image = extractImageFromMetadata(metadata);

  return {
    title,
    artist,
    duration,
    image,
  };
};

const SongUploader = () => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a'],
    },
    multiple: false,
    onDrop: acceptedFiles => {
      setSelectedFile(acceptedFiles[0]);
      getMetadata(acceptedFiles[0]).then(setMetadata);
    },
  });

  const duration = useMemo(() => {
    if (!metadata) return '00:00';
    const minutes = Math.floor(metadata.duration / 60);
    const seconds = Math.floor(metadata.duration % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  }, [metadata]);

  return (
    <div
      className={`flex flex-col gap-6 bg-slate-900 text-white rounded-md p-6 max-w-md mx-auto mt-[calc(1.5rem+64px)]`}
    >
      <h3 className="text-2xl font-semibold">Upload Your Music</h3>
      <label
        htmlFor="file-input"
        {...getRootProps()}
        className={`flex flex-col items-center outline-2 outline-dashed rounded-md cursor-pointer transition-colors duration-200 ease-in-out ${
          isDragActive
            ? 'outline-blue-600 bg-slate-700'
            : 'outline-slate-300/50 hover:outline-slate-300/60 bg-slate-300/10 hover:bg-slate-300/20'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <BiSolidCloudUpload
          className={`pointer-events-none ${
            isDragActive ? 'text-blue-600' : 'text-gray-400'
          }`}
          size={128}
        />
        <p
          className={`pointer-events-none mb-6 ${
            isDragActive ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          Drag and drop your music file here
        </p>
      </label>
      <input
        id="file-input"
        type="file"
        className="hidden"
        {...getInputProps()}
      />
      {metadata && selectedFile && duration && (
        <div className="text-slate-200 -mb-4">
          <span className="font-semibold">{metadata.title}</span> around{' '}
          <span className="font-semibold">{duration}</span> long
        </div>
      )}
      {metadata && selectedFile && (
        <SongForm metadata={metadata} file={selectedFile} />
      )}
    </div>
  );
};

type FormValues = {
  title: string;
  artist: string;
  albumCover: FileList | null;
};

const SongForm = ({ metadata, file }: { metadata: Metadata; file: File }) => {
  const router = useNavigationRouter();
  const createToast = useToastStore(state => state.createToast);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      title: metadata.title,
      artist: metadata.artist,
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

  useEffect(() => {
    setValue('title', metadata.title);
    setValue('artist', metadata.artist);
    setValue('albumCover', null);
  }, [metadata]);

  const onSubmit: SubmitHandler<FormValues> = async data => {
    const getUploadUrl = async (
      fileType: string,
      extension: string | undefined,
      type: 'audio' | 'image'
    ) => {
      const { url } = await fetch(
        `/api/songs/upload?fileType=${fileType}&extension=${extension}&type=${type}`
      ).then(res => res.json());
      return url;
    };

    const uploadToS3 = async (url: string, data: File, contentType: string) => {
      const response = await fetch(url, {
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': contentType,
        },
      });
      if (!response.ok) {
        console.log(await response.json());
        return createToast('Error uploading file', 'error');
      }
    };

    const uploadImage = async (
      image: Metadata['image']
    ): Promise<string | null> => {
      if (data.albumCover) {
        const uploadImageUrl = await getUploadUrl(
          data.albumCover[0].type,
          data.albumCover[0].name.split('.').pop(),
          'image'
        );
        await uploadToS3(
          uploadImageUrl,
          data.albumCover[0],
          data.albumCover[0].type
        );
        return uploadImageUrl.split('?')[0];
      }
      if (!data.albumCover && image) {
        const uploadImageUrl = await getUploadUrl(
          image.format,
          image.extension,
          'image'
        );
        await uploadToS3(uploadImageUrl, image.file, image.format);
        return uploadImageUrl.split('?')[0];
      }
      return null;
    };

    try {
      const extension = file.name.split('.').pop();
      const fileType = file.type;
      const songUploadUrl = await getUploadUrl(fileType, extension, 'audio');
      await uploadToS3(songUploadUrl, file, fileType);
      const { image } = await getMetadata(file);
      const imageUrl = await uploadImage(image);
      const songUrl = songUploadUrl.split('?')[0];
      const response = await fetch('/api/songs/upload', {
        method: 'POST',
        body: JSON.stringify({
          url: songUrl,
          albumCover: imageUrl,
          title: data.title,
          artist: data.artist,
          duration: metadata.duration,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      if (!response.ok) {
        console.log(json);
        return createToast('Error uploading file', 'error');
      }
      createToast('Song uploaded successfully', 'success');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.log('Error uploading file:', error);
      createToast('Error uploading file', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <ImageInput
        defaultPreview={metadata.image?.url}
        registerValues={register('albumCover')}
        setValue={value => setValue('albumCover', value)}
        value={albumCover}
      />
      {errors.albumCover && (
        <div className="text-red-500 text-sm">{errors.albumCover.message}</div>
      )}
      <TextField
        label="Title"
        id="title"
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
              className="w-full text-start px-4 py-2 hover:bg-slate-800 transition outline-none focus:bg-slate-800 border-b border-slate-300/75 last:border-0 first:rounded-t-md last:rounded-b-md"
            >
              {artist.name}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-300/50 -mt-3">
        If this artist does not exist we will create the artist for you.
      </p>
      <Button isLoading={isSubmitting} className="mt-3">
        Upload File
      </Button>
    </form>
  );
};

export default SongUploader;
