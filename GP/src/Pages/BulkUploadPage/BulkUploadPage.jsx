import React, { useState } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload() {
    if (!file) return alert('Please select a CSV file');
    setIsUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://pais-production.up.railway.app/api/inventory/bulk-upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setResult(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Inventory</h1>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">Upload a CSV file with your inventory</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm text-gray-600"
          />
        </div>

        {/* CSV Format hint */}
        <div className="bg-cyan-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-cyan-800 mb-2">CSV Format:</p>
          <code className="text-xs text-cyan-700">
            drugId, stockQuantity, price, notes
          </code>
        </div>

        {result && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {result.message}
            {result.errors && result.errors.map((e, i) => (
              <p key={i} className="text-xs mt-1">⚠️ {e}</p>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={isUploading || !file}
          className="w-full py-3 bg-cyan-900 text-white rounded-xl font-bold hover:bg-cyan-950 transition disabled:bg-gray-300"
        >
          {isUploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>
    </div>
  );
}