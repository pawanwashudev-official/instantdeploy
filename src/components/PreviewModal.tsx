import React, { useRef, useEffect } from 'react';
import { X, PlayCircle } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, { content: string; isBinary: boolean }>;
}

export function PreviewModal({ isOpen, onClose, files }: PreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      const indexHtml = files['index.html']?.content;
      if (indexHtml) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(indexHtml);
          doc.close();
        }
      }
    }
  }, [isOpen, files]);

  if (!isOpen) return null;

  const hasIndex = !!files['index.html'];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-700 shadow-xl">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-green-400" />
          Live Preview {hasIndex ? '(index.html)' : '(No index.html found)'}
        </h2>
        <button
          onClick={onClose}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-lg transition-colors border border-gray-700 flex items-center gap-1"
        >
          Close <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-grow bg-white w-full h-full relative">
        {hasIndex ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none bg-white"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Create or import an &apos;index.html&apos; file to see the preview.
          </div>
        )}
      </div>
    </div>
  );
}
