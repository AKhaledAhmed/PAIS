import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import Loader from '../../Components/Loader/Loader';

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem('accessToken');

  useEffect(() => { fetchPharmacies(); }, []);

  async function fetchPharmacies() {
    try {
      const response = await axios.get(
        'https://pais-production.up.railway.app/api/admin/pharmacies',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) setPharmacies(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatus(pharmacyId, licenseId, status, reason = '') {
    setActionLoading(pharmacyId);
    try {
      await axios.patch(
        `https://pais-production.up.railway.app/api/admin/pharmacies/${pharmacyId}/status`,
        { status, licenseId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPharmacies(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
      setSelectedPharmacy(null);
    }
  }

  const filtered = filter === 'all'
    ? pharmacies
    : pharmacies.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pharmacy Applications</h1>

    
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              filter === f
                ? 'bg-cyan-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f} {f === 'pending' && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {pharmacies.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      
      {isLoading ? (
        <div className="text-center py-12 text-gray-400"><Loader/></div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Pharmacy</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Owner</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">License</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((pharmacy) => (
                <tr key={pharmacy._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{pharmacy.pharmacyName}</p>
                    <p className="text-xs text-gray-500">{pharmacy.applicationId}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pharmacy.ownerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pharmacy.licenseId}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      pharmacy.status === 'approved' ? 'bg-green-100 text-green-700' :
                      pharmacy.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pharmacy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {pharmacy.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatus(pharmacy._id, pharmacy.licenseId, 'approved')}
                            disabled={actionLoading === pharmacy._id}
                            className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-lg hover:bg-green-100 transition"
                          >
                            <CheckCircle size={14}/> Approve
                          </button>
                          <button
                            onClick={() => setSelectedPharmacy(pharmacy)}
                            disabled={actionLoading === pharmacy._id}
                            className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition"
                          >
                            <XCircle size={14}/> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

     
      {selectedPharmacy && (
        <RejectModal
          pharmacy={selectedPharmacy}
          onConfirm={(reason) => handleStatus(selectedPharmacy._id, selectedPharmacy.licenseId, 'rejected', reason)}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}
    </div>
  );
}

function RejectModal({ pharmacy, onConfirm, onClose }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Pharmacy</h3>
        <p className="text-sm text-gray-500 mb-4">
          Rejecting <strong>{pharmacy.pharmacyName}</strong>. Please provide a reason:
        </p>
        <textarea
          className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 text-sm"
          rows={3}
          placeholder="e.g. License document unclear..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:bg-gray-300"
          >
            Confirm Reject
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}