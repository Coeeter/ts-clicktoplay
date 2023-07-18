'use client';

import { Button, WithAuth, useToast } from '@/components';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';

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
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        body: formData,
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
    <WithAuth>
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
            <p className="text-gray-400 overflow-ellipsis">
              {selectedFile.name}
            </p>
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
    </WithAuth>
  );
};

export default SongUploader;
