import React, { useState } from 'react';
import { Settings, X, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  netlifyToken: string;
  setNetlifyToken: (val: string) => void;
  vercelToken: string;
  setVercelToken: (val: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  netlifyToken,
  setNetlifyToken,
  vercelToken,
  setVercelToken,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" /> Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-400" /> Netlify API Token
            </label>
            <input
              type="password"
              value={netlifyToken}
              onChange={(e) => setNetlifyToken(e.target.value)}
              placeholder="nfp_..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
            <p className="text-xs text-gray-500">
              Saved locally. Used for deployments.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-white" /> Vercel API Token
            </label>
            <input
              type="password"
              value={vercelToken}
              onChange={(e) => setVercelToken(e.target.value)}
              placeholder="Bearer..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            />
            <p className="text-xs text-gray-500">
              Saved locally. Used for deployments.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
