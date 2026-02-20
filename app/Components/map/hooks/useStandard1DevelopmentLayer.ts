"use client";

import { useEffect, useMemo } from "react";

import { buildStandard1FeatureCollection, type Standard1Row } from "@/app/data/standard1";

import {
  removeStandard1Layer,
  upsertStandard1Layer,
} from "../layers/standard1LayerManager";
import { getFeatureCollectionBounds, getRowBounds, isPointBounds } from "../services/extent";

export function useStandard1DevelopmentLayer(
  mapRef: React.RefObject<import("mapbox-gl").Map | null>,
  isMapReady: boolean,
  styleRevision: number,
  rows: Standard1Row[],
  selectedRow: Standard1Row | null,
  selectedRowTrigger: number,
) {
  const featureCollection = useMemo(
    () => buildStandard1FeatureCollection(rows),
    [rows],
  );

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    upsertStandard1Layer(mapRef.current, featureCollection);

    return () => {
      if (!mapRef.current) return;
      removeStandard1Layer(mapRef.current);
    };
  }, [featureCollection, isMapReady, mapRef, styleRevision]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const bounds = getFeatureCollectionBounds(featureCollection);

    if (bounds) {
      if (isPointBounds(bounds)) {
        const [[lng, lat]] = bounds as [[number, number], [number, number]];
        mapRef.current.easeTo({
          center: [lng, lat],
          zoom: 11,
          duration: 450,
        });
      } else {
        mapRef.current.fitBounds(bounds, {
          padding: 64,
          maxZoom: 12,
          duration: 450,
        });
      }
    }

  }, [featureCollection, isMapReady, mapRef]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !selectedRow) return;

    const bounds = getRowBounds(selectedRow);
    if (!bounds) return;

    if (isPointBounds(bounds)) {
      const [[lng, lat]] = bounds as [[number, number], [number, number]];
      mapRef.current.easeTo({
        center: [lng, lat],
        zoom: 13,
        duration: 700,
      });
      return;
    }

    mapRef.current.fitBounds(bounds, {
      padding: 96,
      maxZoom: 14,
      duration: 700,
    });
  }, [isMapReady, mapRef, selectedRow, selectedRowTrigger]);
}
