import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryFormPage() {
  const { drugId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogResults, setCatalogResults] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [form, setForm] = useState({
    stockQuantity: 0,
    price: 0,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  
  useEffect(() => {
    if (drugId) {
      fetchCurrentItem();
    }
  }, [drugId]);

  async function fetchCurrentItem() {
    try {
      const response = await axios.get(
        `https://pais-production.up.railway.app/api/inventory/item/${drugId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const data = response.data.data;
        setForm({
          stockQuantity: data.stockQuantity,
          price: data.price,
          notes: data.notes || '',
        });
        if (data.drugId) setSelectedDrug(data.drugId);
      }
    } catch (err) {
      console.error(err);
    }
  }

  
  async function searchCatalog(query) {
    if (!query.trim()) { setCatalogResults([]); return; }
    try {
      const response = await axios.get(
        'https://pais-production.up.railway.app/api/inventory/search-catalog',
        {
          params: { query },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) setCatalogResults(response.data.data);
    } catch (err) {
     toast.error(err)
    }
  }

  
  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedDrug) return alert('Please select a drug first');
    setIsSubmitting(true);
    try {
      const response = await axios.patch(
        'https://pais-production.up.railway.app/api/inventory/update',
        {
          drugId: selectedDrug._id,
          stockQuantity: Number(form.stockQuantity),
          price: Number(form.price),
          notes: form.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setSuccessMsg('Saved successfully!');
        setTimeout(() => navigate('/pharmacist/inventory'), 1000);
      }
    } catch (err) {
      toast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {drugId ? 'Edit Inventory Item' : 'Add Drug to Inventory'}
      </h1>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6 space-y-5">
        
        
        {!drugId && (
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Search Drug Catalog
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by drug name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                value={catalogSearch}
                onChange={(e) => {
                  setCatalogSearch(e.target.value);
                  searchCatalog(e.target.value);
                }}
              />
            </div>
           
            {catalogResults.length > 0 && !selectedDrug && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                {catalogResults.map((drug) => (
                  <button
                    key={drug._id}
                    onClick={() => {
                      setSelectedDrug(drug);
                      setCatalogResults([]);
                      setCatalogSearch(drug.name);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition border-b last:border-0"
                  >
                    <p className="font-medium text-gray-800">{drug.name}</p>
                    <p className="text-xs text-gray-500">{drug.category} · {drug.dosageForm}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedDrug && (
              <div className="mt-2 p-3 bg-cyan-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-medium text-cyan-800">{selectedDrug.name}</p>
                  <p className="text-xs text-gray-500">{selectedDrug.category}</p>
                </div>
                <button
                  onClick={() => { setSelectedDrug(null); setCatalogSearch(''); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        )}

       
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Stock Quantity</label>
            <input
              type="number"
              min="0"
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Price (EGP)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Notes</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Restock every Monday"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-cyan-900 text-white rounded-xl font-bold hover:bg-cyan-950 transition disabled:bg-gray-300"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/pharmacist/inventory')}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}