"use client";

import { useEffect } from "react";

export function useMapResize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.RefObject<import("mapbox-gl").Map | null>,
) {
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const debouncedResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        mapRef.current?.resize();
      }, 100);
    };

    window.addEventListener("resize", debouncedResize);

    let observer: ResizeObserver | null = null;
    if (mapContainer.current) {
      observer = new ResizeObserver(debouncedResize);
      observer.observe(mapContainer.current);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", debouncedResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [mapContainer, mapRef]);
}
