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
const STANDARD1_LAYER_IDS = [
  STANDARD1_POINT_LAYER_ID,
  STANDARD1_POLYGON_FILL_LAYER_ID,
  STANDARD1_POLYGON_OUTLINE_LAYER_ID,
];

const DEFAULT_PLOT_COLOR = "#16a34a";
const FILTERED_PLOT_COLOR = "#f97316";
const SELECTED_PLOT_COLOR = "#facc15";

const polygonGeometryFilter = [
  "any",
  ["==", ["geometry-type"], "Polygon"],
  ["==", ["geometry-type"], "MultiPolygon"],
];

const standard1PointsLayer: CircleLayerSpecification = {
  id: STANDARD1_POINT_LAYER_ID,
  type: "circle",
  source: STANDARD1_SOURCE_ID,
  filter: ["==", ["geometry-type"], "Point"],
  paint: {
    "circle-radius": 6,
    "circle-color": DEFAULT_PLOT_COLOR,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1.25,
    "circle-opacity": 0.95,
  },
};

const standard1PolygonFillLayer: FillLayerSpecification = {
  id: STANDARD1_POLYGON_FILL_LAYER_ID,
  type: "fill",
  source: STANDARD1_SOURCE_ID,
  filter: polygonGeometryFilter,
  paint: {
    "fill-color": DEFAULT_PLOT_COLOR,
    "fill-opacity": 0.2,
  },
};

const standard1PolygonOutlineLayer: LineLayerSpecification = {
  id: STANDARD1_POLYGON_OUTLINE_LAYER_ID,
  type: "line",
  source: STANDARD1_SOURCE_ID,
  filter: polygonGeometryFilter,
  paint: {
    "line-color": DEFAULT_PLOT_COLOR,
    "line-width": 2,
    "line-opacity": 0.9,
  },
};

function buildColorExpression(
  filteredPlotIds: string[],
  selectedPlotId: string | null,
): ExpressionSpecification {
  return [
    "case",
    ["==", ["get", "sucafina_plot_id"], selectedPlotId ?? ""],
    SELECTED_PLOT_COLOR,
    ["in", ["get", "sucafina_plot_id"], ["literal", filteredPlotIds]],
    FILTERED_PLOT_COLOR,
    DEFAULT_PLOT_COLOR,
  ];
}

export function updateStandard1LayerColors(
  map: Map,
  filteredPlotIds: string[],
  selectedPlotId: string | null,
) {
  const colorExpression = buildColorExpression(filteredPlotIds, selectedPlotId);

  if (map.getLayer(STANDARD1_POINT_LAYER_ID)) {
    map.setPaintProperty(STANDARD1_POINT_LAYER_ID, "circle-color", colorExpression);
  }
  if (map.getLayer(STANDARD1_POLYGON_FILL_LAYER_ID)) {
    map.setPaintProperty(STANDARD1_POLYGON_FILL_LAYER_ID, "fill-color", colorExpression);
  }
  if (map.getLayer(STANDARD1_POLYGON_OUTLINE_LAYER_ID)) {
    map.setPaintProperty(STANDARD1_POLYGON_OUTLINE_LAYER_ID, "line-color", colorExpression);
  }
}

export function setStandard1LayerVisibility(map: Map, isVisible: boolean) {
  const visibility = isVisible ? "visible" : "none";

  for (const layerId of STANDARD1_LAYER_IDS) {
    if (!map.getLayer(layerId)) continue;
    map.setLayoutProperty(layerId, "visibility", visibility);
  }
}

export function upsertStandard1Layer(
  map: Map,
  data: Standard1FeatureCollection,
  filteredPlotIds: string[],
  selectedPlotId: string | null,
) {
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

  updateStandard1LayerColors(map, filteredPlotIds, selectedPlotId);
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
