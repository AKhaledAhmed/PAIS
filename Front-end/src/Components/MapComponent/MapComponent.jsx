import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const API_KEY = '441d4682e97543e095ebac2bda8aedff';

export default function MapComponent({ userLocation, pharmacies = [] }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!userLocation || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${API_KEY}`,
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });

  }, [userLocation]);

  

useEffect(() => {
  if (!mapRef.current || !userLocation) return;

  markersRef.current.forEach(m => m.remove());
  markersRef.current = [];

  const addMarkers = () => {
   
    const userMarker = new maplibregl.Marker({ color: '#0e7490' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new maplibregl.Popup().setText('📍 You are here'))
      .addTo(mapRef.current);
    markersRef.current.push(userMarker);

   
    pharmacies.forEach((pharmacy) => {
      if (!pharmacy.location?.coordinates) return; 
      const [lng, lat] = pharmacy.location.coordinates;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family:sans-serif;min-width:150px">
          <strong style="color:#065f46">${pharmacy.pharmacyName}</strong><br/>
          <span style="font-size:12px">${pharmacy.address || ''}</span><br/>
          <span style="font-size:12px">${pharmacy.pharmacyPhone || ''}</span>
        </div>
      `);

      const marker = new maplibregl.Marker({ color: '#065f46' })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  };

 
  if (mapRef.current.isStyleLoaded()) {
    addMarkers();
  } else {
    mapRef.current.once('load', addMarkers); 
  }

}, [pharmacies, userLocation]); 

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl text-gray-500 text-sm">
        📍 Allow location access to see the map
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 rounded-2xl overflow-hidden shadow"
    />
  );
}