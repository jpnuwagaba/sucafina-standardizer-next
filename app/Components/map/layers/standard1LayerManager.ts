import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  FillLayerSpecification,
  GeoJSONSource,
  LineLayerSpecification,
  Map,
} from "mapbox-gl";

import type { Standard1FeatureCollection } from "@/app/data/standard1";

export const STANDARD1_SOURCE_ID = "standard1-source";
export const STANDARD1_POINT_LAYER_ID = "standard1-points-layer";
export const STANDARD1_POLYGON_FILL_LAYER_ID = "standard1-polygons-fill-layer";
export const STANDARD1_POLYGON_OUTLINE_LAYER_ID = "standard1-polygons-outline-layer";

const validationColorExpression: ExpressionSpecification = [
  "case",
  ["==", ["get", "is_geodata_validated"], true],
  "#16a34a",
  ["==", ["get", "is_geodata_validated"], false],
  "#dc2626",
  "#2563eb",
];

const standard1PointsLayer: CircleLayerSpecification = {
  id: STANDARD1_POINT_LAYER_ID,
  type: "circle",
  source: STANDARD1_SOURCE_ID,
  filter: ["==", ["geometry-type"], "Point"],
  paint: {
    "circle-radius": 6,
    "circle-color": validationColorExpression,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1.25,
    "circle-opacity": 0.95,
  },
};

const standard1PolygonFillLayer: FillLayerSpecification = {
  id: STANDARD1_POLYGON_FILL_LAYER_ID,
  type: "fill",
  source: STANDARD1_SOURCE_ID,
  filter: ["==", ["geometry-type"], "Polygon"],
  paint: {
    "fill-color": validationColorExpression,
    "fill-opacity": 0.2,
  },
};

const standard1PolygonOutlineLayer: LineLayerSpecification = {
  id: STANDARD1_POLYGON_OUTLINE_LAYER_ID,
  type: "line",
  source: STANDARD1_SOURCE_ID,
  filter: ["==", ["geometry-type"], "Polygon"],
  paint: {
    "line-color": validationColorExpression,
    "line-width": 2,
    "line-opacity": 0.9,
  },
};

export function upsertStandard1Layer(map: Map, data: Standard1FeatureCollection) {
  const source = map.getSource(STANDARD1_SOURCE_ID) as GeoJSONSource | undefined;

  if (source) {
    source.setData(data);
  } else {
    map.addSource(STANDARD1_SOURCE_ID, {
      type: "geojson",
      data,
    });
  }

  if (!map.getLayer(STANDARD1_POLYGON_FILL_LAYER_ID)) {
    map.addLayer(standard1PolygonFillLayer);
  }
  if (!map.getLayer(STANDARD1_POLYGON_OUTLINE_LAYER_ID)) {
    map.addLayer(standard1PolygonOutlineLayer);
  }
  if (!map.getLayer(STANDARD1_POINT_LAYER_ID)) {
    map.addLayer(standard1PointsLayer);
  }
}

export function removeStandard1Layer(map: Map) {
  if (map.getLayer(STANDARD1_POINT_LAYER_ID)) {
    map.removeLayer(STANDARD1_POINT_LAYER_ID);
  }
  if (map.getLayer(STANDARD1_POLYGON_OUTLINE_LAYER_ID)) {
    map.removeLayer(STANDARD1_POLYGON_OUTLINE_LAYER_ID);
  }
  if (map.getLayer(STANDARD1_POLYGON_FILL_LAYER_ID)) {
    map.removeLayer(STANDARD1_POLYGON_FILL_LAYER_ID);
  }
  if (map.getSource(STANDARD1_SOURCE_ID)) {
    map.removeSource(STANDARD1_SOURCE_ID);
  }
}
