import React from 'react';
import { File as FileIcon, FileCode, FileImage, Folder, Plus, Trash2 } from 'lucide-react';

interface SidebarProps {
  files: Record<string, { content: string; isBinary: boolean }>;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onCreateFile: (path: string) => void;
}

export function Sidebar({ files, activeFile, onSelectFile, onDeleteFile, onCreateFile }: SidebarProps) {

  const getIcon = (filename: string) => {
    if (filename.endsWith('.html')) return <FileCode className="w-4 h-4 text-orange-400" />;
    if (filename.endsWith('.css')) return <FileCode className="w-4 h-4 text-blue-400" />;
    if (filename.endsWith('.js') || filename.endsWith('.ts')) return <FileCode className="w-4 h-4 text-yellow-400" />;
    if (filename.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) return <FileImage className="w-4 h-4 text-green-400" />;
    return <FileIcon className="w-4 h-4 text-gray-400" />;
  };

  const handleNewFile = () => {
    const name = prompt("Enter file name (e.g., script.js or folder/style.css):");
    if (name) {
      onCreateFile(name);
    }
  };

  // Convert flat path list to a simple list for now,
  // advanced tree view can be implemented later if needed.
  const filePaths = Object.keys(files).sort();

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center text-gray-300">
        <span className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
          <Folder className="w-4 h-4" /> Project Files
        </span>
        <button
          onClick={handleNewFile}
          className="hover:text-white hover:bg-gray-800 p-1 rounded transition-colors"
          title="New File"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto py-2">
        {filePaths.length === 0 ? (
          <div className="text-xs text-gray-500 text-center p-4">
            No files. Import or create one.
          </div>
        ) : (
          filePaths.map(path => (
            <div
              key={path}
              className={`flex items-center justify-between group px-3 py-1.5 cursor-pointer text-sm transition-colors ${
                activeFile === path ? 'bg-blue-900/40 text-white border-l-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-2 border-transparent'
              }`}
              onClick={() => onSelectFile(path)}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {getIcon(path)}
                <span className="truncate" title={path}>{path}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(path);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
