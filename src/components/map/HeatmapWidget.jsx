import React, { useEffect, useRef } from 'react';

// Lightweight map without react-leaflet dependency issues
export default function HeatmapWidget({ points = [], zones = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    // Dynamically import leaflet
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        center: [28.614, 77.209],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add zone markers
      zones.forEach(zone => {
        const circle = L.circle([zone.lat, zone.lng], {
          color: zone.count > 30 ? '#ff006e' : zone.count > 20 ? '#ff8800' : '#00f5ff',
          fillColor: zone.count > 30 ? '#ff006e' : zone.count > 20 ? '#ff8800' : '#00f5ff',
          fillOpacity: 0.2,
          radius: zone.count * 5,
          weight: 1,
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family:Inter,sans-serif;color:#fff;background:#1a1a1a;padding:8px;border-radius:6px">
            <strong style="color:#00f5ff">${zone.name}</strong><br/>
            <span style="color:#ccc">${zone.count} reports</span><br/>
            <span style="color:${zone.trend.startsWith('+') ? '#ff6b6b' : '#00ff88'}">${zone.trend} trend</span>
          </div>
        `, { className: 'dark-popup' });
      });

      // Add heatmap-like dots for each point
      points.forEach(([lat, lng, intensity]) => {
        L.circleMarker([lat, lng], {
          radius: 4 + intensity * 4,
          color: 'transparent',
          fillColor: intensity > 0.7 ? '#ff006e' : intensity > 0.5 ? '#ff8800' : '#00f5ff',
          fillOpacity: intensity * 0.6,
        }).addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height: '320px', background: '#111' }}
    />
  );
}
