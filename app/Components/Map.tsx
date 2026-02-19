"use client";
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Set your Mapbox access token here
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapProps {
  className?: string;
  style?: React.CSSProperties;
}

const Map: React.FC<MapProps> = ({ className = '', style = {} }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  // Resize map when container changes
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapInstance.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard', // Standard basemap
      projection: 'globe',
      center: [32.579956,0.335081],
      zoom: 2, // Show the whole globe
      antialias: true,
    });

    // Clean up on unmount
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Listen for resize, debounce to prevent flicker
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout | null = null;
    const debouncedResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        mapInstance.current?.resize();
      }, 100); // 100ms debounce
    };
    window.addEventListener('resize', debouncedResize);
    // Also trigger on panel resize
    let observer: ResizeObserver | null = null;
    if (mapContainer.current) {
      observer = new ResizeObserver(debouncedResize);
      observer.observe(mapContainer.current);
    }
    return () => {
      if (observer && mapContainer.current) observer.disconnect();
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
    >
      <div
        ref={mapContainer}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </div>
  );
};

export default Map;
