import { X, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadImage } from '../services/imagenService';

export default function Modal() {
  const { state, dispatch } = useApp();
  const { modalImage } = state;

  if (!modalImage) return null;

  const handleClose = () => {
    dispatch({ type: 'SET_MODAL_IMAGE', payload: null });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleDownload = () => {
    downloadImage(modalImage.url, modalImage.filename || 'image.png');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] animate-fade-in">
        <div className="absolute -top-12 right-0 flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="다운로드"
          >
            <Download size={20} className="text-gray-700" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="닫기"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>
        <img
          src={modalImage.url}
          alt={modalImage.alt || 'Preview'}
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
        />
        {modalImage.caption && (
          <p className="mt-3 text-center text-white text-sm">
            {modalImage.caption}
          </p>
        )}
      </div>
    </div>
  );
}
