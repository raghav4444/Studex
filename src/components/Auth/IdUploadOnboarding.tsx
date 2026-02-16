import React, { useState, useRef } from 'react';
import { CreditCard, Upload, ChevronRight } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'studex_id_upload_done_';

export function getIdUploadStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function hasCompletedIdUpload(userId: string): boolean {
  return localStorage.getItem(getIdUploadStorageKey(userId)) === 'true';
}

export function setCompletedIdUpload(userId: string): void {
  localStorage.setItem(getIdUploadStorageKey(userId), 'true');
}

interface IdUploadOnboardingProps {
  userId: string;
  onComplete: () => void;
}

const IdUploadOnboarding: React.FC<IdUploadOnboardingProps> = ({ userId, onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    if (!chosen.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(chosen);
    setPreviewUrl(URL.createObjectURL(chosen));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleContinue = () => {
    setCompletedIdUpload(userId);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Upload your student ID</h1>
            <p className="text-gray-400 text-sm">
              Upload a photo of your student ID card. We’ll use it to keep the platform verified.
            </p>
          </div>

          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-800/30 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-sm text-gray-400 text-center px-4">
                Choose from device
              </span>
              <span className="text-xs text-gray-500 mt-1">JPG, PNG</span>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#0d1117]">
                <img
                  src={previewUrl}
                  alt="ID preview"
                  className="w-full max-h-52 object-contain"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="py-2.5 px-4 border border-gray-600 text-gray-400 hover:bg-gray-800 rounded-lg text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!file}
            className="mt-6 w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdUploadOnboarding;
