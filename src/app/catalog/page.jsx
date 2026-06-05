import React from "react";
import { getDb } from "@/lib/db";
import CatalogSearch from "@/components/CatalogSearch";
import { Database } from "lucide-react";

export const revalidate = 0;

export default function CatalogPage() {
  let catalog = [];
  let datasets = [];

  try {
    const db = getDb();
    catalog = db
      .prepare("SELECT * FROM metadata_catalog ORDER BY table_name ASC, id ASC")
      .all();
    datasets = db
      .prepare("SELECT * FROM metadata_datasets ORDER BY dataset_name ASC")
      .all();
  } catch (error) {
    console.error("Failed to query catalog metadata or datasets:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            Search enterprise database tables, trace security access layers,
            inspect schema typings, and check data quality indices.
          </p>
        </div>
      </div>

      <CatalogSearch initialCatalog={catalog} initialDatasets={datasets} />
    </div>
  );
}
