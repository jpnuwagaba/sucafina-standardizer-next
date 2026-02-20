export const MAPBOX_STANDARD_STYLE = "mapbox://styles/mapbox/standard";
export const MAPBOX_SATELLITE_STREETS_STYLE = "mapbox://styles/mapbox/standard-satellite";

export type BaseMapStyle =
  | typeof MAPBOX_STANDARD_STYLE
  | typeof MAPBOX_SATELLITE_STREETS_STYLE;

export const DEFAULT_MAP_STYLE: BaseMapStyle = MAPBOX_SATELLITE_STREETS_STYLE;
export const DEFAULT_CENTER: [number, number] = [32.579956, 0.335081];
export const DEFAULT_ZOOM = 2;
export const DEFAULT_ZOOM_STEP = 0.8;
