import React from "react";
import { getDb } from "@/lib/db";
import DataplexManager from "@/components/DataplexManager";
import { Layers } from "lucide-react";

export const revalidate = 0;

export default function DataplexPage() {
  let assets = [];

  try {
    const db = getDb();
    assets = db.prepare("SELECT * FROM dataplex_architecture").all();
  } catch (error) {
    console.error("Failed to query Dataplex architecture assets:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            Inspect data organization zones within Google Cloud Dataplex (Raw
            landing buckets, Curated tables, and Sandbox environments).
          </p>
        </div>
      </div>

      <DataplexManager assets={assets} />
    </div>
  );
}
