"use client";

import { useCallback, useMemo } from "react";

import { buildStandard1FeatureCollection, type Standard1Row } from "@/app/data/standard1";

import { flyToCoordinates, resetCamera, zoomIn, zoomOut } from "../services/camera";
import { getFeatureCollectionBounds, isPointBounds } from "../services/extent";

export function useMapCamera(
  mapRef: React.RefObject<import("mapbox-gl").Map | null>,
  rows: Standard1Row[],
) {
  const featureCollection = useMemo(() => buildStandard1FeatureCollection(rows), [rows]);

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

    const bounds = getFeatureCollectionBounds(featureCollection);

    if (!bounds) {
      resetCamera(mapRef.current);
      return;
    }

    if (isPointBounds(bounds)) {
      const [[lng, lat]] = bounds as [[number, number], [number, number]];
      mapRef.current.easeTo({
        center: [lng, lat],
        zoom: 11,
        duration: 450,
      });
      return;
    }

    mapRef.current.fitBounds(bounds, {
      padding: 64,
      maxZoom: 12,
      duration: 450,
    });
  }, [featureCollection, mapRef]);

  const onFlyTo = useCallback(
    (coordinates: [number, number], zoom?: number) => {
      if (!mapRef.current) return;
      flyToCoordinates(mapRef.current, coordinates, zoom);
    },
    [mapRef],
  );

  return { onZoomIn, onZoomOut, onResetView, onFlyTo };
}
