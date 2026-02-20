import type { LngLatBoundsLike } from "mapbox-gl";

import type { Standard1FeatureCollection, Standard1Row } from "@/app/data/standard1";
import { getBoundsFromGeometry, parseWktGeometry } from "@/lib/geospatial/wkt";

export function getFeatureCollectionBounds(
  featureCollection: Standard1FeatureCollection,
): LngLatBoundsLike | null {
  if (featureCollection.features.length === 0) {
    return null;
  }

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const feature of featureCollection.features) {
    const featureBounds = getBoundsFromGeometry(feature.geometry);
    if (!featureBounds) continue;

    const [[featureMinLng, featureMinLat], [featureMaxLng, featureMaxLat]] = featureBounds as [
      [number, number],
      [number, number],
    ];
    minLng = Math.min(minLng, featureMinLng);
    minLat = Math.min(minLat, featureMinLat);
    maxLng = Math.max(maxLng, featureMaxLng);
    maxLat = Math.max(maxLat, featureMaxLat);
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function isPointBounds(bounds: LngLatBoundsLike): boolean {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds as [
    [number, number],
    [number, number],
  ];
  return minLng === maxLng && minLat === maxLat;
}

export function getRowBounds(row: Standard1Row): LngLatBoundsLike | null {
  const geometry = parseWktGeometry(row.plot_wkt);
  if (!geometry) return null;
  return getBoundsFromGeometry(geometry);
}
