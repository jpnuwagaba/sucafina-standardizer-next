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
import type { Standard1Row } from "@/app/data/standard1";
import { ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';

type Standard1Props = {
  rows: Standard1Row[];
  onVisibleRowsChange?: (rows: Standard1Row[]) => void;
  onRowSelect?: (row: Standard1Row | null) => void;
  selectedRow?: Standard1Row | null;
};

const columns: ColumnDef<Standard1Row>[] = [
  { accessorKey: "sucafina_plot_id", header: "sucafina_plot_id" },
  { accessorKey: "supplier_plot_id", header: "supplier_plot_id" },
  { accessorKey: "farmer_id", header: "farmer_id" },
  { accessorKey: "supplier_code", header: "supplier_code" },
  { accessorKey: "plot_region", header: "plot_region" },
  { accessorKey: "plot_district", header: "plot_district" },
  { accessorKey: "plot_area_ha", header: "plot_area_ha" },
  { accessorKey: "plot_longitude", header: "plot_longitude" },
  { accessorKey: "plot_latitude", header: "plot_latitude" },
  { accessorKey: "plot_gps_point", header: "plot_gps_point" },
  {
    accessorKey: "plot_gps_polygon",
    header: "plot_gps_polygon",
    size: 220,
    minSize: 80,
    maxSize: 320,
  },
  { accessorKey: "plot_wkt", header: "plot_wkt" },
  { accessorKey: "is_geodata_validated", header: "is_geodata_validated" },
  {
    accessorKey: "is_cafe_practices_certified",
    header: "is_cafe_practices_certified",
  },
  { accessorKey: "is_rfa_utz_certified", header: "is_rfa_utz_certified" },
  { accessorKey: "is_impact_certified", header: "is_impact_certified" },
  { accessorKey: "is_organic_certified", header: "is_organic_certified" },
  { accessorKey: "is_4c_certified", header: "is_4c_certified" },
  { accessorKey: "is_fairtrade_certified", header: "is_fairtrade_certified" },
  {
    accessorKey: "other_certification_name",
    header: "other_certification_name",
  },
  { accessorKey: "plot_supply_chain", header: "plot_supply_chain" },
  { accessorKey: "plot_farmer_group", header: "plot_farmer_group" },
];

const Standard1 = ({
  rows,
  onVisibleRowsChange,
  onRowSelect,
  selectedRow = null,
}: Standard1Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // New uploads should start from a clean table view.
    setSorting([]);
    setGlobalFilter("");
  }, [rows]);

  const table = useReactTable({
    data: rows,
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

  const visibleRows = table.getRowModel().rows.map((row) => row.original);
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
          placeholder="Search Records or Press Ctrl+K"
          className="w-full max-w-sm rounded border px-2 py-1 text-sm"
        />
        <div className="ml-auto text-xs text-slate-600">
          {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length} rows
        </div>
        {/* vertical divider */}
        <div className="w-px h-4 bg-slate-300" />
        <div className="flex flex-row items-center">
          <div className="flex flex-row items-center mr-2">
            <div className="w-3 h-3 rounded-full bg-[#16a34a] mr-1" />
            <div className="text-xs text-slate-600">Default</div>
          </div>
          <div className="flex flex-row items-center mr-2">
            <div className="w-3 h-3 rounded-full bg-[#facc15] mr-1" />
            <div className="text-xs text-slate-600">Selected</div>
          </div>
          <div className="flex flex-row items-center mr-2">
            <div className="w-3 h-3 rounded-full bg-[#f97316] mr-1" />
            <div className="text-xs text-slate-600">Filtered</div>
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-40px)] w-full overflow-auto">
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
                    className="relative border px-2 py-1 text-left font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
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
                      {header.column.getIsSorted() === "asc" && <ArrowUpNarrowWide className="w-4 h-4" />}
                      {header.column.getIsSorted() === "desc" && <ArrowDownWideNarrow className="w-4 h-4" />}
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const isSelected =
                  selectedRow?.sucafina_plot_id === row.original.sucafina_plot_id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowSelect?.(isSelected ? null : row.original)}
                    aria-selected={isSelected}
                    className={`cursor-pointer hover:bg-slate-100 ${isSelected ? "bg-[#00777f]/20 hover:bg-sky-100" : ""
                      }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="border px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border px-2 py-4 text-center text-muted-foreground"
                >
                  No matching data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standard1;
