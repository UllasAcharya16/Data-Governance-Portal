import React from "react";
import { getDb } from "@/lib/db";
import SupportLakeViewer from "@/components/SupportLakeViewer";
import { LifeBuoy } from "lucide-react";

export const revalidate = 0;

export default function SupportLakePage() {
  let files = [];

  try {
    const db = getDb();
    files = db
      .prepare(
        "SELECT * FROM customer_support_lake ORDER BY last_ingested DESC",
      )
      .all();
  } catch (error) {
    console.error("Failed to query customer support lake files:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            Deep-dive operational monitoring of Zendesk support ticket logs,
            customer feedback CSVs, and chat archives in the Raw lake zone.
          </p>
        </div>
      </div>

      <SupportLakeViewer initialFiles={files} />
    </div>
  );
}
