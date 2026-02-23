import type { Standard1Row } from "@/app/data/standard1";
import { parseWktGeometry } from "@/lib/geospatial/wkt";

export const STANDARD1_REQUIRED_COLUMNS = [
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

type ParseOk = {
  ok: true;
  rows: Standard1Row[];
};

type ParseError = {
  ok: false;
  reason: string;
};

export type Standard1CsvParseResult = ParseOk | ParseError;

export async function parseStandard1CsvFile(file: File): Promise<Standard1CsvParseResult> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { ok: false, reason: "Only CSV format is supported." };
  }

  const text = await file.text();
  const matrix = parseCsv(text);
  if (matrix.length === 0) {
    return { ok: false, reason: "CSV file is empty." };
  }

  const header = matrix[0].map((cell) => cell.trim().replace(/^\uFEFF/, ""));
  if (
    header.length !== STANDARD1_REQUIRED_COLUMNS.length ||
    !STANDARD1_REQUIRED_COLUMNS.every((column, index) => header[index] === column)
  ) {
    return {
      ok: false,
      reason: "CSV headers do not match the Standard1 schema.",
    };
  }

  const dataRows = matrix
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim().length > 0));

  const parsedRows: Standard1Row[] = [];
  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
    const row = dataRows[rowIndex];
    if (row.length !== STANDARD1_REQUIRED_COLUMNS.length) {
      return {
        ok: false,
        reason: `Row ${rowIndex + 2} has an invalid column count.`,
      };
    }

    const rowMap = Object.fromEntries(
      STANDARD1_REQUIRED_COLUMNS.map((column, index) => [column, row[index] ?? ""]),
    ) as Record<(typeof STANDARD1_REQUIRED_COLUMNS)[number], string>;

    const numericArea = parseNullableNumber(rowMap.plot_area_ha);
    const numericLongitude = parseNullableNumber(rowMap.plot_longitude);
    const numericLatitude = parseNullableNumber(rowMap.plot_latitude);
    const isGeodataValidated = parseNullableBoolean(rowMap.is_geodata_validated);
    const isCafeCertified = parseNullableBoolean(rowMap.is_cafe_practices_certified);
    const isRfaCertified = parseNullableBoolean(rowMap.is_rfa_utz_certified);
    const isImpactCertified = parseNullableBoolean(rowMap.is_impact_certified);
    const isOrganicCertified = parseNullableBoolean(rowMap.is_organic_certified);
    const is4cCertified = parseNullableBoolean(rowMap.is_4c_certified);
    const isFairtradeCertified = parseNullableBoolean(rowMap.is_fairtrade_certified);

    if (
      numericArea === undefined ||
      numericLongitude === undefined ||
      numericLatitude === undefined ||
      isGeodataValidated === undefined ||
      isCafeCertified === undefined ||
      isRfaCertified === undefined ||
      isImpactCertified === undefined ||
      isOrganicCertified === undefined ||
      is4cCertified === undefined ||
      isFairtradeCertified === undefined
    ) {
      return {
        ok: false,
        reason: `Row ${rowIndex + 2} has invalid value types.`,
      };
    }

    const plotGpsPoint = rowMap.plot_gps_point.trim();
    const plotGpsPolygon = rowMap.plot_gps_polygon.trim();
    const rawPlotWkt = rowMap.plot_wkt.trim();

    parsedRows.push({
      sucafina_plot_id: rowMap.sucafina_plot_id.trim(),
      supplier_plot_id: rowMap.supplier_plot_id.trim(),
      farmer_id: rowMap.farmer_id.trim(),
      supplier_code: rowMap.supplier_code.trim(),
      plot_region: rowMap.plot_region.trim(),
      plot_district: rowMap.plot_district.trim(),
      plot_area_ha: numericArea,
      plot_longitude: numericLongitude,
      plot_latitude: numericLatitude,
      plot_gps_point: plotGpsPoint,
      plot_gps_polygon: plotGpsPolygon,
      plot_wkt: resolvePreferredPlotWkt(plotGpsPoint, plotGpsPolygon, rawPlotWkt),
      is_geodata_validated: isGeodataValidated,
      is_cafe_practices_certified: isCafeCertified,
      is_rfa_utz_certified: isRfaCertified,
      is_impact_certified: isImpactCertified,
      is_organic_certified: isOrganicCertified,
      is_4c_certified: is4cCertified,
      is_fairtrade_certified: isFairtradeCertified,
      other_certification_name: rowMap.other_certification_name.trim(),
      plot_supply_chain: rowMap.plot_supply_chain.trim(),
      plot_farmer_group: rowMap.plot_farmer_group.trim(),
    });
  }

  return { ok: true, rows: parsedRows };
}

function parseNullableNumber(value: string): number | null | undefined {
  const normalized = value.trim();
  if (!normalized) return null;
  const asNumber = Number(normalized);
  if (!Number.isFinite(asNumber)) return undefined;
  return asNumber;
}

function parseNullableBoolean(value: string): boolean | null | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return undefined;
}

function resolvePreferredPlotWkt(plotGpsPoint: string, plotGpsPolygon: string, plotWkt: string): string {
  if (plotGpsPolygon && parseWktGeometry(plotGpsPolygon)) return plotGpsPolygon;
  if (plotGpsPoint && parseWktGeometry(plotGpsPoint)) return plotGpsPoint;
  return plotWkt;
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
