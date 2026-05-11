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

  // initialize map
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${API_KEY}`,
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
    });

  }, [userLocation]);

  // لما الصيدليات تتغير، حدّث الـ markers
  // useEffect(() => {
  //   if (!mapRef.current || !userLocation) return;

  //   // امسح الـ markers القديمة
  //   markersRef.current.forEach(m => m.remove());
  //   markersRef.current = [];

  //   const addMarkers = () => {
  //     // 📍 Pin 
  //     const userMarker = new maplibregl.Marker({ color: '#0e7490' })
  //       .setLngLat([userLocation.lng, userLocation.lat])
  //       .setPopup(new maplibregl.Popup().setText('📍 You are here'))
  //       .addTo(mapRef.current);
  //     markersRef.current.push(userMarker);

  //     // 🏥 Pins الصيدليات
  //     pharmacies.forEach((pharmacy) => {
  //       const [lng, lat] = pharmacy.location.coordinates;

  //       const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
  //         <div style="font-family: sans-serif; min-width: 150px;">
  //           <strong style="color:#065f46">${pharmacy.pharmacyName}</strong><br/>
  //           <span style="font-size:12px">${pharmacy.address || ''}</span><br/>
  //           <span style="font-size:12px">${pharmacy.pharmacyPhone || ''}</span>
  //         </div>
  //       `);

  //       const pharmacyMarker = new maplibregl.Marker({ color: '#065f46' })
  //         .setLngLat([lng, lat])
  //         .setPopup(popup)
  //         .addTo(mapRef.current);

  //       markersRef.current.push(pharmacyMarker);
  //     });
  //   };

  //   // لو الخريطة لسه بتلود
  //   if (mapRef.current.isStyleLoaded()) {
  //     addMarkers();
  //   } else {
  //     mapRef.current.on('load', addMarkers);
  //   }

  //   return () => {
  //     mapRef.current?.off('load', addMarkers);
  //   };

  // }, [pharmacies, userLocation]);


useEffect(() => {
  if (!mapRef.current || !userLocation) return;

  markersRef.current.forEach(m => m.remove());
  markersRef.current = [];

  const addMarkers = () => {
    // user marker
    const userMarker = new maplibregl.Marker({ color: '#0e7490' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new maplibregl.Popup().setText('📍 You are here'))
      .addTo(mapRef.current);
    markersRef.current.push(userMarker);

    // pharmacy markers
    pharmacies.forEach((pharmacy) => {
      if (!pharmacy.location?.coordinates) return; // ✅ تأكد إن الـ coordinates موجودة
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

  // ✅ انتظر الخريطة تلود الأول
  if (mapRef.current.isStyleLoaded()) {
    addMarkers();
  } else {
    mapRef.current.once('load', addMarkers); // ✅ once بدل on
  }

}, [pharmacies, userLocation]); // ✅ pharmacies في الـ dependency array

  // Cleanup لما الـ component يتشال
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