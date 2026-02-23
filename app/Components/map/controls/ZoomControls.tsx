"use client";

import { RotateCcw } from "lucide-react";

type ZoomControlsProps = {
  disabled?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

export default function ZoomControls({
  disabled = false,
  onZoomIn,
  onZoomOut,
  onResetView,
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
        onClick={onResetView}
        disabled={disabled}
        className="h-9 w-9 border bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
