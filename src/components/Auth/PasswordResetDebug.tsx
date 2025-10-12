import React, { useEffect, useState } from 'react';

const PasswordResetDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    setDebugInfo({
      currentUrl: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      queryParams: {
        type: urlParams.get('type'),
        access_token: urlParams.get('access_token') ? 'Present' : 'Missing',
        refresh_token: urlParams.get('refresh_token') ? 'Present' : 'Missing',
      },
      hashParams: {
        type: hashParams.get('type'),
        access_token: hashParams.get('access_token') ? 'Present' : 'Missing',
        refresh_token: hashParams.get('refresh_token') ? 'Present' : 'Missing',
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="bg-[#161b22] rounded-lg p-8 border border-gray-800 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Password Reset Debug Info</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Current URL:</h3>
            <p className="text-gray-300 break-all">{debugInfo.currentUrl}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Query Parameters (?):</h3>
            <pre className="text-gray-300 bg-[#0d1117] p-3 rounded text-sm">
              {JSON.stringify(debugInfo.queryParams, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Hash Parameters (#):</h3>
            <pre className="text-gray-300 bg-[#0d1117] p-3 rounded text-sm">
              {JSON.stringify(debugInfo.hashParams, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Raw Search:</h3>
            <p className="text-gray-300 break-all">{debugInfo.search || 'None'}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Raw Hash:</h3>
            <p className="text-gray-300 break-all">{debugInfo.hash || 'None'}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Instructions:</strong> Copy this debug information and share it to help troubleshoot the password reset issue.
          </p>
        </div>
        
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Go to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetDebug;
