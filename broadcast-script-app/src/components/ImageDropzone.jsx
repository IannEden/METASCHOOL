import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { fileToBase64, isValidImageFile } from '../utils/imageUtils';
import Spinner from './Spinner';

export default function ImageDropzone({
  onImageSelect,
  label,
  preview,
  onRemove,
  isLoading,
  accept = 'image/*'
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidImageFile(file)) {
      const dataUrl = await fileToBase64(file);
      onImageSelect(dataUrl, file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file && isValidImageFile(file)) {
      const dataUrl = await fileToBase64(file);
      onImageSelect(dataUrl, file);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  if (preview) {
    return (
      <div className="relative group">
        <img
          src={preview}
          alt={label}
          className="w-full h-32 object-cover rounded-lg border-2 border-indigo-200"
        />
        {!isLoading && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <Spinner size={28} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all
        ${isDragOver
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }
        ${isLoading ? 'pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      {isLoading ? (
        <Spinner size={24} />
      ) : (
        <>
          <Upload size={24} className="text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center">{label}</span>
          <span className="text-xs text-gray-400 mt-1">드래그 또는 클릭</span>
        </>
      )}
    </div>
  );
}
