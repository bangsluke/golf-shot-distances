import { useState } from 'react';
import axios from 'axios';

export const ApiDebugger = () => {
  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = window.innerWidth < 768;

  const testClubsApi = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/clubs');
      setTestResult({
        success: true,
        data: response.data,
        status: response.status
      });
    } catch (error: any) {
      setTestResult({
        error: true,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed ${isMobile ? 'bottom-2 right-2 left-2' : 'bottom-4 right-4'} bg-gray-800 text-white p-2 sm:p-4 rounded-lg shadow-lg ${isMobile ? 'max-w-full' : 'max-w-md'}`}>
      <h3 className={`font-bold mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>API Debugger</h3>
      <div className="space-y-2">
        <button
          onClick={testClubsApi}
          disabled={loading}
          className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-2 sm:px-3 py-1 rounded ${isMobile ? 'text-xs' : 'text-sm'}`}
        >
          Test Clubs API
        </button>
      </div>
      
      {testResult && (
        <div className="mt-3">
          <h4 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>Result:</h4>
          <pre className={`bg-gray-900 p-2 rounded mt-1 overflow-auto ${isMobile ? 'text-xs max-h-24' : 'text-xs max-h-32'}`}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 