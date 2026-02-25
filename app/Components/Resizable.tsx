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

const Resizable = () => {
    const [allRows, setAllRows] = React.useState<Standard1Row[]>([]);
    const [visibleRows, setVisibleRows] = React.useState<Standard1Row[]>([]);
    const [filteredPlotIds, setFilteredPlotIds] = React.useState<string[]>([]);
    const [selectedRow, setSelectedRow] = React.useState<Standard1Row | null>(null);
    const [selectedRowTrigger, setSelectedRowTrigger] = React.useState(0);
    const [showUnsupportedAlert, setShowUnsupportedAlert] = React.useState(false);
    const [originAssetQuery, setOriginAssetQuery] = React.useState("");

    const handleRowSelect = React.useCallback((row: Standard1Row | null) => {
        setSelectedRow(row);
        setSelectedRowTrigger((prev) => prev + 1);
    }, []);

    const handleDataLoaded = React.useCallback((rows: Standard1Row[]) => {
        setShowUnsupportedAlert(false);
        setAllRows(rows);
        setVisibleRows(rows);
        setFilteredPlotIds([]);
        setSelectedRow(null);
        setSelectedRowTrigger((prev) => prev + 1);
    }, []);

    const handleUnsupportedData = React.useCallback(() => {
        setShowUnsupportedAlert(true);
    }, []);

    const handleVisibleRowsChange = React.useCallback((rows: Standard1Row[]) => {
        setVisibleRows(rows);

        const isFilterActive = rows.length !== allRows.length;
        if (!isFilterActive) {
            setFilteredPlotIds([]);
            return;
        }

        setFilteredPlotIds(rows.map((row) => row.sucafina_plot_id));
    }, [allRows]);

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
                        <div className="flex h-full w-full flex-col">
                            <div className="relative h-[45%] min-h-[220px] border border-slate-200 bg-white">
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
                            <div className="flex min-h-0 flex-1 flex-col border border-slate-200 bg-white">
                                {/* implement a window of 2 tabs here: Layers and Origin Assets*/}
                                <div className="flex items-center">
                                    <div
                                        className={`py-1 px-3 text-xs uppercase cursor-pointer ${originAssetQuery === "" ? "font-semibold bg-[#00777f] text-white" : "text-slate-500 hover:text-slate-700"
                                            }`}
                                        onClick={() => setOriginAssetQuery("")}
                                    >
                                        Layers
                                    </div>
                                    <div
                                        className={`py-1 px-3 text-xs uppercase cursor-pointer ${originAssetQuery !== "" ? "font-semibold bg-[#00777f] text-white" : "text-slate-500 hover:text-slate-700"
                                            }`}
                                        onClick={() => setOriginAssetQuery("query")}
                                    >
                                        Origin Assets
                                    </div>
                                </div>
                                <div className="flex h-full w-full items-center justify-center p-6">
                                    {originAssetQuery === "" ? (
                                        <span className="font-semibold">Layers</span>
                                    ) : (
                                        <span className="font-semibold">Origin Assets</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize="60%" className="relative">
                        {/* Use a wrapper div to get size */}
                        <div className="w-full h-full" style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <Map
                                rows={allRows}
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
