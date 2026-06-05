// src/app/profiling/page.jsx

import React from "react";
import { getDb } from "@/lib/db";
import { getSampleSales } from "@/lib/bigquery";
import ProfilingViewer from "@/components/ProfilingViewer";
import { BarChart3 } from "lucide-react";

export const revalidate = 0;

export default async function ProfilingPage() {
  // SQLite data for profiling metadata
  const db = getDb();
  const profiling = db.prepare("SELECT * FROM data_profiling").all();

  // Sales data – use BigQuery when enabled, otherwise fallback to SQLite
  let salesData = [];
  if (process.env.USE_GCP_DB === "true") {
    try {
      salesData = await getSampleSales();
    } catch (err) {
      console.error("Failed to fetch sample_sales from BigQuery:", err);
    }
  } else {
    salesData = db.prepare("SELECT * FROM sample_sales ORDER BY order_id ASC").all();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            Inspect column distributions, nullability metrics, value ranges, and
            distinct value checks across cataloged datasets.
          </p>
        </div>
      </div>

      <ProfilingViewer initialProfiling={profiling} salesData={salesData} />
    </div>
  );
}
