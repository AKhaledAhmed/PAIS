import React, { useEffect } from 'react'
import MedicineCard from '../../Components/MedicineCard/MedicineCard'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react';
import axios from 'axios';
import Loader from '../../Components/Loader/Loader';
import toast from 'react-hot-toast';
import MapComponent from '../../Components/MapComponent/MapComponent';

export default function MedicineDetails() {
 const {id}= useParams();
 const [medicine,setMedicine]=useState(null);
 const [isLoading,setIsLoading]=useState(true);
 const [error,setError]=useState(null);
   const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

useEffect(()=>{
  async function MedicineDetails(){
       try{
        const response = await axios.get(`https://pais-production.up.railway.app/api/search/${id}`);
        if(response.data.success){
          setMedicine(response.data.data);
        }
       }
       catch(err){
         setError(err);
       }
       finally{
        setIsLoading(false);
       }
  }
   MedicineDetails();
},[id])

  // location & nearby 
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);

        try {
          const response = await axios.get(
            'https://pais-production.up.railway.app/api/search/nearby',
            { params: { lat: loc.lat, lng: loc.lng } }
          );
          if (response.data.success) setNearbyPharmacies(response.data.data);
        } catch (err) {
          console.error("Failed to fetch pharmacies:", err);
        }
      },
      (err) => console.error("Location denied:", err)
    );
  }, []);


  return (
     <>
     {isLoading &&<Loader/> }
     {error&& toast.error('error!')}
     
     <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
        <img
          src={medicine?.imageUrl}
          alt={medicine?.name}
          className="w-24 h-24 object-cover rounded-xl mb-6"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{medicine?.name}</h1>
        <span className="text-sm text-cyan-700 font-medium">{medicine?.category}</span>

        <div className="mt-6 space-y-3 text-sm text-gray-600">
          <p><span className="font-semibold">Active Ingredient: </span>{medicine?.composition.join(", ")}</p>
          <p><span className="font-semibold">Dosage Form: </span>{medicine?.dosageForm}</p>
          <p><span className="font-semibold">Strength: </span>{medicine?.strength}</p>
          <p><span className="font-semibold">Uses: </span>{medicine?.uses}</p>
          <p><span className="font-semibold">Side Effects: </span>{medicine?.sideEffects}</p>
          <p><span className="font-semibold">Manufacturer: </span>{medicine?.manufacturer}</p>
          <p>
            <span className="font-semibold">Requires Prescription: </span>
            {medicine?.requiresPrescription ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>

 {/* Nearby pharmacies */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* List */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Nearby Pharmacies
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({nearbyPharmacies.length} found)
              </span>
            </h2>
            <div className="space-y-3">
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
                  </div>
                  <span className="text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-1 rounded-full whitespace-nowrap">
  {pharmacy.distanceMeters < 1000
    ? `${Math.round(pharmacy.distanceMeters)}m`
    : `${(pharmacy.distanceMeters / 1000).toFixed(1)}km`}
</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-6 h-fit">
            <MapComponent
              userLocation={userLocation}
              pharmacies={nearbyPharmacies}
            />
          </div>
        </div>

    
     
     </>
   
   
  )
}
