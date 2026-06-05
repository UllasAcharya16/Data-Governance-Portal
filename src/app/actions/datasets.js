"use server";

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addDatasetAction(
  name,
  description,
  owner,
  refresh,
  domain,
  status
) {
  const db = getDb();
  try {
    db.prepare(`
      INSERT INTO metadata_datasets (dataset_name, business_description, owner_team, refresh_frequency, domain_name, certification_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, description, owner, refresh, domain, status);
    revalidatePath('/catalog');
    return { success: true };
  } catch (error) {
    console.error("Failed to add dataset metadata:", error);
    return { success: false, error: error.message || "Unique constraint violation or database error" };
  }
}

export async function editDatasetAction(
  id,
  name,
  description,
  owner,
  refresh,
  domain,
  status
) {
  const db = getDb();
  try {
    db.prepare(`
      UPDATE metadata_datasets
      SET dataset_name = ?, business_description = ?, owner_team = ?, refresh_frequency = ?, domain_name = ?, certification_status = ?
      WHERE id = ?
    `).run(name, description, owner, refresh, domain, status, id);
    revalidatePath('/catalog');
    return { success: true };
  } catch (error) {
    console.error("Failed to edit dataset metadata:", error);
    return { success: false, error: error.message || "Database update error" };
  }
}

export async function deleteDatasetAction(id) {
  const db = getDb();
  try {
    db.prepare(`
      DELETE FROM metadata_datasets WHERE id = ?
    `).run(id);
    revalidatePath('/catalog');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete dataset metadata:", error);
    return { success: false, error: error.message || "Database delete error" };
  }
}
