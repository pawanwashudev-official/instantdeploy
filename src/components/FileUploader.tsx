import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
  onFilesLoaded: (files: Record<string, { content: string; isBinary: boolean }>) => void;
}

export function FileUploader({ onFilesLoaded }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processEntries = async (entries: any[]) => {
    const newFiles: Record<string, { content: string; isBinary: boolean }> = {};

    const readEntry = async (entry: any, path: string = '') => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve) => entry.file(resolve));
        await readFile(file, path + file.name, newFiles);
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = await new Promise<any[]>((resolve) => {
          dirReader.readEntries(resolve);
        });
        for (const childEntry of entries) {
          await readEntry(childEntry, path + entry.name + '/');
        }
      }
    };

    for (const entry of entries) {
      await readEntry(entry);
    }

    onFilesLoaded(newFiles);
  };

  const readFile = async (file: File, path: string, store: Record<string, any>) => {
    const isBinary = !file.type.startsWith('text/') && !file.name.match(/\.(html|css|js|ts|tsx|jsx|json|md|txt)$/);

    if (isBinary) {
      const buffer = await file.arrayBuffer();
      // Store as base64 for binary
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      store[path] = { content: base64, isBinary: true };
    } else {
      const text = await file.text();
      store[path] = { content: text, isBinary: false };
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const entries = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) entries.push(entry);
        }
      }
      await processEntries(entries);
    } else {
       // Fallback for older browsers
       const files = e.dataTransfer.files;
       const newFiles: Record<string, any> = {};
       for (let i = 0; i < files.length; i++) {
           await readFile(files[i], files[i].name, newFiles);
       }
       onFilesLoaded(newFiles);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: Record<string, any> = {};
    for (let i = 0; i < files.length; i++) {
       // @ts-ignore
       const path = files[i].webkitRelativePath || files[i].name;
       await readFile(files[i], path, newFiles);
    }
    onFilesLoaded(newFiles);
    if(fileInputRef.current) fileInputRef.current.value = '';
    if(directoryInputRef.current) directoryInputRef.current.value = '';
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 bg-gray-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadCloud className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
      <h3 className="text-lg font-medium text-white mb-1">Drag & Drop files or folders here</h3>
      <p className="text-sm text-gray-400 mb-4">or click to browse</p>

      <div className="flex gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded transition-colors"
        >
          Select Files
        </button>
        <button
          onClick={() => directoryInputRef.current?.click()}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded transition-colors"
        >
          Select Folder
        </button>
      </div>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        ref={directoryInputRef}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
