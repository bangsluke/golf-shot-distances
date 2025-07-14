import { useState } from 'react';
import axios from 'axios';

export const ApiDebugger = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="font-bold mb-2">API Debugger</h3>
      <div className="space-y-2">
        <button
          onClick={testClubsApi}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        >
          Test Clubs API
        </button>
      </div>
      
      {testResult && (
        <div className="mt-3">
          <h4 className="font-semibold text-sm">Result:</h4>
          <pre className="text-xs bg-gray-900 p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 