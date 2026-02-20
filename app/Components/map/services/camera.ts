import type { LngLatLike, Map } from "mapbox-gl";

import { DEFAULT_CENTER, DEFAULT_ZOOM, DEFAULT_ZOOM_STEP } from "../constants";

export function zoomIn(map: Map) {
  map.easeTo({ zoom: map.getZoom() + DEFAULT_ZOOM_STEP, duration: 250 });
}

export function zoomOut(map: Map) {
  map.easeTo({ zoom: map.getZoom() - DEFAULT_ZOOM_STEP, duration: 250 });
}

export function resetCamera(map: Map, center: LngLatLike = DEFAULT_CENTER, zoom = DEFAULT_ZOOM) {
  map.easeTo({ center, zoom, duration: 700 });
}

export function flyToCoordinates(map: Map, center: LngLatLike, zoom = 10) {
  map.flyTo({ center, zoom, essential: true, duration: 1200 });
}
