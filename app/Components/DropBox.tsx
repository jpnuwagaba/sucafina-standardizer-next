"use client";

import React from "react";
import { Upload } from "lucide-react";

import type { Standard1Row } from "@/app/data/standard1";
import { parseStandard1CsvFile } from "@/lib/ingestion/standard1Csv";

type DropBoxProps = {
  onDataLoaded: (rows: Standard1Row[]) => void;
  onUnsupportedData: () => void;
};

export default function DropBox({ onDataLoaded, onUnsupportedData }: DropBoxProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);

  const handleFile = React.useCallback(
    async (file: File | null) => {
      if (!file) return;

      const result = await parseStandard1CsvFile(file);
      if (!result.ok) {
        onUnsupportedData();
        return;
      }

      onDataLoaded(result.rows);
    },
    [onDataLoaded, onUnsupportedData],
  );

  return (
    <div className="h-full w-full p-4">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);
          const file = event.dataTransfer.files?.[0] ?? null;
          void handleFile(file);
        }}
        className={`flex h-full w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-4 text-center transition-colors ${
          isDragActive
            ? "border-[#00777f] bg-[#00777f]/10"
            : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
      >
        <Upload className="h-8 w-8 text-slate-600" />
        <div className="text-sm font-medium text-slate-800">
          Add Data
        </div>
        <div className="text-xs text-slate-600">or</div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded border border-slate-400 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100 cursor-pointer"
        >
          Browse Files
        </button>
        {/* <div className="text-xs text-slate-500">
          Required: CSV with all 22 Standard1 columns.
        </div> */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.currentTarget.value = "";
            void handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
