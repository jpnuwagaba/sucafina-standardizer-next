"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_CENTER,
  DEFAULT_MAP_STYLE,
  DEFAULT_ZOOM,
  type BaseMapStyle,
} from "../constants";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function useMapInstance(mapContainer: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<BaseMapStyle>(DEFAULT_MAP_STYLE);
  const [styleRevision, setStyleRevision] = useState(0);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    if (!mapboxToken) {
      setMapError("Map is unavailable: NEXT_PUBLIC_MAPBOX_TOKEN is not set.");
      return;
    }

    let isMounted = true;

    void import("mapbox-gl")
      .then((mapboxgl) => {
        if (!isMounted || !mapContainer.current) return;

        mapboxgl.default.accessToken = mapboxToken;

        const map = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: currentStyle,
          projection: "globe",
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          antialias: true,
        });

        map.on("load", () => {
          setIsMapReady(true);
          setStyleRevision((prev) => prev + 1);
        });

        map.on("error", () => {
          setMapError("Map failed to load. Please verify your Mapbox token.");
        });

        mapRef.current = map;
      })
      .catch(() => {
        setMapError("Map could not be initialized.");
      });

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [mapContainer]);

  const setMapStyle = useCallback((nextStyle: BaseMapStyle) => {
    if (!mapRef.current) return;
    if (nextStyle === currentStyle) return;

    setMapError(null);
    setCurrentStyle(nextStyle);

    mapRef.current.once("style.load", () => {
      setStyleRevision((prev) => prev + 1);
    });

    mapRef.current.setStyle(nextStyle);
  }, [currentStyle]);

  return { mapRef, mapError, isMapReady, currentStyle, styleRevision, setMapStyle };
}
