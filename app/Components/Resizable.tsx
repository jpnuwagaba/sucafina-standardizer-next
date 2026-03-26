"use client"

import React from 'react'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import Map from './Map'
import DropBox from './DropBox'
import StandardsPanel from './StandardsPanel'
import type { Standard1Row } from "@/app/data/standard1"
import type { UploadedCsvTable } from "@/lib/ingestion/standard1Csv"

type LayerItem = {
    id: string;
    name: string;
    rows: Standard1Row[];
    table: UploadedCsvTable;
    isVisible: boolean;
};

type SidePanelTab = "layers" | "origin-assets";

const Resizable = () => {
    const [layers, setLayers] = React.useState<LayerItem[]>([]);
    const [activeLayerId, setActiveLayerId] = React.useState<string | null>(null);
    const [extentFitTrigger, setExtentFitTrigger] = React.useState(0);
    const [visibleRows, setVisibleRows] = React.useState<Standard1Row[]>([]);
    const [filteredPlotIds, setFilteredPlotIds] = React.useState<string[]>([]);
    const [selectedRow, setSelectedRow] = React.useState<Standard1Row | null>(null);
    const [selectedRowTrigger, setSelectedRowTrigger] = React.useState(0);
    const [showUnsupportedAlert, setShowUnsupportedAlert] = React.useState(false);
    const [activeSidePanelTab, setActiveSidePanelTab] = React.useState<SidePanelTab>("layers");

    const activeLayer = React.useMemo(
        () => layers.find((layer) => layer.id === activeLayerId) ?? null,
        [layers, activeLayerId],
    );
    const allRows = React.useMemo(
        () => activeLayer?.rows ?? [],
        [activeLayer],
    );
    const activeLayerTable = React.useMemo(
        () => activeLayer?.table ?? { columns: [], rows: [] },
        [activeLayer],
    );
    const mapRows = React.useMemo(
        () => (activeLayer?.isVisible ? allRows : []),
        [activeLayer, allRows],
    );

    const handleRowSelect = React.useCallback((row: Standard1Row | null) => {
        setSelectedRow(row);
        setSelectedRowTrigger((prev) => prev + 1);
    }, []);

    const handleDataLoaded = React.useCallback((rows: Standard1Row[], table: UploadedCsvTable, fileName: string) => {
        setShowUnsupportedAlert(false);
        const layerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        setLayers((previousLayers) => {
            const fallbackName = `Layer ${previousLayers.length + 1}`;
            const normalizedFileName = fileName.trim();
            const layerName = normalizedFileName.length > 0 ? normalizedFileName : fallbackName;

            return [
                ...previousLayers,
                {
                    id: layerId,
                    name: layerName,
                    rows,
                    table,
                    isVisible: true,
                },
            ];
        });
        setActiveLayerId(layerId);
        setActiveSidePanelTab("layers");
    }, []);

    const handleUnsupportedData = React.useCallback(() => {
        setShowUnsupportedAlert(true);
    }, []);

    const handleVisibleRowsChange = React.useCallback((rows: Standard1Row[]) => {
        setVisibleRows(rows);

        const isFilterActive = rows.length !== allRows.length;
        if (!isFilterActive) {
            setFilteredPlotIds([]);
            setExtentFitTrigger((prev) => prev + 1);
            return;
        }

        setFilteredPlotIds(rows.map((row) => row.sucafina_plot_id));
        setExtentFitTrigger((prev) => prev + 1);
    }, [allRows]);

    const handleLayerVisibilityChange = React.useCallback((layerId: string, isVisible: boolean) => {
        setLayers((previousLayers) =>
            previousLayers.map((layer) =>
                layer.id === layerId ? { ...layer, isVisible } : layer,
            ),
        );
    }, []);

    React.useEffect(() => {
        if (!activeLayerId) return;

        setExtentFitTrigger((prev) => prev + 1);
    }, [activeLayerId]);

    React.useEffect(() => {
        setVisibleRows(allRows);
        setFilteredPlotIds([]);
        setSelectedRow(null);
        setSelectedRowTrigger((prev) => prev + 1);
    }, [activeLayerId, allRows]);

    React.useEffect(() => {
        if (!selectedRow) return;

        const stillVisible = visibleRows.some((row) => row.sucafina_plot_id === selectedRow.sucafina_plot_id);
        if (stillVisible) return;

        setSelectedRow(null);
        setSelectedRowTrigger((prev) => prev + 1);
    }, [selectedRow, visibleRows]);

    return (
        <ResizablePanelGroup
            orientation="vertical"
            className="w-full h-full rounded-none border-none"
        >
            <ResizablePanel defaultSize="60%">
                <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize="20%">
                        <ResizablePanelGroup orientation="vertical">
                            <ResizablePanel defaultSize="50%">
                                <div className="relative h-full border border-slate-200 bg-white">
                                    {showUnsupportedAlert ? (
                                        <div className="absolute left-2 right-2 top-2 z-20 flex items-start justify-between gap-3 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-900 shadow-sm">
                                            <span className="pt-0.5">Data format not supported</span>
                                            <button
                                                type="button"
                                                aria-label="Dismiss alert"
                                                onClick={() => setShowUnsupportedAlert(false)}
                                                className="rounded border border-rose-300 px-2 py-0.5 text-[11px] font-medium hover:bg-rose-100"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    ) : null}
                                    <DropBox
                                        onDataLoaded={handleDataLoaded}
                                        onUnsupportedData={handleUnsupportedData}
                                    />
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize="50%">
                                <div className="flex min-h-0 h-full flex-1 flex-col border border-slate-200 bg-white">
                                    <div className="flex items-center">
                                        <button
                                            type="button"
                                            className={`py-1 px-3 text-xs uppercase cursor-pointer ${activeSidePanelTab === "layers" ? "font-semibold bg-[#00777f] text-white" : "text-slate-500 hover:text-slate-700"
                                                }`}
                                            onClick={() => setActiveSidePanelTab("layers")}
                                        >
                                            Layers
                                        </button>
                                        <button
                                            type="button"
                                            className={`py-1 px-3 text-xs uppercase cursor-pointer ${activeSidePanelTab === "origin-assets" ? "font-semibold bg-[#00777f] text-white" : "text-slate-500 hover:text-slate-700"
                                                }`}
                                            onClick={() => setActiveSidePanelTab("origin-assets")}
                                        >
                                            Origin Assets
                                        </button>
                                    </div>
                                    <div className="h-full w-full min-h-0 p-2">
                                        {activeSidePanelTab === "layers" ? (
                                            layers.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {layers.map((layer, index) => {
                                                        const isActive = layer.id === activeLayerId;
                                                        return (
                                                            <li
                                                                key={layer.id}
                                                                className={`flex items-center justify-between gap-2 rounded border px-2 py-2 transition-colors ${isActive
                                                                    ? "border-[#00777f] bg-[#00777f]/10"
                                                                    : "border-slate-200 bg-slate-100/80 text-slate-400"
                                                                    }`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveLayerId(layer.id)}
                                                                    className="min-w-0 flex-1 text-left"
                                                                >
                                                                    <p className={`truncate text-sm ${isActive ? "font-semibold text-[#005d62]" : "text-slate-500"}`}>
                                                                        {layer.name || `Layer ${index + 1}`} [{layer.rows.length}]
                                                                    </p>
                                                                    {/* <p className="text-[11px] text-slate-500">
                                                                        {layer.rows.length} records
                                                                    </p> */}
                                                                </button>

                                                                <label
                                                                    className={`flex shrink-0 items-center gap-2 text-[11px] ${isActive ? "text-slate-600" : "text-slate-400"}`}
                                                                >
                                                                    {/* <span>Show</span> */}
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={layer.isVisible}
                                                                        disabled={!isActive}
                                                                        onChange={(event) => handleLayerVisibilityChange(layer.id, event.target.checked)}
                                                                        className={`h-4 w-4 rounded border-slate-300 accent-[#00777f] ${isActive ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
                                                                    />
                                                                </label>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs text-slate-600">
                                                    Upload data to add a layer.
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <span className="font-semibold">Origin Assets</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="60%" className="relative">
                        {/* Use a wrapper div to get size */}
                        <div className="w-full h-full" style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <Map
                                rows={mapRows}
                                extentFitTrigger={extentFitTrigger}
                                filteredPlotIds={filteredPlotIds}
                                selectedRow={selectedRow}
                                selectedRowTrigger={selectedRowTrigger}
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="20%">
                        <div className="flex h-full w-full items-center justify-center p-6">
                            <span className="font-semibold">Fixes and Processes</span>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="30%">
                <div className="h-full w-full p-2">
                    <StandardsPanel
                        rows={allRows}
                        tableColumns={activeLayerTable.columns}
                        tableRows={activeLayerTable.rows}
                        onVisibleRowsChange={handleVisibleRowsChange}
                        onRowSelect={handleRowSelect}
                        selectedRow={selectedRow}
                    />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export default Resizable
