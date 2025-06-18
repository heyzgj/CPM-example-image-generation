import React, { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div
        className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Title */}
        {title && (
          <h2
            id="modal-title"
            className="absolute top-4 left-4 z-20 text-white font-medium bg-black/50 px-3 py-1 rounded backdrop-blur-sm"
          >
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
}

export function ImageModal({ isOpen, onClose, src, alt, title }: ImageModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="max-w-full max-h-[80vh] object-contain"
          unoptimized
        />
      </div>
    </Modal>
  );
} 