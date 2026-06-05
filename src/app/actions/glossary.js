"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTermAction(term, definition, owner, category) {
  const db = getDb();
  try {
    db.prepare(
      `
      INSERT INTO glossary (term, definition, category, owner, status)
      VALUES (?, ?, ?, ?, 'Approved')
    `,
    ).run(term, definition, category, owner);
    revalidatePath("/glossary");
    return { success: true };
  } catch (error) {
    console.error("Failed to add glossary term:", error);
    return {
      success: false,
      error: error.message || "Unique constraint violation or database error",
    };
  }
}

export async function editTermAction(id, term, definition, owner, category) {
  const db = getDb();
  try {
    db.prepare(
      `
      UPDATE glossary
      SET term = ?, definition = ?, category = ?, owner = ?
      WHERE id = ?
    `,
    ).run(term, definition, category, owner, id);
    revalidatePath("/glossary");
    return { success: true };
  } catch (error) {
    console.error("Failed to edit glossary term:", error);
    return { success: false, error: error.message || "Database update error" };
  }
}

export async function deleteTermAction(id) {
  const db = getDb();
  try {
    db.prepare(
      `
      DELETE FROM glossary WHERE id = ?
    `,
    ).run(id);
    revalidatePath("/glossary");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete glossary term:", error);
    return { success: false, error: error.message || "Database delete error" };
  }
}
