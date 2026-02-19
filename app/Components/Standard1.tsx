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

type Standard1Row = {
  sucafina_plot_id: string;
  supplier_plot_id: string;
  farmer_id: string;
  supplier_code: string;
  plot_region: string;
  plot_district: string;
  plot_area_ha: number | null;
  plot_longitude: number | null;
  plot_latitude: number | null;
  plot_gps_point: string;
  plot_gps_polygon: string;
  plot_wkt: string;
  is_geodata_validated: boolean | null;
  is_cafe_practices_certified: boolean | null;
  is_rfa_utz_certified: boolean | null;
  is_impact_certified: boolean | null;
  is_organic_certified: boolean | null;
  is_4c_certified: boolean | null;
  is_fairtrade_certified: boolean | null;
  other_certification_name: string;
  plot_supply_chain: string;
  plot_farmer_group: string;
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

const data: Standard1Row[] = [
  {
    sucafina_plot_id: "SUC-0001",
    supplier_plot_id: "SUP-PLT-1001",
    farmer_id: "FARM-9001",
    supplier_code: "UG-KLA-01",
    plot_region: "Central",
    plot_district: "Mukono",
    plot_area_ha: 1.75,
    plot_longitude: 32.8012,
    plot_latitude: 0.3541,
    plot_gps_point: "POINT(32.8012 0.3541)",
    plot_gps_polygon: "POLYGON((32.8009 0.3539,32.8015 0.3539,32.8015 0.3543,32.8009 0.3543,32.8009 0.3539))",
    plot_wkt: "POINT(32.8012 0.3541)",
    is_geodata_validated: true,
    is_cafe_practices_certified: true,
    is_rfa_utz_certified: false,
    is_impact_certified: true,
    is_organic_certified: false,
    is_4c_certified: true,
    is_fairtrade_certified: false,
    other_certification_name: "Rainforest Pilot",
    plot_supply_chain: "Direct Trade",
    plot_farmer_group: "Mukono Growers A",
  },
  {
    sucafina_plot_id: "SUC-0002",
    supplier_plot_id: "SUP-PLT-1002",
    farmer_id: "FARM-9002",
    supplier_code: "UG-MBR-03",
    plot_region: "Western",
    plot_district: "Mbarara",
    plot_area_ha: 2.2,
    plot_longitude: 30.6461,
    plot_latitude: -0.6072,
    plot_gps_point: "POINT(30.6461 -0.6072)",
    plot_gps_polygon: "POLYGON((30.6457 -0.6075,30.6465 -0.6075,30.6465 -0.6069,30.6457 -0.6069,30.6457 -0.6075))",
    plot_wkt: "POINT(30.6461 -0.6072)",
    is_geodata_validated: true,
    is_cafe_practices_certified: false,
    is_rfa_utz_certified: true,
    is_impact_certified: false,
    is_organic_certified: true,
    is_4c_certified: false,
    is_fairtrade_certified: true,
    other_certification_name: "",
    plot_supply_chain: "Cooperative",
    plot_farmer_group: "Ankole Coffee Union",
  },
  {
    sucafina_plot_id: "SUC-0003",
    supplier_plot_id: "SUP-PLT-1003",
    farmer_id: "FARM-9003",
    supplier_code: "UG-GUL-08",
    plot_region: "Northern",
    plot_district: "Gulu",
    plot_area_ha: 0.95,
    plot_longitude: 32.299,
    plot_latitude: 2.7746,
    plot_gps_point: "POINT(32.299 2.7746)",
    plot_gps_polygon: "POLYGON((32.2987 2.7743,32.2993 2.7743,32.2993 2.7749,32.2987 2.7749,32.2987 2.7743))",
    plot_wkt: "POINT(32.299 2.7746)",
    is_geodata_validated: false,
    is_cafe_practices_certified: null,
    is_rfa_utz_certified: null,
    is_impact_certified: false,
    is_organic_certified: null,
    is_4c_certified: false,
    is_fairtrade_certified: null,
    other_certification_name: "Pending verification",
    plot_supply_chain: "Aggregator",
    plot_farmer_group: "Acholi Producers B",
  },
];

const Standard1 = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
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

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="flex items-center gap-2 pb-2">
        <input
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Search all columns..."
          className="w-full max-w-sm rounded border px-2 py-1 text-sm"
        />
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
                    {{
                      asc: "(asc)",
                      desc: "(desc)",
                    }[header.column.getIsSorted() as string] ?? ""}
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
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
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
              ))
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
