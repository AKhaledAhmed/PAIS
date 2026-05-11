import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import MapComponent from '../../Components/MapComponent/MapComponent';
import axios from 'axios';
import { MapPin, Phone, Mail, Package, IdCard } from 'lucide-react';

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [inventoryCount, setInventoryCount] = useState(0);

  const pharmacyLocation = user?.location?.coordinates
    ? {
        lng: user.location.coordinates[0],
        lat: user.location.coordinates[1]
      }
    : null;

  useEffect(() => {
    async function fetchInventoryCount() {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          'https://pais-production.up.railway.app/api/inventory',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) setInventoryCount(response.data.count);
      } catch (err) {
        console.error(err);
      }
    }
    fetchInventoryCount();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.pharmacyName}</h1>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            user?.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {user?.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">ID: {user?.applicationId}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="bg-cyan-100 p-3 rounded-xl">
            <Package className="w-6 h-6 text-cyan-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Drugs in Inventory</p>
            <p className="text-2xl font-bold text-gray-900">{inventoryCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <IdCard className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">License ID</p>
            <p className="text-lg font-bold text-gray-900">{user?.licenseId}</p>
          </div>
        </div>
      </div>

      {/* Info + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pharmacy Info */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Pharmacy Details</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-700 shrink-0" />
              <span>{user?.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-cyan-700 shrink-0" />
              <span>{user?.pharmacyPhone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-700 shrink-0" />
              <span>{user?.pharmacyEmail}</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <MapComponent
          userLocation={pharmacyLocation}
          pharmacies={[]}
        />
      </div>
    </div>
  );
}