"use client";
import React, { useRef, useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  className?: string;
  style?: React.CSSProperties;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map: React.FC<MapProps> = ({ className = "", style = {} }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("mapbox-gl").Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Resize map when container changes
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapInstance.current) return;
    if (!mapboxToken) {
      setMapError("Map is unavailable: NEXT_PUBLIC_MAPBOX_TOKEN is not set.");
      return;
    }

    let isMounted = true;

    void import("mapbox-gl")
      .then((mapboxgl) => {
        if (!isMounted || !mapContainer.current) return;

        mapboxgl.default.accessToken = mapboxToken;

        const map = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/standard",
          projection: "globe",
          center: [32.579956, 0.335081],
          zoom: 2,
          antialias: true,
        });

        map.on("error", () => {
          setMapError("Map failed to load. Please verify your Mapbox token.");
        });

        mapInstance.current = map;
      })
      .catch(() => {
        setMapError("Map could not be initialized.");
      });

    return () => {
      isMounted = false;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Listen for resize, debounce to prevent flicker
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
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
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <div
        ref={mapContainer}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 text-center text-sm text-slate-700">
          {mapError}
        </div>
      ) : null}
    </div>
  );
};

export default Map;
