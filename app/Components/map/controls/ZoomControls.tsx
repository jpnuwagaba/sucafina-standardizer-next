"use client";

import { RotateCcw, ArrowUp, Box, Square } from "lucide-react";

type ZoomControlsProps = {
  disabled?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onResetNorth: () => void;
  onToggle3D?: () => void;
  is3D?: boolean;
  currentBearing?: number;
};

export default function ZoomControls({
  disabled = false,
  onZoomIn,
  onZoomOut,
  onResetView,
  onResetNorth,
  onToggle3D,
  is3D = false,
  currentBearing = 0,
}: ZoomControlsProps) {
  return (
    <div className="absolute right-0 top-0 z-10 flex flex-col">
      <button
        type="button"
        onClick={onZoomIn}
        disabled={disabled}
        className="h-9 w-9  border bg-white text-lg font-semibold text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        disabled={disabled}
        className="h-9 w-9  border bg-white text-lg font-semibold text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        aria-label="Zoom out"
      >
        -
      </button>
      <button 
      type="button"
      onClick={onResetNorth}
      disabled={disabled}
      className="h-9 w-9 border bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      aria-label="Reset map north"
      >
        <ArrowUp
          className="h-4 w-4"
          style={{ transform: `rotate(${-currentBearing}deg)` }}
        />
      </button>
      <button
        type="button"
        onClick={onToggle3D}
        disabled={disabled}
        className="h-9 w-9 border bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        aria-label={is3D ? "3D mode active" : "2D mode active"}
      >
        {is3D ? <Square className="h-4 w-4" /> : <Box className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={onResetView}
        disabled={disabled}
        className="h-9 w-9 border bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
