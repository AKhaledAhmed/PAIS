import { useLocation } from 'react-router-dom';
import MapComponent from '../../Components/MapComponent/MapComponent';
import { Phone, MapPin, Ruler } from 'lucide-react';

export default function PharmacyDetails() {
  const { state } = useLocation();
  const pharmacy = state?.pharmacy;

  if (!pharmacy) return (
    <div className="text-center py-20 text-red-500">Pharmacy not found.</div>
  );

  const pharmacyLocation = {
    lng: pharmacy.location.coordinates[0],
    lat: pharmacy.location.coordinates[1]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {pharmacy.pharmacyName}
          </h1>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-700" />
              <span>{pharmacy.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-cyan-700" />
              <span>{pharmacy.pharmacyPhone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Ruler className="w-5 h-5 text-cyan-700" />
              <span>
                {pharmacy.distanceMeters < 1000
                  ? `${Math.round(pharmacy.distanceMeters)}m away`
                  : `${(pharmacy.distanceMeters / 1000).toFixed(1)}km away`}
              </span>
            </div>
          </div>
        </div>

        <MapComponent
          userLocation={pharmacyLocation}
          pharmacies={[pharmacy]}
        />

      </div>
    </div>
  );
}