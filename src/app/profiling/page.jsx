import React from "react";
import { getDb } from "@/lib/db";
import ProfilingViewer from "@/components/ProfilingViewer";
import { BarChart3 } from "lucide-react";

export const revalidate = 0;

export default function ProfilingPage() {
  let profiling = [];
  let salesData = [];

  try {
    const db = getDb();
    profiling = db.prepare("SELECT * FROM data_profiling").all();
    salesData = db.prepare("SELECT * FROM sample_sales ORDER BY order_id ASC").all();
  } catch (error) {
    console.error("Failed to query profiling data:", error);
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
