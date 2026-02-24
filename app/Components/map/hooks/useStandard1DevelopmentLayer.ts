"use client";

import { useEffect, useMemo } from "react";

import { buildStandard1FeatureCollection, type Standard1Row } from "@/app/data/standard1";

import {
  removeStandard1Layer,
  upsertStandard1Layer,
  updateStandard1LayerColors,
} from "../layers/standard1LayerManager";
import { getFeatureCollectionBounds, getRowBounds, isPointBounds } from "../services/extent";

const METERS_PER_DEGREE_LAT = 111_320;
const POINT_RADIUS_METERS = 30;
const NON_POINT_BREATHING_SPACE_METERS = 5;

function metersToLatitudeDegrees(meters: number): number {
  return meters / METERS_PER_DEGREE_LAT;
}

function metersToLongitudeDegrees(meters: number, latitude: number): number {
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);
  if (!Number.isFinite(metersPerDegreeLng) || Math.abs(metersPerDegreeLng) < 1e-6) {
    return 0;
  }
  return meters / metersPerDegreeLng;
}

function normalizeBounds(bounds: import("mapbox-gl").LngLatBoundsLike): [[number, number], [number, number]] {
  const [[rawMinLng, rawMinLat], [rawMaxLng, rawMaxLat]] = bounds as [
    [number, number],
    [number, number],
  ];

  return [
    [Math.min(rawMinLng, rawMaxLng), Math.min(rawMinLat, rawMaxLat)],
    [Math.max(rawMinLng, rawMaxLng), Math.max(rawMinLat, rawMaxLat)],
  ];
}

function buildCameraBounds(bounds: import("mapbox-gl").LngLatBoundsLike): [[number, number], [number, number]] {
  const [[minLng, minLat], [maxLng, maxLat]] = normalizeBounds(bounds);

  if (isPointBounds(bounds)) {
    const pointLatDelta = metersToLatitudeDegrees(POINT_RADIUS_METERS);
    const pointLngDelta = metersToLongitudeDegrees(POINT_RADIUS_METERS, minLat);
    return [
      [minLng - pointLngDelta, minLat - pointLatDelta],
      [minLng + pointLngDelta, minLat + pointLatDelta],
    ];
  }

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  const metersPerDegreeLngAtCenter = METERS_PER_DEGREE_LAT * Math.cos((centerLat * Math.PI) / 180);
  const lngSpanMeters = (maxLng - minLng) * Math.max(Math.abs(metersPerDegreeLngAtCenter), 1e-6);
  const latSpanMeters = (maxLat - minLat) * METERS_PER_DEGREE_LAT;
  const halfSquareSizeMeters =
    Math.max(lngSpanMeters, latSpanMeters) / 2 + NON_POINT_BREATHING_SPACE_METERS;
  const latDelta = metersToLatitudeDegrees(halfSquareSizeMeters);
  const lngDelta = metersToLongitudeDegrees(halfSquareSizeMeters, centerLat);

  return [
    [centerLng - lngDelta, centerLat - latDelta],
    [centerLng + lngDelta, centerLat + latDelta],
  ];
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
