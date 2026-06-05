import React from "react";
import { getDb } from "@/lib/db";
import TagManager from "@/components/TagManager";
import { Tag } from "lucide-react";

export const revalidate = 0;

export default function TagsPage() {
  let tags = [];
  let assignedTags = [];

  try {
    const db = getDb();
    tags = db
      .prepare("SELECT * FROM governance_tags ORDER BY asset_count DESC")
      .all();
    assignedTags = db
      .prepare("SELECT * FROM assigned_tags ORDER BY asset_name ASC")
      .all();
  } catch (error) {
    console.error("Failed to query governance tags:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <Tag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            Define tagging schemas (such as Data_Governance_Template) and assign
            confidentiality levels, retention, and stewards to database tables.
          </p>
        </div>
      </div>

      <TagManager initialTags={tags} initialAssignedTags={assignedTags} />
    </div>
  );
}
