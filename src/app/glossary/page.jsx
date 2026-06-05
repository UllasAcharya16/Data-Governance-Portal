import React from "react";
import { getDb } from "@/lib/db";
import GlossarySearch from "@/components/GlossarySearch";
import { BookOpen } from "lucide-react";

export const revalidate = 0;

export default function GlossaryPage() {
  let glossaryTerms = [];

  try {
    const db = getDb();
    glossaryTerms = db
      .prepare("SELECT * FROM glossary ORDER BY term ASC")
      .all();
  } catch (error) {
    console.error("Failed to query glossary terms:", error);
  }

  return (
    <div className="space-y-6">
      {/* Page description */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            Enterprise glossary definition list representing official taxonomy,
            owners, and regulatory approval status.
          </p>
        </div>
      </div>

      {/* Interactive List */}
      <GlossarySearch initialTerms={glossaryTerms} />
    </div>
  );
}
