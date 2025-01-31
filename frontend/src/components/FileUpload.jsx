import { useState } from 'react';
import axios from 'axios';
import DataTable from './DataTable';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xls, .xlsx, or .csv)');
        setFile(null);
        return;
      }

      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setUploadedData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Get the data from the uploaded file
      const dataResponse = await axios.get(`http://localhost:5000/api/files/data/${response.data.filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess(`File uploaded successfully! ${response.data.rowCount} rows found.`);
      setUploadedData(dataResponse.data.data);
      setFile(null);
      // Reset the file input
      e.target.reset();
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="flex flex-col md:flex-row w-full">
        <div className="w-full md:w-1/3 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Upload Excel File</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  Choose File
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  accept=".xls,.xlsx,.csv"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Accepted formats: .xls, .xlsx, .csv (max 5MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-2 px-4 rounded ${
                  loading || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {loading ? 'Uploading...' : 'Upload File'}
              </button>
            </form>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-4">
          {uploadedData ? (
            <div className="bg-white rounded-lg shadow-md">
              <DataTable data={uploadedData} />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
              Upload an Excel file to view its contents here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
