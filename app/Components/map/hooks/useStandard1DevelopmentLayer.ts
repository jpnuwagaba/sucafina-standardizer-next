"use client";

import { useEffect, useMemo } from "react";

import { buildStandard1FeatureCollection, type Standard1Row } from "@/app/data/standard1";

import {
  removeStandard1Layer,
  upsertStandard1Layer,
  updateStandard1LayerColors,
} from "../layers/standard1LayerManager";
import {
  getFeatureCollectionBounds,
  getRowBounds,
  isPointBounds,
  normalizeBounds,
} from "../services/extent";
import { expandBounds, expandPointBounds } from "@/lib/geospatial/turf/bounds";

const POINT_RADIUS_METERS = 30;
const NON_POINT_BREATHING_SPACE_METERS = 5;

function buildCameraBounds(bounds: import("mapbox-gl").LngLatBoundsLike): [[number, number], [number, number]] {
  const normalized = normalizeBounds(bounds);

  if (isPointBounds(bounds)) {
    return expandPointBounds(normalized, POINT_RADIUS_METERS);
  }

  return expandBounds(normalized, NON_POINT_BREATHING_SPACE_METERS);
}

export function useStandard1DevelopmentLayer(
  mapRef: React.RefObject<import("mapbox-gl").Map | null>,
  isMapReady: boolean,
  styleRevision: number,
  rows: Standard1Row[],
  filteredPlotIds: string[],
  selectedRow: Standard1Row | null,
  selectedRowTrigger: number,
) {
  const featureCollection = useMemo(
    () => buildStandard1FeatureCollection(rows),
    [rows],
  );
  const extentRows = useMemo(() => {
    if (filteredPlotIds.length === 0) return rows;

    const filteredSet = new Set(filteredPlotIds);
    return rows.filter((row) => filteredSet.has(row.sucafina_plot_id));
  }, [filteredPlotIds, rows]);
  const extentFeatureCollection = useMemo(
    () => buildStandard1FeatureCollection(extentRows),
    [extentRows],
  );
  const selectedPlotId = selectedRow?.sucafina_plot_id ?? null;

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    upsertStandard1Layer(
      mapRef.current,
      featureCollection,
      [],
      null,
    );

    return () => {
      if (!mapRef.current) return;
      removeStandard1Layer(mapRef.current);
    };
  }, [featureCollection, isMapReady, mapRef, styleRevision]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    updateStandard1LayerColors(
      mapRef.current,
      filteredPlotIds,
      selectedPlotId,
    );
  }, [filteredPlotIds, isMapReady, mapRef, selectedPlotId]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const bounds = getFeatureCollectionBounds(extentFeatureCollection);
    if (!bounds) return;

    mapRef.current.fitBounds(buildCameraBounds(bounds), {
      padding: 20,
      maxZoom: 18,
      duration: 500,
    });
  }, [extentFeatureCollection, isMapReady, mapRef]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !selectedRow) return;

    const bounds = getRowBounds(selectedRow);
    if (!bounds) return;

    mapRef.current.fitBounds(buildCameraBounds(bounds), {
      padding: 20,
      maxZoom: 18,
      duration: 650,
    });
  }, [isMapReady, mapRef, selectedRow, selectedRowTrigger]);
}
