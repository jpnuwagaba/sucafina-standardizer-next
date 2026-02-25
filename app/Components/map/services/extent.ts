import type { LngLatBoundsLike } from "mapbox-gl";

import type { Standard1FeatureCollection, Standard1Row } from "@/app/data/standard1";
import {
  getBoundsFromFeatureCollection,
  getBoundsFromGeometry,
  isPointBounds as isPointBoundingBox,
  type BoundingBox,
} from "@/lib/geospatial/turf/bounds";
import { parseWktGeometry } from "@/lib/geospatial/wkt";

export function getFeatureCollectionBounds(
  featureCollection: Standard1FeatureCollection,
): LngLatBoundsLike | null {
  return getBoundsFromFeatureCollection(featureCollection);
}

export function getRowBounds(row: Standard1Row): LngLatBoundsLike | null {
  const geometry = parseWktGeometry(row.plot_wkt);
  if (!geometry) return null;
  return getBoundsFromGeometry(geometry);
}

export function normalizeBounds(bounds: LngLatBoundsLike): BoundingBox {
  const [[rawMinLng, rawMinLat], [rawMaxLng, rawMaxLat]] = bounds as [
    [number, number],
    [number, number],
  ];

  return [
    [Math.min(rawMinLng, rawMaxLng), Math.min(rawMinLat, rawMaxLat)],
    [Math.max(rawMinLng, rawMaxLng), Math.max(rawMinLat, rawMaxLat)],
  ];
}

export function isPointBounds(bounds: LngLatBoundsLike): boolean {
  return isPointBoundingBox(normalizeBounds(bounds));
}
