import type { LngLatBoundsLike } from "mapbox-gl";

export type ParsedWktGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

function splitTopLevel(input: string): string[] {
  const segments: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (char === "," && depth === 0) {
      segments.push(input.slice(start, index).trim());
      start = index + 1;
    }
  }

  segments.push(input.slice(start).trim());
  return segments.filter(Boolean);
}

function stripOuterParens(value: string): string | null {
  const text = value.trim();
  if (!text.startsWith("(") || !text.endsWith(")")) return null;
  return text.slice(1, -1).trim();
}

function parseCoordinatePair(pair: string): [number, number] | null {
  const [lngText, latText] = pair.trim().split(/\s+/);
  const lng = Number(lngText);
  const lat = Number(latText);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

function parseLinearRing(ringText: string): [number, number][] | null {
  const ringContent = stripOuterParens(ringText);
  if (!ringContent) return null;

  const ring = ringContent
    .split(",")
    .map((pair) => parseCoordinatePair(pair))
    .filter((coordinate): coordinate is [number, number] => coordinate !== null);

  return ring.length > 0 ? ring : null;
}

function parsePolygonCoordinates(polygonText: string): [number, number][][] | null {
  const ringTexts = splitTopLevel(polygonText);
  if (ringTexts.length === 0) return null;

  const rings = ringTexts
    .map((ringText) => parseLinearRing(ringText))
    .filter((ring): ring is [number, number][] => ring !== null);

  return rings.length > 0 ? rings : null;
}

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

  const polygonMatch = value.match(/^POLYGON\s*\(([\s\S]+)\)\s*$/i);
  if (polygonMatch) {
    const rings = parsePolygonCoordinates(polygonMatch[1]);
    if (!rings) return null;
    return { type: "Polygon", coordinates: rings };
  }

  const multiPolygonMatch = value.match(/^MULTIPOLYGON\s*\(([\s\S]+)\)\s*$/i);
  if (multiPolygonMatch) {
    const polygonTexts = splitTopLevel(multiPolygonMatch[1]);
    if (polygonTexts.length === 0) return null;

    const polygons = polygonTexts
      .map((polygonText) => {
        const polygonContent = stripOuterParens(polygonText);
        if (!polygonContent) return null;
        return parsePolygonCoordinates(polygonContent);
      })
      .filter((polygon): polygon is [number, number][][] => polygon !== null);

    if (polygons.length === 0) return null;
    return { type: "MultiPolygon", coordinates: polygons };
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
  } else if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      for (const [lng, lat] of ring) {
        updateBounds(lng, lat);
      }
    }
  } else {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          updateBounds(lng, lat);
        }
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
