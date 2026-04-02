export * from "./standard1File";

/* Legacy shim kept for compatibility with older imports.

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

export type UploadedCsvTable = {
  columns: string[];
  rows: string[][];
};

type ParseOk = {
  ok: true;
  rows: Standard1Row[];
  table: UploadedCsvTable;
};

type ParseError = {
  ok: false;
  reason: string;
};

export type Standard1CsvParseResult = ParseOk | ParseError;

type GeometryCandidate = {
  value: string;
  geometry: ParsedWktGeometry;
};

export async function parseStandard1CsvFile(file: File): Promise<Standard1CsvParseResult> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { ok: false, reason: "Only CSV format is supported." };
  }

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

  return {
    ok: true,
    rows: parsedRows,
    table: {
      columns: header,
      rows: tableRows,
    },
  };
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

function parseNullableBoolean(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return null;
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        cell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
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
*/
