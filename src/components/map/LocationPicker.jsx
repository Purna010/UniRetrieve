import React, { useEffect, useRef, useState } from 'react';

export default function LocationPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLabel, setSelectedLabel] = useState(value?.label || '');

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        center: [28.614, 77.209],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const icon = L.divIcon({
        html: `<div style="
          width:24px;height:24px;
          background:rgba(0,245,255,0.9);
          border:2px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 0 12px rgba(0,245,255,0.6)
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: '',
      });

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
        }

        const fallbackLabel = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        setSelectedLabel("Resolving location...");
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'UniRetrieve-Campus-App' }
          });
          if (res.ok) {
            const data = await res.json();
            const displayName = data.name || data.display_name;
            if (displayName) {
              const shortened = displayName.split(',').slice(0, 3).join(',').trim();
              setSelectedLabel(shortened);
              onChange && onChange({ lat, lng, label: shortened });
              return;
            }
          }
          setSelectedLabel(fallbackLabel);
          onChange && onChange({ lat, lng, label: fallbackLabel });
        } catch (err) {
          setSelectedLabel(fallbackLabel);
          onChange && onChange({ lat, lng, label: fallbackLabel });
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden border border-white/10"
        style={{ height: '260px', background: '#111' }}
      />
      {selectedLabel ? (
        <p className="mt-2 text-xs text-neon-cyan/70 flex items-center gap-1">
          <span>📍</span> {selectedLabel}
        </p>
      ) : (
        <p className="mt-2 text-xs text-white/30 italic">Click on the map to select location</p>
      )}
    </div>
  );
}
