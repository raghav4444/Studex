import React, { useState, useRef } from 'react';
import { CreditCard, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/** Min file size (bytes) to treat as "clear" image; below = "blurry/invalid" for mock. */
const MIN_CLEAR_IMAGE_BYTES = 30_000;

export type IDVerificationStatus = 'idle' | 'verifying' | 'verified' | 'failed';

export interface ExtractedIDDetails {
  name: string;
  college: string;
  idNumber: string;
}

const IDVerification: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<IDVerificationStatus>('idle');
  const [extractedDetails, setExtractedDetails] = useState<ExtractedIDDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setExtractedDetails(null);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image (JPG, PNG, etc.).');
      return;
    }
    reset();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('idle');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVerify = () => {
    if (!selectedFile) return;
    setStatus('verifying');
    setErrorMessage(null);

    // Mock verification: no OCR. Use file size as proxy for "clear" vs "blurry".
    setTimeout(() => {
      if (selectedFile.size >= MIN_CLEAR_IMAGE_BYTES) {
        setExtractedDetails({
          name: 'Student Name',
          college: 'Your College',
          idNumber: 'ID-XXXX-XXXX',
        });
        setStatus('verified');
      } else {
        setStatus('failed');
        setErrorMessage('Unable to verify ID');
      }
    }, 800);
  };

  const handleRemove = () => reset();

  return (
    <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          ID Card Verification
        </h3>
        {status === 'verified' && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Fully Verified
          </span>
        )}
      </div>

      {status === 'idle' || status === 'verifying' ? (
        <>
          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-800/30 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400 text-center px-4">
                Upload a clear photo of your student ID
              </span>
              <span className="text-xs text-gray-500 mt-1">JPG, PNG (no OCR yet)</span>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-[#0d1117]">
                <img
                  src={previewUrl}
                  alt="ID preview"
                  className="w-full max-h-48 object-contain"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={status === 'verifying'}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-colors"
                >
                  {status === 'verifying' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify ID'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </>
      ) : status === 'verified' && extractedDetails ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-700 bg-[#0d1117] p-4 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Details from ID</p>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="text-white font-medium">{extractedDetails.name}</p>
              </div>
              <div>
                <span className="text-gray-500">College</span>
                <p className="text-white font-medium">{extractedDetails.college}</p>
              </div>
              <div>
                <span className="text-gray-500">ID Number</span>
                <p className="text-white font-medium">{extractedDetails.idNumber}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Upload a different ID
          </button>
        </div>
      ) : (
        /* failed */
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{errorMessage || 'Unable to verify ID'}</p>
          </div>
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border border-gray-700">
              <img
                src={previewUrl}
                alt="ID preview"
                className="w-full max-h-32 object-contain opacity-80"
              />
            </div>
          )}
          <p className="text-xs text-gray-500">
            Use a clear, well-lit photo of your student ID. Blurry or low-quality images cannot be verified.
          </p>
          <button
            type="button"
            onClick={handleRemove}
            className="w-full py-2.5 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {errorMessage && status !== 'failed' && (
        <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
      )}
    </div>
  );
};

export default IDVerification;
