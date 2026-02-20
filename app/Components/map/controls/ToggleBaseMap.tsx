"use client";

import {
  MAPBOX_SATELLITE_STREETS_STYLE,
  MAPBOX_STANDARD_STYLE,
  type BaseMapStyle,
} from "../constants";

type ToggleBaseMapProps = {
  disabled?: boolean;
  currentStyle: BaseMapStyle;
  onStyleChange: (style: BaseMapStyle) => void;
};

export default function ToggleBaseMap({
  disabled = false,
  currentStyle,
  onStyleChange,
}: ToggleBaseMapProps) {
  return (
    <div className="absolute left-0 top-0 z-10 inline-flex bg-white shadow-sm">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && onStyleChange(MAPBOX_SATELLITE_STREETS_STYLE)}
        onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && onStyleChange(MAPBOX_SATELLITE_STREETS_STYLE)}
        className={`px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
          currentStyle === MAPBOX_SATELLITE_STREETS_STYLE
            ? "bg-[#00777f] text-white"
            : "bg-transparent text-slate-700 hover:bg-[#00777f]/10"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        Satellite
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && onStyleChange(MAPBOX_STANDARD_STYLE)}
        onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && onStyleChange(MAPBOX_STANDARD_STYLE)}
        className={`px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
          currentStyle === MAPBOX_STANDARD_STYLE
            ? "bg-[#00777f] text-white"
            : "bg-transparent text-slate-700 hover:bg-[#00777f]/10"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        Standard
      </div>
    </div>
  );
}
