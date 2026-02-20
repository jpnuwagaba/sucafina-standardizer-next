"use client";

import { useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { standard1Rows, type Standard1Row } from "@/app/data/standard1";

import ToggleBaseMap from "./controls/ToggleBaseMap";
import ZoomControls from "./controls/ZoomControls";
import { useMapCamera } from "./hooks/useMapCamera";
import { useMapInstance } from "./hooks/useMapInstance";
import { useMapResize } from "./hooks/useMapResize";
import { useStandard1DevelopmentLayer } from "./hooks/useStandard1DevelopmentLayer";

interface MapProps {
  className?: string;
  style?: React.CSSProperties;
  rows?: Standard1Row[];
  selectedRow?: Standard1Row | null;
  selectedRowTrigger?: number;
}

export default function MapView({
  className = "",
  style = {},
  rows = standard1Rows,
  selectedRow = null,
  selectedRowTrigger = 0,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapRef, mapError, isMapReady, currentStyle, styleRevision, setMapStyle } = useMapInstance(mapContainer);
  const { onZoomIn, onZoomOut, onResetView } = useMapCamera(mapRef);

  useMapResize(mapContainer, mapRef);
  useStandard1DevelopmentLayer(
    mapRef,
    isMapReady,
    styleRevision,
    rows,
    selectedRow,
    selectedRowTrigger,
  );

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <div
        ref={mapContainer}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ToggleBaseMap
        disabled={!!mapError}
        currentStyle={currentStyle}
        onStyleChange={setMapStyle}
      />

      <ZoomControls
        disabled={!isMapReady || !!mapError}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetView={onResetView}
      />

      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 text-center text-sm text-slate-700">
          {mapError}
        </div>
      ) : null}
    </div>
  );
}
