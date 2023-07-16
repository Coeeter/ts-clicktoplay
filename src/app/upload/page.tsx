'use client';

import { Button, useToast } from '@/components';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaFileUpload } from 'react-icons/fa';

const FileUploader = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      if (
        event.target === boxRef.current ||
        boxRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setIsDraggingOver(false);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
    };
  }, []);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/song', {
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
      console.log('Error uploading file', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      ref={boxRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`bg-gray-900 text-white rounded-md p-8 max-w-md mx-auto ${
        isDraggingOver ? 'border-2 border-dashed border-blue-600' : ''
      }`}
    >
      <div className="text-center">
        <h3 className="text-3xl font-semibold mb-4">Upload Your Music</h3>
        <div className="w-20 h-20 mx-auto mb-4">
          <FaFileUpload className="h-full w-full text-gray-300" />
        </div>
        <p className="text-gray-400 mb-6">
          {isDraggingOver
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
          onChange={handleFileInputChange}
        />
      </div>
      {selectedFile && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Selected File:</h4>
          <p className="text-gray-400">{selectedFile.name}</p>
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

export default FileUploader;
