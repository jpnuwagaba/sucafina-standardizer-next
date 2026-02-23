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
import { ArrowUpNarrowWide , ArrowDownWideNarrow } from 'lucide-react';

type Standard1Props = {
  rows: Standard1Row[];
  onVisibleRowsChange?: (rows: Standard1Row[]) => void;
  onRowSelect?: (row: Standard1Row) => void;
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
  { accessorKey: "plot_gps_polygon", header: "plot_gps_polygon" },
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

  React.useEffect(() => {
    // New uploads should start from a clean table view.
    setSorting([]);
    setGlobalFilter("");
  }, [rows]);

  const table = useReactTable({
    data: rows,
    columns,
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

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="flex items-center gap-2 pb-2">
        <input
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Search all columns..."
          className="w-full max-w-sm rounded border px-2 py-1 text-sm"
        />        
        <div className="ml-auto text-xs text-slate-600">
          {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length} rows
        </div>
      </div>
      <div className="h-[calc(100%-40px)] w-full overflow-auto">
        <table className="w-max min-w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="relative border px-2 py-1 text-left font-semibold whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="inline-flex items-center gap-1"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {header.column.getIsSorted() === "asc" && <ArrowUpNarrowWide  className="w-4 h-4" />}
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
                  onClick={() => onRowSelect?.(row.original)}
                  aria-selected={isSelected}
                  className={`cursor-pointer hover:bg-slate-100 ${
                    isSelected ? "bg-[#00777f]/20 hover:bg-sky-100" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="border px-2 py-1 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
