"use client";

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
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={onZoomIn}
        disabled={disabled}
        className="h-9 w-9 rounded border bg-white text-lg font-semibold text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        disabled={disabled}
        className="h-9 w-9 rounded border bg-white text-lg font-semibold text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Zoom out"
      >
        -
      </button>
      <button
        type="button"
        onClick={onResetView}
        disabled={disabled}
        className="rounded border bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Reset
      </button>
    </div>
  );
}
