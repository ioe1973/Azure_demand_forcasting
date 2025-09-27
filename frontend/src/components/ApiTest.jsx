import React, { useEffect, useState } from 'react';
import { useApiData } from '../hooks/useApiData';
import { getUsageTrends, getRawData } from '../services/apiService';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});

  // Test usage trends API
  const { data: trendsData, loading: trendsLoading, error: trendsError } = useApiData(getUsageTrends);

  // Test raw data API
  const { data: rawData, loading: rawLoading, error: rawError } = useApiData(getRawData);

  useEffect(() => {
    setTestResults({
      trendsTest: {
        loading: trendsLoading,
        error: trendsError,
        hasData: !!trendsData,
        dataPreview: trendsData ? JSON.stringify(trendsData, null, 2).substring(0, 200) + '...' : null
      },
      rawTest: {
        loading: rawLoading,
        error: rawError,
        hasData: !!rawData,
        dataCount: Array.isArray(rawData) ? rawData.length : 0
      }
    });
  }, [trendsData, trendsLoading, trendsError, rawData, rawLoading, rawError]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 API Connection Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>📊 Usage Trends API Test</h3>
        <p><strong>Loading:</strong> {testResults.trendsTest?.loading ? '⏳ Yes' : '✅ No'}</p>
        <p><strong>Error:</strong> {testResults.trendsTest?.error || '✅ None'}</p>
        <p><strong>Has Data:</strong> {testResults.trendsTest?.hasData ? '✅ Yes' : '❌ No'}</p>
        {testResults.trendsTest?.dataPreview && (
          <details>
            <summary>📋 Data Preview</summary>
            <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
              {testResults.trendsTest.dataPreview}
            </pre>
          </details>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>📋 Raw Data API Test</h3>
        <p><strong>Loading:</strong> {testResults.rawTest?.loading ? '⏳ Yes' : '✅ No'}</p>
        <p><strong>Error:</strong> {testResults.rawTest?.error || '✅ None'}</p>
        <p><strong>Has Data:</strong> {testResults.rawTest?.hasData ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Record Count:</strong> {testResults.rawTest?.dataCount || 0}</p>
      </div>

      {(testResults.trendsTest?.hasData && testResults.rawTest?.hasData) && (
        <div style={{ padding: '15px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', color: '#155724' }}>
          <h3>🎉 SUCCESS!</h3>
          <p>Your backend API is working correctly and serving real CSV data!</p>
          <p>You can now proceed to update your dashboard components.</p>
        </div>
      )}

      {(testResults.trendsTest?.error || testResults.rawTest?.error) && (
        <div style={{ padding: '15px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', color: '#721c24' }}>
          <h3>❌ API Connection Issues</h3>
          <p>Make sure your backend server is running on http://localhost:8000</p>
          <p>Check the browser console for detailed error messages.</p>
        </div>
      )}
    </div>
  );
};

export default ApiTest;