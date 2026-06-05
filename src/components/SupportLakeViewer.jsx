"use client";

import React, { useState } from "react";
import {
  Search,
  FileSpreadsheet,
  FileCode,
  FileJson,
  Database,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SupportLakeViewer({ initialFiles }) {
  const [files, setFiles] = useState(initialFiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isSyncing, setIsSyncing] = useState(false);

  // Aggregates
  const totalSize = files
    .reduce((acc, f) => acc + f.file_size_mb, 0)
    .toFixed(1);
  const totalRows = files
    .reduce((acc, f) => acc + f.row_count, 0)
    .toLocaleString();
  const avgQuality = files.length
    ? Math.round(
        files.reduce((acc, f) => acc + f.quality_score, 0) / files.length,
      )
    : 100;

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.file_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || f.file_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case "CSV":
        return FileSpreadsheet;
      case "JSON":
        return FileJson;
      default:
        return FileCode; // Parquet
    }
  };

  const getFileIconColor = (type) => {
    switch (type) {
      case "CSV":
        return "text-emerald-500 bg-emerald-500/10";
      case "JSON":
        return "text-amber-500 bg-amber-500/10";
      default:
        return "text-sky-500 bg-sky-500/10"; // Parquet
    }
  };

  const handleSyncLake = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Simulate sync adding a new incoming batch file
      const dateStr = new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);
      const newFile = {
        id: files.length + 1,
        file_name: `zendesk_tickets_delta_${Date.now().toString().slice(-4)}.json`,
        file_type: "JSON",
        file_size_mb: 1.4,
        row_count: 3200,
        quality_score: 98,
        sync_frequency: "Hourly",
        last_ingested: dateStr,
      };
      setFiles([newFile, ...files]);
      setIsSyncing(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Aggregates Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Total Lake Volume
            </span>
            <div className="text-3xl font-extrabold text-text-primary mt-1">
              {totalSize} MB
            </div>
            <p className="text-xs text-text-muted mt-2">
              Active storage across S3/GCS buckets.
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <Database className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Total Records
            </span>
            <div className="text-3xl font-extrabold text-text-primary mt-1">
              {totalRows}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Ingested customer service transactions.
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Lake Integrity
            </span>
            <div className="text-3xl font-extrabold text-text-primary mt-1">
              {avgQuality}%
            </div>
            <p className="text-xs text-text-muted mt-2">
              Weighted average data quality rating.
            </p>
          </div>
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              avgQuality >= 95
                ? "bg-emerald-500/10 text-success"
                : "bg-amber-500/10 text-warning"
            }`}
          >
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Sync bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-card-border bg-gradient-to-r from-accent-light/40 to-card">
        <div>
          <h3 className="font-bold text-sm text-text-primary">
            Zendesk & Salesforce Ingestion Feed
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Continuous sync schedules are active. Click to run manual sync
            execution.
          </p>
        </div>
        <button
          onClick={handleSyncLake}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Ingesting Feeds..." : "Sync Feed Now"}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-card py-2 pl-10 pr-4 text-sm text-text-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-text-muted font-semibold uppercase">
            File Type:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-card-border bg-card py-1.5 px-3 text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="All">All Formats</option>
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
            <option value="Parquet">Parquet</option>
          </select>
        </div>
      </div>

      {/* Files Grid */}
      <div className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-bold text-xs uppercase bg-background/40">
                <th className="py-3 px-6">File Name</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Size</th>
                <th className="py-3 px-6">Row Count</th>
                <th className="py-3 px-6">Integrity Score</th>
                <th className="py-3 px-6">Sync Schedule</th>
                <th className="py-3 px-6 text-right">Last Ingested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.file_type);
                const iconColor = getFileIconColor(file.file_type);
                return (
                  <tr key={file.id} className="hover:bg-background/25">
                    <td className="py-4 px-6 font-semibold text-text-primary flex items-center gap-2.5">
                      <div className={`p-1.5 rounded ${iconColor}`}>
                        <FileIcon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs">
                        {file.file_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-xs font-bold">
                      {file.file_type}
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-xs">
                      {file.file_size_mb} MB
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-xs">
                      {file.row_count.toLocaleString()} rows
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`font-bold text-xs ${
                          file.quality_score >= 95
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {file.quality_score}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex rounded-full bg-background border border-card-border px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                        {file.sync_frequency}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-text-muted text-xs font-medium">
                      {file.last_ingested}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
