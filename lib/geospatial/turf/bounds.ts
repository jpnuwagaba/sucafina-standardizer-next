import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import buffer from "@turf/buffer";
import { feature, point } from "@turf/helpers";
import type { FeatureCollection, Geometry } from "geojson";

export type BoundingBox = [[number, number], [number, number]];

function toBoundingBox(rawBbox: number[]): BoundingBox | null {
  if (rawBbox.length !== 4) return null;

  const [minLng, minLat, maxLng, maxLat] = rawBbox;
  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function getBoundsFromGeometry(geometry: Geometry): BoundingBox | null {
  return toBoundingBox(bbox(feature(geometry)));
}

export function getBoundsFromFeatureCollection(
  collection: FeatureCollection,
): BoundingBox | null {
  if (collection.features.length === 0) return null;
  return toBoundingBox(bbox(collection));
}

export function isPointBounds(bounds: BoundingBox): boolean {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return minLng === maxLng && minLat === maxLat;
}

export function expandPointBounds(bounds: BoundingBox, radiusMeters: number): BoundingBox {
  const [[lng, lat]] = bounds;
  const expanded = buffer(point([lng, lat]), radiusMeters, { units: "meters" });
  if (!expanded) return bounds;

  return toBoundingBox(bbox(expanded)) ?? bounds;
}

export function expandBounds(bounds: BoundingBox, marginMeters: number): BoundingBox {
  const flatBounds = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]] as [
    number,
    number,
    number,
    number,
  ];
  const expanded = buffer(bboxPolygon(flatBounds), marginMeters, { units: "meters" });
  if (!expanded) return bounds;

  return toBoundingBox(bbox(expanded)) ?? bounds;
}
