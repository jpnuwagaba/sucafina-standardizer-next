import type { LngLatBoundsLike } from "mapbox-gl";

export type ParsedWktGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "Polygon"; coordinates: [number, number][][] };

export function parseWktGeometry(wkt: string): ParsedWktGeometry | null {
  const value = wkt.trim();
  if (!value) return null;

  const pointMatch = value.match(/^POINT\s*\(\s*([^)]+)\s*\)$/i);
  if (pointMatch) {
    const coordinateText = pointMatch[1].trim();
    const [lngText, latText] = coordinateText.split(/\s+/);
    const lng = Number(lngText);
    const lat = Number(latText);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return { type: "Point", coordinates: [lng, lat] };
  }

  const polygonMatch = value.match(/^POLYGON\s*\(\s*\(([\s\S]+)\)\s*\)$/i);
  if (polygonMatch) {
    const ringSection = polygonMatch[1].trim();
    const rings = ringSection
      .split(/\)\s*,\s*\(/)
      .map((ringText) =>
        ringText
          .split(",")
          .map((pair) => pair.trim())
          .filter(Boolean)
          .map<[number, number] | null>((pair) => {
            const [lngText, latText] = pair.split(/\s+/);
            const lng = Number(lngText);
            const lat = Number(latText);
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
            return [lng, lat];
          })
          .filter((coordinate): coordinate is [number, number] => coordinate !== null),
      )
      .filter((ring) => ring.length > 0);

    if (rings.length === 0) return null;
    return { type: "Polygon", coordinates: rings };
  }

  return null;
}

export function getBoundsFromGeometry(
  geometry: ParsedWktGeometry,
): LngLatBoundsLike | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const updateBounds = (lng: number, lat: number) => {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  };

  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    updateBounds(lng, lat);
  } else {
    for (const ring of geometry.coordinates) {
      for (const [lng, lat] of ring) {
        updateBounds(lng, lat);
      }
    }
  }

  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) {
    return null;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
