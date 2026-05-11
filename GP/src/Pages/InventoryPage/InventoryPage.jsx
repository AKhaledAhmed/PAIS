import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Edit2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory(searchTerm = '') {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://pais-production.up.railway.app/api/inventory',
        {
          params: { search: searchTerm },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) setInventory(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Inventory</h1>
        <div className="flex gap-3">
          <Link
            to="/pharmacist/bulk-upload"
            className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-xl text-sm font-semibold hover:bg-cyan-200 transition"
          >
            Bulk Upload CSV
          </Link>
          <Link
            to="/pharmacist/inventory/add"
            className="px-4 py-2 bg-cyan-900 text-white rounded-xl text-sm font-semibold hover:bg-cyan-950 transition"
          >
            + Add Drug
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search inventory..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchInventory(e.target.value);
          }}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No drugs in inventory yet</p>
          <Link
            to="/pharmacist/inventory/add"
            className="mt-4 inline-block px-4 py-2 bg-cyan-900 text-white rounded-xl text-sm font-semibold"
          >
            Add Your First Drug
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Drug</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{item.drugId?.name}</p>
                    <p className="text-xs text-gray-500">{item.drugId?.dosageForm}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.drugId?.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.stockQuantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">EGP {item.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      item.inStock
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/pharmacist/inventory/edit/${item.drugId?._id}`}
                      className="flex items-center gap-1 text-sm text-cyan-700 hover:underline"
                    >
                      <Edit2 size={14}/> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}