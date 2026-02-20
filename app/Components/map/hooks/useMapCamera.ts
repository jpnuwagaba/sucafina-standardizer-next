"use client";

import { useCallback } from "react";

import { flyToCoordinates, resetCamera, zoomIn, zoomOut } from "../services/camera";

export function useMapCamera(mapRef: React.RefObject<import("mapbox-gl").Map | null>) {
  const onZoomIn = useCallback(() => {
    if (!mapRef.current) return;
    zoomIn(mapRef.current);
  }, [mapRef]);

  const onZoomOut = useCallback(() => {
    if (!mapRef.current) return;
    zoomOut(mapRef.current);
  }, [mapRef]);

  const onResetView = useCallback(() => {
    if (!mapRef.current) return;
    resetCamera(mapRef.current);
  }, [mapRef]);

  const onFlyTo = useCallback(
    (coordinates: [number, number], zoom?: number) => {
      if (!mapRef.current) return;
      flyToCoordinates(mapRef.current, coordinates, zoom);
    },
    [mapRef],
  );

  return { onZoomIn, onZoomOut, onResetView, onFlyTo };
}
