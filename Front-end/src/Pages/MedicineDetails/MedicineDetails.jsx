import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios';
import Loader from '../../Components/Loader/Loader';
import toast from 'react-hot-toast';
import MapComponent from '../../Components/MapComponent/MapComponent';

function formatPharmacyDistance(pharmacy) {
  const meters = Number(pharmacy.distanceMeters ?? pharmacy.distance);
  if (!Number.isFinite(meters)) return '—';
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}

function normalizePharmacy(pharmacy) {
  if (!pharmacy) return pharmacy;
  const coords = pharmacy.location?.coordinates ?? pharmacy.coordinates;
  if (!coords || !Array.isArray(coords) || coords.length < 2) return pharmacy;
  return {
    ...pharmacy,
    location: pharmacy.location ?? { type: 'Point', coordinates: coords },
  };
}

const FALLBACK_MAP_CENTER = { lat: 30.0444, lng: 31.2357 };

export default function MedicineDetails() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [usingFallbackLocation, setUsingFallbackLocation] = useState(false);

 
  useEffect(() => {
    async function fetchMedicine() {
      try {
        const response = await axios.get(
          `https://pais-production.up.railway.app/api/search/${id}`
        );
        if (response.data.success) setMedicine(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMedicine();
  }, [id]);

  
  useEffect(() => {
    let cancelled = false;

    async function fetchNearby(loc, fromGps) {
      setUserLocation(loc);
      setUsingFallbackLocation(!fromGps);
      try {
        const response = await axios.get(
          `https://pais-production.up.railway.app/api/search/${id}/nearby`,
          { params: { lat: loc.lat, lng: loc.lng } }
        );
        if (cancelled) return;
        const raw = response.data?.data;
        if (response.data.success && Array.isArray(raw)) {
          setNearbyPharmacies(raw.map(normalizePharmacy));
        } else {
          setNearbyPharmacies([]);
        }
      } catch (err) {
        console.error("Failed to fetch pharmacies:", err);
        if (!cancelled) setNearbyPharmacies([]);
      } finally {
        if (!cancelled) setNearbyLoading(false);
      }
    }

    setNearbyLoading(true);
    setNearbyPharmacies([]);

    if (!navigator.geolocation) {
      fetchNearby(FALLBACK_MAP_CENTER, false);
      return () => { cancelled = true; };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearby(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          true
        );
      },
      () => {
        fetchNearby(FALLBACK_MAP_CENTER, false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );

    return () => { cancelled = true; };
  }, [id]);

  const nearestPharmacy =
    nearbyPharmacies.length > 0
      ? [...nearbyPharmacies].sort(
          (a, b) =>
            (Number(a.distanceMeters) || Infinity) -
            (Number(b.distanceMeters) || Infinity)
        )[0]
      : null;

  return (
    <>
      {isLoading && <Loader />}
      {error && toast.error('error!')}

      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
          <img src={medicine?.imageUrl} alt={medicine?.name} className="w-24 h-24 object-cover rounded-xl mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{medicine?.name}</h1>
          <span className="text-sm text-cyan-700 font-medium">{medicine?.category}</span>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <p><span className="font-semibold">Active Ingredient: </span>{medicine?.composition?.join(", ")}</p>
            <p><span className="font-semibold">Dosage Form: </span>{medicine?.dosageForm}</p>
            <p><span className="font-semibold">Strength: </span>{medicine?.strength}</p>
            <p><span className="font-semibold">Uses: </span>{medicine?.uses}</p>
            <p><span className="font-semibold">Side Effects: </span>{medicine?.sideEffects}</p>
            <p><span className="font-semibold">Manufacturer: </span>{medicine?.manufacturer}</p>
            <p><span className="font-semibold">Requires Prescription: </span>{medicine?.requiresPrescription ? "Yes" : "No"}</p>
          </div>
        </div>

       
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Pharmacies with this drug
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({nearbyLoading ? '…' : nearbyPharmacies.length} found)
              </span>
            </h2>
            {usingFallbackLocation && !nearbyLoading && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                Could not read your GPS location (permission denied, insecure page, or timeout). Distances are from Cairo center — allow location for accurate results.
              </p>
            )}
            {nearestPharmacy && !nearbyLoading && (
              <p className="text-sm text-gray-700 mb-4">
                <span className="font-semibold text-gray-900">Nearest:</span>{' '}
                {nearestPharmacy.pharmacyName}
                <span className="text-cyan-700 font-medium ml-2">
                  · {formatPharmacyDistance(nearestPharmacy)}
                </span>
              </p>
            )}
            <div className="space-y-3">
              {nearbyLoading && (
                <p className="text-sm text-gray-500 py-2">Loading nearby pharmacies…</p>
              )}
              {!nearbyLoading && nearbyPharmacies.length === 0 && (
                <p className="text-sm text-gray-500 py-2">No pharmacies with this medicine in the search radius.</p>
              )}
              {nearbyPharmacies.map((pharmacy) => (
                <Link
                  to={`/pharmacy/${pharmacy._id}`}
                  state={{ pharmacy }}
                  key={pharmacy._id}
                  className="flex items-center justify-between p-3 border rounded-xl hover:bg-cyan-50 hover:border-cyan-200 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{pharmacy.pharmacyName}</p>
                    <p className="text-xs text-gray-500">{pharmacy.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {pharmacy.price && (
                        <span className="text-xs text-green-700 font-medium">EGP {pharmacy.price}</span>
                      )}
                      {typeof pharmacy.inStock === 'boolean' && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          pharmacy.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {pharmacy.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-1 rounded-full whitespace-nowrap">
                    {formatPharmacyDistance(pharmacy)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 h-fit">
            <MapComponent userLocation={userLocation} pharmacies={nearbyPharmacies} />
          </div>
        </div>
      </div>
    </>
  );
}