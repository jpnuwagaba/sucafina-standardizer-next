import type { Feature } from "geojson";

import type { Standard1Row } from "@/app/data/standard1";
import { parseWktGeometry, type ParsedWktGeometry } from "@/lib/geospatial/wkt";

export const STANDARD1_COLUMNS = [
  "sucafina_plot_id",
  "supplier_plot_id",
  "farmer_id",
  "supplier_code",
  "plot_region",
  "plot_district",
  "plot_area_ha",
  "plot_longitude",
  "plot_latitude",
  "plot_gps_point",
  "plot_gps_polygon",
  "plot_wkt",
  "is_geodata_validated",
  "is_cafe_practices_certified",
  "is_rfa_utz_certified",
  "is_impact_certified",
  "is_organic_certified",
  "is_4c_certified",
  "is_fairtrade_certified",
  "other_certification_name",
  "plot_supply_chain",
  "plot_farmer_group",
] as const;

type Standard1Column = (typeof STANDARD1_COLUMNS)[number];

export type UploadedTable = {
  columns: string[];
  rows: string[][];
};

export type UploadedCsvTable = UploadedTable;

type ParseOk = {
  ok: true;
  rows: Standard1Row[];
  table: UploadedTable;
};

type ParseError = {
  ok: false;
  reason: string;
};

export type Standard1FileParseResult = ParseOk | ParseError;
export type Standard1CsvParseResult = Standard1FileParseResult;

type GeometryCandidate = {
  value: string;
  geometry: ParsedWktGeometry;
};

type SupportedGeometry = ParsedWktGeometry;
type PropertyBag = Record<string, unknown>;

type FlatGeometryRecord = {
  geometry: SupportedGeometry;
  properties: PropertyBag;
  sourceId?: string | number | null;
};

const SUPPORTED_FILE_SUFFIXES = [".csv", ".geojson", ".json", ".kml"] as const;
const KML_GEOMETRY_TAGS = new Set(["Point", "LineString", "Polygon", "MultiGeometry"]);

export async function parseStandard1File(file: File): Promise<Standard1FileParseResult> {
  const fileName = file.name.trim();
  const extension = getFileExtension(fileName);

  if (!extension || !SUPPORTED_FILE_SUFFIXES.includes(extension as (typeof SUPPORTED_FILE_SUFFIXES)[number])) {
    return {
      ok: false,
      reason: "Supported formats are CSV, GeoJSON, JSON, and KML.",
    };
  }

  if (extension === ".csv") {
    return parseCsvFile(file);
  }

  if (extension === ".geojson" || extension === ".json") {
    return parseJsonLikeFile(file, extension);
  }

  return parseKmlFile(file);
}

export async function parseStandard1CsvFile(file: File): Promise<Standard1FileParseResult> {
  return parseStandard1File(file);
}

async function parseCsvFile(file: File): Promise<Standard1FileParseResult> {
  const text = await file.text();
  const matrix = parseCsv(text);

  if (matrix.length === 0) {
    return { ok: false, reason: "CSV file is empty." };
  }

  const header = matrix[0].map((cell) => sanitizeHeaderCell(cell));
  const dataRows = matrix
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim().length > 0));
  const tableRows = dataRows.map((row) => header.map((_, index) => row[index] ?? ""));
  const geometryColumnIndexes = findGeometryColumnIndexes(dataRows);

  if (geometryColumnIndexes.length === 0) {
    return {
      ok: false,
      reason: "CSV must include at least one column containing WKT geometry values.",
    };
  }

  return {
    ok: true,
    rows: buildRowsFromCsvDataRows(dataRows, header, geometryColumnIndexes),
    table: {
      columns: header,
      rows: tableRows,
    },
  };
}

async function parseJsonLikeFile(
  file: File,
  extension: ".geojson" | ".json",
): Promise<Standard1FileParseResult> {
  const text = await file.text();

  if (text.trim().length === 0) {
    return {
      ok: false,
      reason: `${extension === ".geojson" ? "GeoJSON" : "JSON"} file is empty.`,
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ok: false,
      reason: `${extension === ".geojson" ? "GeoJSON" : "JSON"} file could not be parsed.`,
    };
  }

  const records = extractRecordsFromJsonValue(parsed);
  if (records.length === 0) {
    return {
      ok: false,
      reason:
        "JSON data must contain GeoJSON features or records with supported geometry values.",
    };
  }

  return buildRowsAndTableFromGeometryRecords(records);
}

async function parseKmlFile(file: File): Promise<Standard1FileParseResult> {
  const text = await file.text();

  if (text.trim().length === 0) {
    return { ok: false, reason: "KML file is empty." };
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(text, "application/xml");
  if (document.querySelector("parsererror")) {
    return { ok: false, reason: "KML file could not be parsed." };
  }

  const placemarks = getDescendantElementsByLocalName(document.documentElement, "Placemark");
  const records: FlatGeometryRecord[] = [];

  for (const placemark of placemarks) {
    const placemarkProperties = extractKmlPlacemarkProperties(placemark);
    const geometries = extractKmlGeometries(placemark);
    const placemarkName = toTextValue(placemarkProperties.name);

    geometries.forEach((geometry, geometryIndex) => {
      const sourceId =
        placemark.getAttribute("id") ??
        (placemarkName ? `${placemarkName}-${geometryIndex + 1}` : null);

      records.push({
        geometry,
        properties: placemarkProperties,
        sourceId,
      });
    });
  }

  if (records.length === 0) {
    return {
      ok: false,
      reason: "KML must contain at least one Point, LineString, or Polygon placemark.",
    };
  }

  return buildRowsAndTableFromGeometryRecords(records);
}

function buildRowsFromCsvDataRows(
  dataRows: string[][],
  header: string[],
  geometryColumnIndexes: number[],
): Standard1Row[] {
  const headerIndexByName = buildHeaderIndexByName(header);
  const parsedRows: Standard1Row[] = [];
  const usedPlotIds = new Set<string>();

  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
    const row = dataRows[rowIndex];

    const getValue = (column: Standard1Column): string => {
      const index = headerIndexByName.get(column);
      if (index === undefined) return "";
      return (row[index] ?? "").trim();
    };

    const rowGeometryCandidates = collectRowGeometryCandidates(row, geometryColumnIndexes);
    const preferredGeometry = resolvePreferredGeometryCandidate(rowGeometryCandidates);
    const preferredPoint = rowGeometryCandidates.find((candidate) => candidate.geometry.type === "Point");
    const preferredAreaGeometry = rowGeometryCandidates.find(
      (candidate) =>
        candidate.geometry.type === "Polygon" || candidate.geometry.type === "MultiPolygon",
    );

    const plotGpsPoint = getValue("plot_gps_point") || preferredPoint?.value || "";
    const plotGpsPolygon = getValue("plot_gps_polygon") || preferredAreaGeometry?.value || "";
    const rawPlotWkt = getValue("plot_wkt");
    const sucafinaPlotId = resolveUniquePlotId(getValue("sucafina_plot_id"), rowIndex, usedPlotIds);

    parsedRows.push({
      sucafina_plot_id: sucafinaPlotId,
      supplier_plot_id: getValue("supplier_plot_id"),
      farmer_id: getValue("farmer_id"),
      supplier_code: getValue("supplier_code"),
      plot_region: getValue("plot_region"),
      plot_district: getValue("plot_district"),
      plot_area_ha: parseNullableNumber(getValue("plot_area_ha")),
      plot_longitude: parseNullableNumber(getValue("plot_longitude")),
      plot_latitude: parseNullableNumber(getValue("plot_latitude")),
      plot_gps_point: plotGpsPoint,
      plot_gps_polygon: plotGpsPolygon,
      plot_wkt: preferredGeometry?.value || rawPlotWkt || plotGpsPolygon || plotGpsPoint,
      is_geodata_validated: parseNullableBoolean(getValue("is_geodata_validated")),
      is_cafe_practices_certified: parseNullableBoolean(getValue("is_cafe_practices_certified")),
      is_rfa_utz_certified: parseNullableBoolean(getValue("is_rfa_utz_certified")),
      is_impact_certified: parseNullableBoolean(getValue("is_impact_certified")),
      is_organic_certified: parseNullableBoolean(getValue("is_organic_certified")),
      is_4c_certified: parseNullableBoolean(getValue("is_4c_certified")),
      is_fairtrade_certified: parseNullableBoolean(getValue("is_fairtrade_certified")),
      other_certification_name: getValue("other_certification_name"),
      plot_supply_chain: getValue("plot_supply_chain"),
      plot_farmer_group: getValue("plot_farmer_group"),
    });
  }

  return parsedRows;
}

function buildRowsAndTableFromGeometryRecords(
  records: FlatGeometryRecord[],
): Standard1FileParseResult {
  const rows: Standard1Row[] = [];
  const tableColumns: string[] = [];
  const tableRecords: PropertyBag[] = [];
  const usedPlotIds = new Set<string>();

  for (let recordIndex = 0; recordIndex < records.length; recordIndex += 1) {
    const record = records[recordIndex];
    const row = buildRowFromGeometryRecord(record, recordIndex, usedPlotIds);
    rows.push(row);

    const tableRecord = {
      sucafina_plot_id: row.sucafina_plot_id,
      ...record.properties,
      geometry_type: record.geometry.type,
      plot_wkt: row.plot_wkt,
    };

    Object.keys(tableRecord).forEach((column) => {
      if (!column || tableColumns.includes(column)) return;
      tableColumns.push(column);
    });

    tableRecords.push(tableRecord);
  }

  return {
    ok: true,
    rows,
    table: {
      columns: tableColumns,
      rows: tableRecords.map((tableRecord) =>
        tableColumns.map((column) => serializeTableCellValue(tableRecord[column])),
      ),
    },
  };
}

function buildRowFromGeometryRecord(
  record: FlatGeometryRecord,
  rowIndex: number,
  usedPlotIds: Set<string>,
): Standard1Row {
  const propertyLookup = buildPropertyLookupFromObject(record.properties);
  const geometryWkt = geometryToWkt(record.geometry);
  const geometryPoint = record.geometry.type === "Point" ? record.geometry.coordinates : null;
  const rawPlotId =
    getTextPropertyValue(propertyLookup, [
      "sucafina_plot_id",
      "plot_id",
      "supplier_plot_id",
      "farmer_id",
      "name",
      "title",
      "id",
    ]) ||
    toTextValue(record.sourceId);
  const sucafinaPlotId = resolveUniquePlotId(rawPlotId, rowIndex, usedPlotIds);

  return {
    sucafina_plot_id: sucafinaPlotId,
    supplier_plot_id: getTextPropertyValue(propertyLookup, ["supplier_plot_id"]),
    farmer_id: getTextPropertyValue(propertyLookup, ["farmer_id"]),
    supplier_code: getTextPropertyValue(propertyLookup, ["supplier_code"]),
    plot_region: getTextPropertyValue(propertyLookup, ["plot_region", "region"]),
    plot_district: getTextPropertyValue(propertyLookup, ["plot_district", "district"]),
    plot_area_ha: parseNullableNumberFromUnknown(
      getFirstPropertyValue(propertyLookup, ["plot_area_ha", "area_ha", "area"]),
    ),
    plot_longitude:
      parseNullableNumberFromUnknown(
        getFirstPropertyValue(propertyLookup, ["plot_longitude", "longitude", "lng", "lon"]),
      ) ?? geometryPoint?.[0] ?? null,
    plot_latitude:
      parseNullableNumberFromUnknown(
        getFirstPropertyValue(propertyLookup, ["plot_latitude", "latitude", "lat"]),
      ) ?? geometryPoint?.[1] ?? null,
    plot_gps_point:
      getTextPropertyValue(propertyLookup, ["plot_gps_point"]) ||
      (record.geometry.type === "Point" ? geometryWkt : ""),
    plot_gps_polygon:
      getTextPropertyValue(propertyLookup, ["plot_gps_polygon"]) ||
      (record.geometry.type === "Polygon" || record.geometry.type === "MultiPolygon" ? geometryWkt : ""),
    plot_wkt:
      getTextPropertyValue(propertyLookup, ["plot_wkt", "wkt", "geometry_wkt"]) || geometryWkt,
    is_geodata_validated: parseNullableBooleanFromUnknown(
      getFirstPropertyValue(propertyLookup, ["is_geodata_validated", "geodata_validated"]),
    ),
    is_cafe_practices_certified: parseNullableBooleanFromUnknown(
      getFirstPropertyValue(propertyLookup, ["is_cafe_practices_certified"]),
    ),
    is_rfa_utz_certified: parseNullableBooleanFromUnknown(
      getFirstPropertyValue(propertyLookup, ["is_rfa_utz_certified"]),
    ),
    is_impact_certified: parseNullableBooleanFromUnknown(
      getFirstPropertyValue(propertyLookup, ["is_impact_certified"]),
    ),
    is_organic_certified: parseNullableBooleanFromUnknown(
      getFirstPropertyValue(propertyLookup, ["is_organic_certified"]),
    ),
    is_4c_certified: parseNullableBooleanFromUnknown(
      getFirstPropertyValue(propertyLookup, ["is_4c_certified"]),
    ),
    is_fairtrade_certified: parseNullableBooleanFromUnknown(
      getFirstPropertyValue(propertyLookup, ["is_fairtrade_certified"]),
    ),
    other_certification_name: getTextPropertyValue(propertyLookup, ["other_certification_name"]),
    plot_supply_chain: getTextPropertyValue(propertyLookup, ["plot_supply_chain", "supply_chain"]),
    plot_farmer_group: getTextPropertyValue(propertyLookup, ["plot_farmer_group", "farmer_group"]),
  };
}

function extractRecordsFromJsonValue(value: unknown): FlatGeometryRecord[] {
  if (isFeatureCollectionLike(value)) {
    return value.features.flatMap((feature) => extractRecordsFromGeoJsonFeature(feature));
  }

  if (isFeatureLike(value)) {
    return extractRecordsFromGeoJsonFeature(value);
  }

  const normalizedGeometry = normalizeSupportedGeometries(value);
  if (normalizedGeometry.length > 0) {
    return normalizedGeometry.map((geometry) => ({
      geometry,
      properties: {},
    }));
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractRecordsFromJsonArrayItem(item));
  }

  if (!isPlainObject(value)) {
    return [];
  }

  const nestedArray = findJsonRecordArray(value);
  if (nestedArray) {
    return nestedArray.flatMap((item) => extractRecordsFromJsonArrayItem(item));
  }

  return extractRecordsFromJsonRecord(value);
}

function extractRecordsFromJsonArrayItem(value: unknown): FlatGeometryRecord[] {
  if (isFeatureLike(value)) {
    return extractRecordsFromGeoJsonFeature(value);
  }

  const normalizedGeometry = normalizeSupportedGeometries(value);
  if (normalizedGeometry.length > 0) {
    return normalizedGeometry.map((geometry) => ({
      geometry,
      properties: {},
    }));
  }

  if (!isPlainObject(value)) {
    return [];
  }

  return extractRecordsFromJsonRecord(value);
}

function extractRecordsFromJsonRecord(record: PropertyBag): FlatGeometryRecord[] {
  const geometryEntries = collectGeometryEntriesFromJsonRecord(record);
  if (geometryEntries.length === 0) return [];

  const properties = sanitizeJsonRecordProperties(record, geometryEntries.map((entry) => entry.key));

  return geometryEntries.flatMap((entry) =>
    entry.geometries.map((geometry) => ({
      geometry,
      properties,
      sourceId: resolveJsonRecordSourceId(record),
    })),
  );
}

function extractRecordsFromGeoJsonFeature(feature: Feature): FlatGeometryRecord[] {
  const geometries = normalizeSupportedGeometries(feature.geometry);
  if (geometries.length === 0) return [];

  const properties = isPlainObject(feature.properties) ? feature.properties : {};

  return geometries.map((geometry) => ({
    geometry,
    properties,
    sourceId: feature.id ?? null,
  }));
}

function collectGeometryEntriesFromJsonRecord(record: PropertyBag): Array<{
  key: string;
  geometries: SupportedGeometry[];
}> {
  for (const [key, value] of Object.entries(record)) {
    if (!value) continue;

    const normalizedKey = normalizeColumnName(key);
    if (normalizedKey !== "geometry" && normalizedKey !== "geom") {
      continue;
    }

    const geometries = normalizeSupportedGeometries(value).concat(
      extractWktGeometriesFromUnknown(value),
    );

    if (geometries.length > 0) {
      return [{ key, geometries }];
    }
  }

  const wktCandidates = Object.entries(record)
    .map(([key, value]) => {
      if (!value) return null;

      const normalizedKey = normalizeColumnName(key);
      if (
        ![
          "plot_wkt",
          "wkt",
          "geometry_wkt",
          "plot_gps_point",
          "plot_gps_polygon",
        ].includes(normalizedKey)
      ) {
        return null;
      }

      const geometry = extractWktGeometriesFromUnknown(value)[0] ?? null;
      return geometry ? { key, geometry } : null;
    })
    .filter((candidate): candidate is { key: string; geometry: SupportedGeometry } => candidate !== null);

  if (wktCandidates.length > 0) {
    const preferredCandidate = wktCandidates.reduce((bestCandidate, candidate) =>
      getGeometryPriority(candidate.geometry) < getGeometryPriority(bestCandidate.geometry)
        ? candidate
        : bestCandidate,
    );

    return [{ key: preferredCandidate.key, geometries: [preferredCandidate.geometry] }];
  }

  const pointGeometry = extractPointGeometryFromRecord(record);
  if (pointGeometry) {
    return [{ key: "__derived_point__", geometries: [pointGeometry] }];
  }

  return [];
}

function getGeometryPriority(geometry: SupportedGeometry): number {
  switch (geometry.type) {
    case "MultiPolygon":
      return 0;
    case "Polygon":
      return 1;
    case "MultiLineString":
      return 2;
    case "LineString":
      return 3;
    case "Point":
      return 4;
  }
}

function sanitizeJsonRecordProperties(record: PropertyBag, geometryKeys: string[]): PropertyBag {
  const skippedKeys = new Set(geometryKeys);
  const sanitizedEntries = Object.entries(record).filter(([key]) => !skippedKeys.has(key));
  return Object.fromEntries(sanitizedEntries);
}

function findJsonRecordArray(value: PropertyBag): unknown[] | null {
  const commonArrayKeys = ["records", "rows", "items", "data"];

  for (const key of commonArrayKeys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate;
  }

  const arrayEntries = Object.values(value).filter(Array.isArray);
  if (arrayEntries.length === 1) {
    return arrayEntries[0];
  }

  return null;
}

function resolveJsonRecordSourceId(record: PropertyBag): string | number | null {
  const propertyLookup = buildPropertyLookupFromObject(record);
  return (
    getTextPropertyValue(propertyLookup, [
      "sucafina_plot_id",
      "plot_id",
      "supplier_plot_id",
      "name",
      "title",
      "id",
    ]) || null
  );
}

function extractPointGeometryFromRecord(record: PropertyBag): SupportedGeometry | null {
  const propertyLookup = buildPropertyLookupFromObject(record);
  const longitude = parseNullableNumberFromUnknown(
    getFirstPropertyValue(propertyLookup, ["plot_longitude", "longitude", "lng", "lon", "x"]),
  );
  const latitude = parseNullableNumberFromUnknown(
    getFirstPropertyValue(propertyLookup, ["plot_latitude", "latitude", "lat", "y"]),
  );

  if (longitude === null || latitude === null) {
    return null;
  }

  return {
    type: "Point",
    coordinates: [longitude, latitude],
  };
}

function normalizeSupportedGeometries(value: unknown): SupportedGeometry[] {
  if (!isPlainObject(value) || typeof value.type !== "string") {
    return [];
  }

  switch (value.type) {
    case "Point": {
      const coordinates = toCoordinatePair(value.coordinates);
      return coordinates ? [{ type: "Point", coordinates }] : [];
    }
    case "MultiPoint": {
      return toCoordinatePairList(value.coordinates).map((coordinates) => ({
        type: "Point",
        coordinates,
      }));
    }
    case "LineString": {
      const coordinates = toCoordinatePairList(value.coordinates);
      return coordinates.length >= 2 ? [{ type: "LineString", coordinates }] : [];
    }
    case "MultiLineString": {
      const coordinates = toCoordinatePairListCollection(value.coordinates);
      return coordinates.length > 0 ? [{ type: "MultiLineString", coordinates }] : [];
    }
    case "Polygon": {
      const coordinates = toPolygonCoordinates(value.coordinates);
      return coordinates ? [{ type: "Polygon", coordinates }] : [];
    }
    case "MultiPolygon": {
      const coordinates = toMultiPolygonCoordinates(value.coordinates);
      return coordinates ? [{ type: "MultiPolygon", coordinates }] : [];
    }
    case "GeometryCollection":
      return Array.isArray(value.geometries)
        ? value.geometries.flatMap((geometry) => normalizeSupportedGeometries(geometry))
        : [];
    default:
      return [];
  }
}

function extractWktGeometriesFromUnknown(value: unknown): SupportedGeometry[] {
  if (typeof value !== "string") {
    return [];
  }

  const parsedGeometry = parseWktGeometry(value);
  return parsedGeometry ? [parsedGeometry] : [];
}

function extractKmlPlacemarkProperties(placemark: Element): PropertyBag {
  const properties: PropertyBag = {};
  const name = getDirectChildTextContent(placemark, "name");
  const description = getDirectChildTextContent(placemark, "description");

  if (name) properties.name = name;
  if (description) properties.description = description;

  const extendedData = getDirectChildByLocalName(placemark, "ExtendedData");
  if (!extendedData) {
    return properties;
  }

  getDescendantElementsByLocalName(extendedData, "Data").forEach((dataElement) => {
    const key = dataElement.getAttribute("name")?.trim();
    const value =
      getDirectChildTextContent(dataElement, "value") ?? dataElement.textContent?.trim() ?? "";

    if (!key || !value) return;
    properties[key] = value;
  });

  getDescendantElementsByLocalName(extendedData, "SimpleData").forEach((dataElement) => {
    const key = dataElement.getAttribute("name")?.trim();
    const value = dataElement.textContent?.trim() ?? "";

    if (!key || !value) return;
    properties[key] = value;
  });

  return properties;
}

function extractKmlGeometries(root: Element): SupportedGeometry[] {
  const geometries: SupportedGeometry[] = [];

  for (const child of Array.from(root.children)) {
    if (!KML_GEOMETRY_TAGS.has(child.localName)) continue;

    if (child.localName === "Point") {
      const point = parseKmlPoint(child);
      if (point) geometries.push(point);
      continue;
    }

    if (child.localName === "LineString") {
      const lineString = parseKmlLineString(child);
      if (lineString) geometries.push(lineString);
      continue;
    }

    if (child.localName === "Polygon") {
      const polygon = parseKmlPolygon(child);
      if (polygon) geometries.push(polygon);
      continue;
    }

    geometries.push(...extractKmlGeometries(child));
  }

  return geometries;
}

function parseKmlPoint(pointElement: Element): Extract<SupportedGeometry, { type: "Point" }> | null {
  const coordinates = parseKmlCoordinateText(getDirectChildTextContent(pointElement, "coordinates"));
  const point = coordinates[0];
  return point ? { type: "Point", coordinates: point } : null;
}

function parseKmlLineString(
  lineStringElement: Element,
): Extract<SupportedGeometry, { type: "LineString" }> | null {
  const coordinates = parseKmlCoordinateText(
    getDirectChildTextContent(lineStringElement, "coordinates"),
  );

  return coordinates.length >= 2 ? { type: "LineString", coordinates } : null;
}

function parseKmlPolygon(
  polygonElement: Element,
): Extract<SupportedGeometry, { type: "Polygon" }> | null {
  const outerBoundary = getDirectChildByLocalName(polygonElement, "outerBoundaryIs");
  const outerRing = outerBoundary
    ? parseKmlLinearRing(getDescendantElementsByLocalName(outerBoundary, "LinearRing")[0] ?? null)
    : null;

  if (!outerRing) return null;

  const innerRings = getDirectChildrenByLocalName(polygonElement, "innerBoundaryIs")
    .map((innerBoundary) =>
      parseKmlLinearRing(getDescendantElementsByLocalName(innerBoundary, "LinearRing")[0] ?? null),
    )
    .filter((ring): ring is [number, number][] => ring !== null);

  return {
    type: "Polygon",
    coordinates: [outerRing, ...innerRings],
  };
}

function parseKmlLinearRing(linearRingElement: Element | null): [number, number][] | null {
  if (!linearRingElement) return null;

  const coordinates = parseKmlCoordinateText(getDirectChildTextContent(linearRingElement, "coordinates"));
  return coordinates.length > 0 ? closeRingIfNeeded(coordinates) : null;
}

function parseKmlCoordinateText(value: string | null | undefined): [number, number][] {
  if (!value) return [];

  return value
    .trim()
    .split(/\s+/)
    .map((coordinateText) => {
      const [lngText, latText] = coordinateText.split(",");
      const lng = Number(lngText);
      const lat = Number(latText);

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return null;
      }

      return [lng, lat] as [number, number];
    })
    .filter((coordinate): coordinate is [number, number] => coordinate !== null);
}

function geometryToWkt(geometry: SupportedGeometry): string {
  switch (geometry.type) {
    case "Point":
      return `POINT(${formatWktCoordinatePair(geometry.coordinates)})`;
    case "LineString":
      return `LINESTRING(${geometry.coordinates.map(formatWktCoordinatePair).join(",")})`;
    case "MultiLineString":
      return `MULTILINESTRING(${geometry.coordinates
        .map((line) => `(${line.map(formatWktCoordinatePair).join(",")})`)
        .join(",")})`;
    case "Polygon":
      return `POLYGON(${geometry.coordinates
        .map((ring) => `(${ring.map(formatWktCoordinatePair).join(",")})`)
        .join(",")})`;
    case "MultiPolygon":
      return `MULTIPOLYGON(${geometry.coordinates
        .map(
          (polygon) =>
            `(${polygon.map((ring) => `(${ring.map(formatWktCoordinatePair).join(",")})`).join(",")})`,
        )
        .join(",")})`;
  }
}

function formatWktCoordinatePair(coordinates: [number, number]): string {
  return `${coordinates[0]} ${coordinates[1]}`;
}

function serializeTableCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sanitizeHeaderCell(value: string): string {
  return value.replace(/^\uFEFF/, "");
}

function normalizeColumnName(value: string): string {
  return sanitizeHeaderCell(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function buildHeaderIndexByName(header: string[]): Map<string, number> {
  const indexByName = new Map<string, number>();

  header.forEach((column, index) => {
    const normalized = normalizeColumnName(column);
    if (!normalized || indexByName.has(normalized)) return;
    indexByName.set(normalized, index);
  });

  return indexByName;
}

function findGeometryColumnIndexes(rows: string[][]): number[] {
  const geometryColumnIndexes = new Set<number>();

  for (const row of rows) {
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      const value = (row[columnIndex] ?? "").trim();
      if (!value) continue;

      if (parseWktGeometry(value)) {
        geometryColumnIndexes.add(columnIndex);
      }
    }
  }

  return [...geometryColumnIndexes].sort((left, right) => left - right);
}

function collectRowGeometryCandidates(
  row: string[],
  geometryColumnIndexes: number[],
): GeometryCandidate[] {
  const candidates: GeometryCandidate[] = [];

  for (const columnIndex of geometryColumnIndexes) {
    const value = (row[columnIndex] ?? "").trim();
    if (!value) continue;

    const geometry = parseWktGeometry(value);
    if (!geometry) continue;

    candidates.push({ value, geometry });
  }

  return candidates;
}

function resolvePreferredGeometryCandidate(candidates: GeometryCandidate[]): GeometryCandidate | null {
  return (
    candidates.find((candidate) => candidate.geometry.type === "MultiPolygon") ||
    candidates.find((candidate) => candidate.geometry.type === "Polygon") ||
    candidates.find((candidate) => candidate.geometry.type === "MultiLineString") ||
    candidates.find((candidate) => candidate.geometry.type === "LineString") ||
    candidates.find((candidate) => candidate.geometry.type === "Point") ||
    null
  );
}

function resolveUniquePlotId(rawValue: string, rowIndex: number, usedIds: Set<string>): string {
  const fallback = `ROW-${String(rowIndex + 2).padStart(4, "0")}`;
  const base = rawValue.trim() || fallback;

  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }

  let suffix = 2;
  let candidate = `${base}-${suffix}`;

  while (usedIds.has(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  usedIds.add(candidate);
  return candidate;
}

function parseNullableNumber(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;
  const asNumber = Number(normalized);
  if (!Number.isFinite(asNumber)) return null;
  return asNumber;
}

function parseNullableNumberFromUnknown(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    return parseNullableNumber(value);
  }

  return null;
}

function parseNullableBoolean(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return null;
}

function parseNullableBooleanFromUnknown(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return parseNullableBoolean(value);
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
}

function buildPropertyLookupFromObject(value: PropertyBag): Map<string, unknown> {
  const propertyLookup = new Map<string, unknown>();

  Object.entries(value).forEach(([key, propertyValue]) => {
    const normalizedKey = normalizeColumnName(key);
    if (!normalizedKey || propertyLookup.has(normalizedKey)) return;
    propertyLookup.set(normalizedKey, propertyValue);
  });

  return propertyLookup;
}

function getFirstPropertyValue(
  propertyLookup: Map<string, unknown>,
  candidateKeys: string[],
): unknown {
  for (const candidateKey of candidateKeys) {
    const value = propertyLookup.get(normalizeColumnName(candidateKey));
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function getTextPropertyValue(
  propertyLookup: Map<string, unknown>,
  candidateKeys: string[],
): string {
  return toTextValue(getFirstPropertyValue(propertyLookup, candidateKeys));
}

function toTextValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        cell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function getFileExtension(fileName: string): string | null {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return null;
  return fileName.slice(lastDotIndex).toLowerCase();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFeatureLike(value: unknown): value is Feature {
  return isPlainObject(value) && value.type === "Feature";
}

function isFeatureCollectionLike(
  value: unknown,
): value is { type: "FeatureCollection"; features: Feature[] } {
  return isPlainObject(value) && value.type === "FeatureCollection" && Array.isArray(value.features);
}

function toCoordinatePair(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) return null;

  const lng = Number(value[0]);
  const lat = Number(value[1]);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  return [lng, lat];
}

function toCoordinatePairList(value: unknown): [number, number][] {
  if (!Array.isArray(value)) return [];
  return value
    .map((coordinate) => toCoordinatePair(coordinate))
    .filter((coordinate): coordinate is [number, number] => coordinate !== null);
}

function toCoordinatePairListCollection(value: unknown): [number, number][][] {
  if (!Array.isArray(value)) return [];
  return value
    .map((coordinates) => toCoordinatePairList(coordinates))
    .filter((coordinates) => coordinates.length >= 2);
}

function toPolygonCoordinates(value: unknown): [number, number][][] | null {
  const rings = toCoordinatePairListCollection(value).map((ring) => closeRingIfNeeded(ring));
  return rings.length > 0 ? rings : null;
}

function toMultiPolygonCoordinates(value: unknown): [number, number][][][] | null {
  if (!Array.isArray(value)) return null;

  const polygons = value
    .map((polygonCoordinates) => toPolygonCoordinates(polygonCoordinates))
    .filter((polygon): polygon is [number, number][][] => polygon !== null);

  return polygons.length > 0 ? polygons : null;
}

function closeRingIfNeeded(ring: [number, number][]): [number, number][] {
  const firstCoordinate = ring[0];
  const lastCoordinate = ring[ring.length - 1];

  if (!firstCoordinate || !lastCoordinate) {
    return ring;
  }

  if (
    firstCoordinate[0] === lastCoordinate[0] &&
    firstCoordinate[1] === lastCoordinate[1]
  ) {
    return ring;
  }

  return [...ring, firstCoordinate];
}

function getDirectChildByLocalName(element: Element, localName: string): Element | null {
  return Array.from(element.children).find((child) => child.localName === localName) ?? null;
}

function getDirectChildrenByLocalName(element: Element, localName: string): Element[] {
  return Array.from(element.children).filter((child) => child.localName === localName);
}

function getDescendantElementsByLocalName(root: Element, localName: string): Element[] {
  return Array.from(root.getElementsByTagName("*")).filter((element) => element.localName === localName);
}

function getDirectChildTextContent(element: Element, localName: string): string | null {
  const child = getDirectChildByLocalName(element, localName);
  const text = child?.textContent?.trim();
  return text ? text : null;
}
