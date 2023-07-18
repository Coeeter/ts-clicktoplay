'use client';

import { Button, useToast } from '@/components';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { parseBlob } from 'music-metadata-browser';

const SongUploader = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a'],
    },
    onDrop: acceptedFiles => {
      setSelectedFile(acceptedFiles[0]);
    },
  });

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

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

    const uploadToS3 = async (url: string, data: any, contentType: string) => {
      const response = await fetch(url, {
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': contentType,
        },
      });
      if (!response.ok) {
        console.log(await response.json());
        return toast.createToast('Error uploading file', 'error');
      }
    };

    const getMetadata = async (file: File) => {
      const metadata = await parseBlob(file);
      return {
        title:
          metadata.common.title ?? file.name.lastIndexOf('.') > 0
            ? file.name.substring(0, file.name.lastIndexOf('.'))
            : file.name,
        artist: metadata.common.artist ?? '',
        duration: metadata.format.duration ?? 0.0,
        image: metadata.common.picture?.[0],
      };
    };

    try {
      const extension = selectedFile.name.split('.').pop();
      const fileType = selectedFile.type;
      const songUploadUrl = await getUploadUrl(fileType, extension, 'audio');
      await uploadToS3(songUploadUrl, selectedFile, fileType);
      const { title, artist, duration, image } = await getMetadata(
        selectedFile
      );
      let imageUrl: string | null = null;
      if (image) {
        const extension = image.format.split('/').pop();
        const uploadImageUrl = await getUploadUrl(
          image.format,
          extension,
          'image'
        );
        const imageData = new Uint8Array(image.data);
        const imageFile = new File([imageData], 'image', {
          type: image.format,
        });
        await uploadToS3(uploadImageUrl, imageFile, image.format);
        imageUrl = uploadImageUrl.split('?')[0];
      }
      const songUrl = songUploadUrl.split('?')[0];
      const response = await fetch('/api/songs/upload', {
        method: 'POST',
        body: JSON.stringify({
          url: songUrl,
          title: title,
          duration: duration,
          artist: artist,
          albumCover: imageUrl,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      if (!response.ok) {
        console.log(json);
        return toast.createToast('Error uploading file', 'error');
      }
      router.push(`/songs/update/${json.id}`);
    } catch (error) {
      console.log('Error uploading file:', error);
      toast.createToast('Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      ref={boxRef}
      {...getRootProps()}
      className={`bg-slate-800 text-white rounded-md p-8 max-w-md mx-auto mt-6 ${
        isDragActive ? 'border-2 border-dashed border-blue-600' : ''
      }`}
      onClick={e => e.stopPropagation()}
    >
      <div className="text-center">
        <h3 className="text-3xl font-semibold mb-4">Upload Your Music</h3>
        <div className="w-20 h-20 mx-auto mb-4">
          <FaFileUpload className="h-full w-full text-gray-300" />
        </div>
        <p className="text-gray-400 mb-6">
          {isDragActive
            ? 'Drop the file here'
            : 'Drag and drop your music files anywhere on the screen or click to browse'}
        </p>
      </div>
      <div className="mb-6">
        <label
          htmlFor="file-input"
          className="inline-block w-full py-3 text-center bg-blue-600 hover:bg-blue-700 rounded-md font-semibold cursor-pointer transition duration-300"
        >
          Choose File
        </label>
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept="audio/*"
          onChange={e => {
            if (!e.target.files) return;
            setSelectedFile(e.target.files[0]);
          }}
        />
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          {...getInputProps()}
        />
      </div>
      {selectedFile && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Selected File:</h4>
          <p className="text-gray-400 overflow-ellipsis">{selectedFile.name}</p>
        </div>
      )}
      <div className="flex justify-center">
        <Button
          onClick={handleFileUpload}
          isLoading={uploading}
          disabled={!selectedFile || uploading}
        >
          Upload File
        </Button>
      </div>
    </div>
  );
};

export default SongUploader;
