"use client";

import React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpNarrowWide, ArrowDownWideNarrow } from "lucide-react";

import type { Standard1Row } from "@/app/data/standard1";

type Standard1Props = {
  rows: Standard1Row[];
  tableColumns?: string[];
  tableRows?: string[][];
  onVisibleRowsChange?: (rows: Standard1Row[]) => void;
  onRowSelect?: (row: Standard1Row | null) => void;
  selectedRow?: Standard1Row | null;
};

type TableRow = {
  standardRow: Standard1Row;
  csvValues: string[];
};

const STANDARD1_FALLBACK_COLUMNS = [
  "sucafina_plot_id",
  "supplier_plot_id",
  "farmer_id",
  "supplier_code",
  "plot_region",
  "plot_district",
  "plot_area_ha",
  "plot_longitude",
  "plot_latitude",
  "plot_gps_point",
  "plot_gps_polygon",
  "plot_wkt",
  "is_geodata_validated",
  "is_cafe_practices_certified",
  "is_rfa_utz_certified",
  "is_impact_certified",
  "is_organic_certified",
  "is_4c_certified",
  "is_fairtrade_certified",
  "other_certification_name",
  "plot_supply_chain",
  "plot_farmer_group",
] as const;

function toDisplayText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

const fallbackColumns: ColumnDef<TableRow>[] = STANDARD1_FALLBACK_COLUMNS.map((columnName) => ({
  id: columnName,
  accessorFn: (row) => toDisplayText((row.standardRow as Record<string, unknown>)[columnName]),
  header: columnName,
  size: columnName === "plot_gps_polygon" ? 220 : 160,
  minSize: columnName === "plot_gps_polygon" ? 80 : 60,
  maxSize: columnName === "plot_gps_polygon" ? 320 : 500,
}));

const Standard1 = ({
  rows,
  tableColumns = [],
  tableRows = [],
  onVisibleRowsChange,
  onRowSelect,
  selectedRow = null,
}: Standard1Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const hasUploadedRows = rows.length > 0;
  const hasCsvColumns = tableColumns.length > 0;

  React.useEffect(() => {
    // New uploads should start from a clean table view.
    setSorting([]);
    setGlobalFilter("");
  }, [rows, tableColumns]);

  const data = React.useMemo<TableRow[]>(() => {
    return rows.map((standardRow, rowIndex) => ({
      standardRow,
      csvValues: tableColumns.map((_, columnIndex) => tableRows[rowIndex]?.[columnIndex] ?? ""),
    }));
  }, [rows, tableColumns, tableRows]);

  const columns = React.useMemo<ColumnDef<TableRow>[]>(() => {
    if (!hasCsvColumns) {
      return fallbackColumns;
    }

    return tableColumns.map((columnName, columnIndex) => {
      const normalizedColumnName = columnName.trim();
      const estimatedWidth = Math.max(Math.min((normalizedColumnName.length + 4) * 10, 420), 110);

      return {
        id: `csv-${columnIndex}`,
        accessorFn: (row) => row.csvValues[columnIndex] ?? "",
        header: columnName,
        size: estimatedWidth,
        minSize: 70,
        maxSize: 700,
      } satisfies ColumnDef<TableRow>;
    });
  }, [hasCsvColumns, tableColumns]);

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      size: 160,
      minSize: 60,
      maxSize: 500,
    },
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId) ?? "")
        .toLowerCase()
        .includes(String(filterValue ?? "").toLowerCase()),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
  });

  const totalRowCount = table.getCoreRowModel().rows.length;
  const filteredRows = table.getRowModel().rows;
  const filteredRowCount = filteredRows.length;
  const showPlaceholderTable = !hasUploadedRows;
  const showNoMatchingData = hasUploadedRows && filteredRowCount === 0;
  const visibleRows = filteredRows.map((row) => row.original.standardRow);
  const lastVisibleRowsKeyRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!onVisibleRowsChange) return;

    const visibleRowsKey = visibleRows
      .map((row) => row.sucafina_plot_id)
      .sort()
      .join("|");

    if (visibleRowsKey === lastVisibleRowsKeyRef.current) return;

    lastVisibleRowsKeyRef.current = visibleRowsKey;
    onVisibleRowsChange(visibleRows);
  }, [onVisibleRowsChange, visibleRows]);

  React.useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      const isSearchShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        event.key.toLowerCase() === "k";

      if (!isSearchShortcut) return;

      event.preventDefault();

      const input = searchInputRef.current;
      if (!input) return;

      input.focus();
      const cursorPosition = input.value.length;
      input.setSelectionRange(cursorPosition, cursorPosition);
    };

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="flex items-center gap-2 pb-2">
        <input
          ref={searchInputRef}
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          disabled={!hasUploadedRows}
          placeholder={hasUploadedRows ? "Search Records or Press Ctrl+K" : "Upload map data to search records"}
          className={`w-full max-w-sm rounded border px-2 py-1 text-sm ${hasUploadedRows ? "" : "cursor-not-allowed bg-slate-100 text-slate-500"}`}
        />
        <div className="ml-auto text-xs text-slate-600">
          {showPlaceholderTable ? "No uploaded rows yet" : `${filteredRowCount} of ${totalRowCount} rows`}
        </div>
        <div className="h-4 w-px bg-slate-300" />
        <div className="flex flex-row items-center">
          <div className="mr-2 flex flex-row items-center">
            <div className="mr-1 h-3 w-3 rounded-full bg-[#16a34a]" />
            <div className="text-xs text-slate-600">Default</div>
          </div>
          <div className="mr-2 flex flex-row items-center">
            <div className="mr-1 h-3 w-3 rounded-full bg-[#facc15]" />
            <div className="text-xs text-slate-600">Selected</div>
          </div>
          <div className="mr-2 flex flex-row items-center">
            <div className="mr-1 h-3 w-3 rounded-full bg-[#f97316]" />
            <div className="text-xs text-slate-600">Filtered</div>
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-40px)] w-full overflow-auto">
        {showPlaceholderTable ? (
          <div className="h-full w-full overflow-hidden rounded border border-slate-200 bg-white">
            <div className="border-b border-slate-200 py-1 text-center text-sm text-slate-400">
              empty
            </div>
          </div>
        ) : (
          <table
            className="min-w-full table-fixed border-collapse text-xs"
            style={{ width: table.getTotalSize() }}
          >
            <thead className="sticky top-0 z-10 bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="relative overflow-hidden whitespace-nowrap border px-2 py-1 text-left font-semibold text-ellipsis"
                    >
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex w-full items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getIsSorted() === "asc" && <ArrowUpNarrowWide className="h-4 w-4" />}
                        {header.column.getIsSorted() === "desc" && <ArrowDownWideNarrow className="h-4 w-4" />}
                      </button>
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-gray-300"
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {filteredRowCount > 0 ? (
                filteredRows.map((row) => {
                  const isSelected =
                    selectedRow?.sucafina_plot_id === row.original.standardRow.sucafina_plot_id;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRowSelect?.(isSelected ? null : row.original.standardRow)}
                      aria-selected={isSelected}
                      className={`cursor-pointer hover:bg-slate-100 ${isSelected ? "bg-[#00777f]/20 hover:bg-sky-100" : ""}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="overflow-hidden whitespace-nowrap border px-2 py-1 text-ellipsis"
                        >
                          <div className="w-full overflow-hidden whitespace-nowrap text-ellipsis">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : showNoMatchingData ? (
                <tr>
                  <td
                    colSpan={Math.max(columns.length, 1)}
                    className="border px-2 py-4 text-center text-muted-foreground"
                  >
                    No matching data
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Standard1;
