"use client";

import React from "react";
import Standard1 from "./Standard1";

type StandardTab = "standard1" | "impact";

const StandardsPanel = () => {
  const [activeTab, setActiveTab] = React.useState<StandardTab>("standard1");
  const [showImpactAlert, setShowImpactAlert] = React.useState(false);

  React.useEffect(() => {
    if (activeTab !== "impact") {
      setShowImpactAlert(false);
      return;
    }

    setShowImpactAlert(true);
    const timer = window.setTimeout(() => {
      setShowImpactAlert(false);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="h-full w-full overflow-hidden rounded-md border bg-white">
      <div className="relative h-[calc(100%-44px)] w-full overflow-hidden">
        {showImpactAlert ? (
          <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 shadow-sm">
            IMPACT standard not defined yet
          </div>
        ) : null}

        {activeTab === "standard1" ? (
          <div className="h-full w-full p-2">
            <Standard1 />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm text-slate-700">
            IMPACT standard not defined yet
          </div>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Data standards"
        className="flex h-11 items-end gap-1 overflow-x-auto border-t bg-slate-100 px-2 pt-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "standard1"}
          onClick={() => setActiveTab("standard1")}
          className={`h-8 min-w-[120px] rounded-t-md border px-3 text-sm transition-colors ${
            activeTab === "standard1"
              ? "border-b-white bg-white font-semibold text-slate-900"
              : "border-slate-300 bg-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Standard1
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "impact"}
          onClick={() => setActiveTab("impact")}
          className={`h-8 min-w-[120px] rounded-t-md border px-3 text-sm transition-colors ${
            activeTab === "impact"
              ? "border-b-white bg-white font-semibold text-slate-900"
              : "border-slate-300 bg-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          IMPACT
        </button>
      </div>
    </div>
  );
};

export default StandardsPanel;
