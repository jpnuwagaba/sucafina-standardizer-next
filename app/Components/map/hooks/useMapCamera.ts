"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { buildStandard1FeatureCollection, type Standard1Row } from "@/app/data/standard1";

import { flyToCoordinates, resetCamera, zoomIn, zoomOut } from "../services/camera";
import { getFeatureCollectionBounds, isPointBounds } from "../services/extent";

const THREE_D_PITCH = 60;
const PITCH_TOGGLE_THRESHOLD = 1;

export function useMapCamera(
  mapRef: React.RefObject<import("mapbox-gl").Map | null>,
  rows: Standard1Row[],
  isMapReady: boolean,
) {
  const featureCollection = useMemo(() => buildStandard1FeatureCollection(rows), [rows]);
  const [is3D, setIs3D] = useState(false);
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) {
      setIs3D(false);
      setBearing(0);
      return;
    }

    const map = mapRef.current;

    const syncCameraState = () => {
      const nextIs3D = map.getPitch() > PITCH_TOGGLE_THRESHOLD;
      const nextBearing = map.getBearing();

      setIs3D((previous) => (previous === nextIs3D ? previous : nextIs3D));
      setBearing((previous) => (Math.abs(previous - nextBearing) < 0.1 ? previous : nextBearing));
    };

    syncCameraState();
    map.on("move", syncCameraState);

    return () => {
      map.off("move", syncCameraState);
    };
  }, [isMapReady, mapRef]);

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

  const onResetNorth = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      duration: 450,
    });
  }, [mapRef]);

  const onToggle3D = useCallback(() => {
    if (!mapRef.current) return;

    const currentPitch = mapRef.current.getPitch();
    const targetPitch = currentPitch <= PITCH_TOGGLE_THRESHOLD ? THREE_D_PITCH : 0;

    mapRef.current.easeTo({
      pitch: targetPitch,
      duration: 450,
      essential: true,
    });
  }, [mapRef]);

  return { onZoomIn, onZoomOut, onResetView, onFlyTo, onResetNorth, onToggle3D, is3D, bearing };
}
