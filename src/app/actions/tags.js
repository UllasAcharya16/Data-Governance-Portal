"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function assignTagAction(
  assetName,
  steward,
  confidentiality,
  retention,
  containsPii,
) {
  const db = getDb();
  try {
    db.prepare(
      `
      INSERT INTO assigned_tags (asset_name, template_name, data_steward, confidentiality_level, retention_period, contains_pii)
      VALUES (?, 'Data_Governance_Template', ?, ?, ?, ?)
      ON CONFLICT(asset_name) DO UPDATE SET
        data_steward = excluded.data_steward,
        confidentiality_level = excluded.confidentiality_level,
        retention_period = excluded.retention_period,
        contains_pii = excluded.contains_pii
    `,
    ).run(assetName, steward, confidentiality, retention, containsPii ? 1 : 0);
    revalidatePath("/tags");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign governance tag:", error);
    return { success: false, error: error.message || "Failed to update tag." };
  }
}

export async function removeTagAction(id) {
  const db = getDb();
  try {
    db.prepare(
      `
      DELETE FROM assigned_tags WHERE id = ?
    `,
    ).run(id);
    revalidatePath("/tags");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete assigned tag:", error);
    return { success: false, error: error.message || "Failed to delete tag." };
  }
}
