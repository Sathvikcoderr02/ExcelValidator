import { useState } from 'react';
import axios from 'axios';

function DataTable({ data }) {
  const [validationResults, setValidationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);

  const handleValidate = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      const totalRows = data.length;
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/files/validate',
        { data },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      clearInterval(progressInterval);
      setProgress(100);
      setValidationResults(response.data);

      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Validation error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error validating data');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/files/export',
        { data },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob' // Important for file download
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `validated-data-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  if (!data || data.length === 0) {
    return <div className="p-4">No data to display</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-xl font-semibold">Data Preview ({data.length} rows)</h2>
        <div className="flex gap-2">
          <button
            onClick={handleValidate}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
          >
            {loading ? 'Validating...' : 'Validate Data'}
          </button>
          {validationResults?.success && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="mx-4 mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-right">{progress}% Complete</p>
        </div>
      )}

      {/* Validation Results */}
      {validationResults && (
        <div className={`mx-4 mb-4 p-4 rounded ${validationResults.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="font-semibold mb-2">Validation Results</h3>
          {validationResults.success ? (
            <p className="text-green-600">{validationResults.message}</p>
          ) : (
            <div>
              <p className="text-red-600 mb-2">Found {validationResults.errors?.length || 0} validation errors:</p>
              <ul className="list-disc list-inside text-red-600">
                {validationResults.errors?.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto px-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(data[0]).map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {value?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
