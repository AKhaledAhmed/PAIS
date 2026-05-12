// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../Context/AuthContext';
// import MapComponent from '../../Components/MapComponent/MapComponent';
// import axios from 'axios';
// import { MapPin, Phone, Mail, Package, IdCard } from 'lucide-react';

// export default function PharmacistDashboard() {
//   const { user } = useAuth();
//   const [inventoryCount, setInventoryCount] = useState(0);

//   const pharmacyLocation = user?.location?.coordinates
//     ? {
//         lng: user.location.coordinates[0],
//         lat: user.location.coordinates[1]
//       }
//     : null;

//   useEffect(() => {
//     async function fetchInventoryCount() {
//       try {
//         const token = localStorage.getItem('accessToken');
//         const response = await axios.get(
//           'https://pais-production.up.railway.app/api/inventory',
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (response.data.success) setInventoryCount(response.data.count);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     fetchInventoryCount();
//   }, []);

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">{user?.pharmacyName}</h1>
//           <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//             user?.status === 'approved'
//               ? 'bg-green-100 text-green-700'
//               : 'bg-yellow-100 text-yellow-700'
//           }`}>
//             {user?.status}
//           </span>
//         </div>
//         <p className="text-sm text-gray-500">ID: {user?.applicationId}</p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
//           <div className="bg-cyan-100 p-3 rounded-xl">
//             <Package className="w-6 h-6 text-cyan-700" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Total Drugs in Inventory</p>
//             <p className="text-2xl font-bold text-gray-900">{inventoryCount}</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
//           <div className="bg-green-100 p-3 rounded-xl">
//             <IdCard className="w-6 h-6 text-green-700" />
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">License ID</p>
//             <p className="text-lg font-bold text-gray-900">{user?.licenseId}</p>
//           </div>
//         </div>
//       </div>

//       {/* Info + Map */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
//         {/* Pharmacy Info */}
//         <div className="bg-white rounded-2xl shadow p-6 space-y-4">
//           <h2 className="text-lg font-bold text-gray-900">Pharmacy Details</h2>
//           <div className="space-y-3 text-gray-600">
//             <div className="flex items-center gap-3">
//               <MapPin className="w-5 h-5 text-cyan-700 shrink-0" />
//               <span>{user?.address}</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <Phone className="w-5 h-5 text-cyan-700 shrink-0" />
//               <span>{user?.pharmacyPhone}</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <Mail className="w-5 h-5 text-cyan-700 shrink-0" />
//               <span>{user?.pharmacyEmail}</span>
//             </div>
//           </div>
//         </div>

//         {/* Map */}
//         <MapComponent
//           userLocation={pharmacyLocation}
//           pharmacies={[]}
//         />
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import MapComponent from '../../Components/MapComponent/MapComponent';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Loader from '../../Components/Loader/Loader';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const pharmacyLocation = user?.location?.coordinates
    ? { lng: user.location.coordinates[0], lat: user.location.coordinates[1] }
    : null;

  useEffect(() => { fetchDashboard(); }, []);

  async function fetchDashboard() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://pais-production.up.railway.app/api/dashboard',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) setDashData(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-full py-20 text-gray-400">
      <Loader/>
    </div>
  );

  const predictions = dashData?.predictions || [];
  const opportunities = dashData?.opportunities || [];
  const stats = dashData?.stats || {};
  const heatmapPoints = dashData?.heatmap || [];

  
  const mapPharmacies = heatmapPoints.map((p, i) => ({
    _id: `heat-${i}`,
    pharmacyName: `Demand Zone`,
    address: '',
    location: { type: 'Point', coordinates: [p._id.lng, p._id.lat] }
  }));


  const chartData = {
    labels: predictions.slice(0, 10).map(p => p.name),
    datasets: [{
      label: 'Predicted Demand',
      data: predictions.slice(0, 10).map(p => p.expected_demand),
      backgroundColor: '#0e7490',
      borderRadius: 6,
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#e5e7eb' }, ticks: { color: '#6b7280' } },
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } }
    }
  };

  return (
    <div className="space-y-6">

     
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.pharmacyName}</h1>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            user?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>{user?.status}</span>
        </div>
      
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          stats.aiStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          AI {stats.aiStatus?.toUpperCase()}
        </span>
      </div>

     
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Total Predicted</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalItemsPredicted}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Critical Alerts</p>
          <p className="text-3xl font-bold text-red-600">{stats.criticalAlerts}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Opportunities</p>
          <p className="text-3xl font-bold text-cyan-700">{opportunities.length}</p>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
       
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">
            Demand Geofence (5km)
          </h2>
          <MapComponent
            userLocation={pharmacyLocation}
            pharmacies={mapPharmacies}
          />
        </div>

        
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">
            Local Demand Forecast
          </h2>
          <div style={{ height: '300px' }}>
            {predictions.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                AI offline — no predictions available
              </div>
            )}
          </div>
        </div>
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

       
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-sm font-bold text-gray-500 uppercase">Priority Inventory Actions</h2>
          </div>
          <div className="overflow-y-auto max-h-72">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Drug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Demand</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Shortage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {predictions.map((p) => (
                  <tr key={p.drugId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.expected_demand}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={p.suggested_raise > 0 ? 'text-yellow-600 font-bold' : 'text-gray-400'}>
                        +{p.suggested_raise}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        p.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        p.status === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Action Feed */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-500 uppercase">Smart Action Feed</h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {stats.criticalAlerts}
            </span>
          </div>
          <div className="overflow-y-auto max-h-72 p-4 space-y-3">
            {predictions.filter(p => p.status !== 'SAFE').map((p) => (
              <div key={p.drugId} className={`p-4 rounded-xl border-l-4 ${
                p.status === 'CRITICAL'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <p className={`text-xs font-bold mb-1 ${
                  p.status === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {p.status}
                </p>
                <p className="text-sm text-gray-700">
                  Stock for <strong>{p.name}</strong> is low relative to local demand.
                  Increase supply by <strong>{p.suggested_raise} units</strong>.
                </p>
              </div>
            ))}

            {opportunities.map((o) => (
              <div key={o.drugId} className="p-4 rounded-xl border-l-4 bg-cyan-50 border-cyan-500">
                <p className="text-xs font-bold mb-1 text-cyan-700">MARKET OPPORTUNITY</p>
                <p className="text-sm text-gray-700">
                  High local demand for <strong>{o.name}</strong>. Consider adding it to your inventory.
                </p>
              </div>
            ))}

            {predictions.filter(p => p.status !== 'SAFE').length === 0 &&
             opportunities.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                All stock levels are healthy ✅
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}