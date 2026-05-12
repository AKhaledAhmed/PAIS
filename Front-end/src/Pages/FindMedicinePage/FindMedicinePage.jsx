import React, { useEffect } from 'react'
import SearchBar from '../../Components/SearchBar/SearchBar'
import { LoaderPinwheel, MapPin, ScaleIcon } from 'lucide-react'
import MapPlaceholder from '../../Components/MapPlaceholder/MapPlaceholder';
import PharmacyCard from '../../Components/PharmacyCard/PharmacyCard';
import MedicineCard from '../../Components/MedicineCard/MedicineCard';
import  { useState } from "react"
import axios from 'axios';
import Loader from '../../Components/Loader/Loader';
import MapComponent from '../../Components/MapComponent/MapComponent';
import { useAuth } from '../../Context/AuthContext';

 
export default function FindMedicinePage() {
  const [userLocation, setUserLocation] = useState(null);
const [pharmacies, setPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alternatives, setAlternatives] = useState({});
const [loadingAlt, setLoadingAlt] = useState(null);

 const {user}= useAuth();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        getNearbyPharmacies(loc); 
      },
      (err) => {
        console.error("Location denied:", err);
      }
    );
  }, []);


    async function getNearbyPharmacies(location) {
    try {
      const response = await axios.get(
        'https://pais-production.up.railway.app/api/search/nearby',
        {
          params: {
            lat: location.lat,
            lng: location.lng,
            radius: 5000,
          },
        }
      );
      if (response.data.success) {
        setPharmacies(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch nearby pharmacies:", err);
    }
  }
async function searchDrugs(term) {
   if (!term.trim()) {
    setMedicines([]);
    setError(null);
    return; 
  }
  setIsLoading(true);
  setError(null);
  try{
    const response = await axios.get('https://pais-production.up.railway.app/api/search',{
   params:{q:term},
  })
  if(response.data.success){
    setMedicines(response.data.data);
  }
  }
  catch(err){
    setError(err.message || "Something went wrong.");
  }
  finally{
    setIsLoading(false);
  }
}
  


async function getAlternatives(drugId) {
  setLoadingAlt(drugId)
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(
      `https://pais-production.up.railway.app/api/search/${drugId}/alternatives`,
      {
        params: { topK: 5 },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (response.data.success) {
      setAlternatives(prev=>({
        ...prev,
        [drugId] : response.data.data
      }));
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
  finally {
    setLoadingAlt(null);
  }
}
  return (
    <>
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto'>
             <h2 className="text-gray-900 text-4xl font-semibold pt-3">
        Find Medicine
       </h2>
          <p className='text-gray-500 mt-2'>
            Search for medicines and find nearby pharmacies with availability</p>
            <div className="mt-6 ">
                 <SearchBar onSearch={(term)=>{
                  setSearchTerm(term)
                  searchDrugs(term);
                 }}/>
      
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mt-3">
                Found Medicines
              </h2>
              <span className="text-sm text-gray-500">
                {medicines.length} results
              </span>
            </div>

         
 
            {isLoading && (
             <Loader/>
            )}

 {error && (
              <div className="text-center py-12 text-red-500">{error}</div>
            )}

                {!isLoading&& !error&& medicines.length === 0  &&
              <div className="text-center py-12 text-gray-500">
                No medicines found 
              </div>
}  

       {!isLoading &&
              <div className="space-y-3">
                {medicines.map((medicine) => (
                  <MedicineCard
                    key={medicine._id}
                    id={medicine._id}
                    name={medicine.name}
                    image={medicine.imageUrl}
                    activeIngredient={medicine.composition.join(", ")}
                    description={medicine.uses}
                    category={medicine.category}
                     onGetAlternatives={() => getAlternatives(medicine._id)}
                     alternatives={alternatives[medicine._id] || []}
                     isLoadingAlternatives={loadingAlt === medicine._id}
                  />
                ))}
              </div>
       }
            
          </div>

          <div className="lg:sticky lg:top-6 h-fit">
           <MapComponent userLocation={userLocation} pharmacies={pharmacies} />
          </div>
        </div>
      </div>
    </div>
   
    </>
  )
}
