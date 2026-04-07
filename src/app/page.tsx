"use client";

import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Download, Play, Rocket, Settings, Code2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { FileUploader } from '@/components/FileUploader';
import { SettingsModal } from '@/components/SettingsModal';
import { PreviewModal } from '@/components/PreviewModal';
import { downloadZip, deployToNetlify, deployToVercel } from '@/utils/deploy';

export default function Home() {
  const [files, setFiles] = useState<Record<string, { content: string; isBinary: boolean }>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [netlifyToken, setNetlifyToken] = useState('');
  const [vercelToken, setVercelToken] = useState('');

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ url: string; provider: string } | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Load saved tokens
  useEffect(() => {
    const nToken = localStorage.getItem('netlifyToken');
    if (nToken) setNetlifyToken(nToken);

    const vToken = localStorage.getItem('vercelToken');
    if (vToken) setVercelToken(vToken);

    // Initial files
    setFiles({
      'index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Instant Deploy App</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f4f8; margin: 0; }
    h1 { color: #2d3748; }
  </style>
</head>
<body>
  <h1>Hello, Instant Deploy! 🚀</h1>
</body>
</html>`,
        isBinary: false
      }
    });
    setActiveFile('index.html');
  }, []);

  const handleSaveTokens = (nToken: string, vToken: string) => {
    setNetlifyToken(nToken);
    setVercelToken(vToken);
    localStorage.setItem('netlifyToken', nToken);
    localStorage.setItem('vercelToken', vToken);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      setFiles(prev => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], content: value }
      }));
    }
  };

  const handleCreateFile = (path: string) => {
    if (!files[path]) {
      setFiles(prev => ({
        ...prev,
        [path]: { content: '', isBinary: false }
      }));
      setActiveFile(path);
    }
  };

  const handleDeleteFile = (path: string) => {
    const newFiles = { ...files };
    delete newFiles[path];
    setFiles(newFiles);
    if (activeFile === path) {
      const remaining = Object.keys(newFiles);
      setActiveFile(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleFilesLoaded = (newFiles: Record<string, { content: string; isBinary: boolean }>) => {
    setFiles(prev => {
      const merged = { ...prev, ...newFiles };
      if (!activeFile && Object.keys(merged).length > 0) {
        setActiveFile(Object.keys(merged)[0]);
      }
      return merged;
    });
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  const handleDeploy = async (provider: 'netlify' | 'vercel') => {
    if (Object.keys(files).length === 0) {
      setDeployError("No files to deploy.");
      return;
    }

    setDeployError(null);
    setDeployResult(null);
    setIsDeploying(true);

    try {
      let url = '';
      if (provider === 'netlify') {
        url = await deployToNetlify(files, netlifyToken);
      } else {
        url = await deployToVercel(files, vercelToken);
      }
      setDeployResult({ url, provider });
    } catch (err: any) {
      setDeployError(err.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden">
      {/* Header Toolbar */}
      <header className="h-14 border-b border-gray-700 bg-gray-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-lg">
          <Rocket className="w-5 h-5" /> InstantDeploy
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadZip(files)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors"
            title="Export as ZIP"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors text-blue-400"
          >
            <Play className="w-4 h-4" /> Preview
          </button>

          <div className="h-6 w-px bg-gray-700 mx-1"></div>

          <button
            onClick={() => handleDeploy('netlify')}
            disabled={isDeploying || !netlifyToken}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors shadow"
          >
            Deploy Netlify
          </button>
          <button
            onClick={() => handleDeploy('vercel')}
            disabled={isDeploying || !vercelToken}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-black hover:bg-gray-800 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors shadow"
          >
            Deploy Vercel
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors ml-2"
            title="Settings (API Keys)"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          files={files}
          activeFile={activeFile}
          onSelectFile={setActiveFile}
          onDeleteFile={handleDeleteFile}
          onCreateFile={handleCreateFile}
        />

        <main className="flex-1 flex flex-col relative bg-[#1e1e1e]">
          {/* Deploy Status Bar */}
          {isDeploying && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-blue-600 text-white text-xs py-1.5 px-4 flex justify-center items-center font-medium animate-pulse">
              Deploying... Please wait.
            </div>
          )}
          {deployError && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-red-600 text-white text-xs py-1.5 px-4 flex justify-between items-center font-medium shadow-md">
              <span>Error: {deployError}</span>
              <button onClick={() => setDeployError(null)} className="underline hover:text-gray-200">Dismiss</button>
            </div>
          )}
          {deployResult && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-green-600 text-white text-xs py-2 px-4 flex justify-between items-center font-medium shadow-md">
              <span className="flex items-center gap-2">
                🚀 Successfully deployed to {deployResult.provider}!
                <a href={deployResult.url} target="_blank" rel="noreferrer" className="underline font-bold hover:text-green-200">
                  {deployResult.url}
                </a>
              </span>
              <button onClick={() => setDeployResult(null)} className="hover:text-gray-200">Dismiss</button>
            </div>
          )}

          {/* Editor Area */}
          <div className="flex-1 w-full h-full p-2 flex flex-col">
            {Object.keys(files).length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <FileUploader onFilesLoaded={handleFilesLoaded} />
              </div>
            ) : activeFile ? (
              files[activeFile].isBinary ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-900 rounded-lg border border-gray-700">
                  <Code2 className="w-16 h-16 mb-4 opacity-50" />
                  <p>Cannot edit binary file: {activeFile}</p>
                </div>
              ) : (
                <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden flex flex-col relative pt-8">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3 text-xs text-gray-400 font-mono">
                    {activeFile}
                  </div>
                  <Editor
                    height="100%"
                    language={getLanguage(activeFile)}
                    theme="vs-dark"
                    value={files[activeFile]?.content || ''}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      padding: { top: 16 }
                    }}
                  />
                </div>
              )
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a file to edit
              </div>
            )}
          </div>

          {/* Bottom Uploader (when files exist) */}
          {Object.keys(files).length > 0 && (
             <div className="h-40 border-t border-gray-700 p-2 shrink-0 bg-gray-900">
               <FileUploader onFilesLoaded={handleFilesLoaded} />
             </div>
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        netlifyToken={netlifyToken}
        setNetlifyToken={(t) => handleSaveTokens(t, vercelToken)}
        vercelToken={vercelToken}
        setVercelToken={(t) => handleSaveTokens(netlifyToken, t)}
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        files={files}
      />
    </div>
  );
}
