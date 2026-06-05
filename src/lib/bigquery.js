// src/lib/bigquery.js

import { BigQuery } from "@google-cloud/bigquery";

// The BigQuery client will use Application Default Credentials (ADC).
// When running locally ADC picks up the credentials from `gcloud auth application-default login`.
// In production you can supply a service‑account JSON via env vars if desired.
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_PROJECT_ID,
  // No explicit credentials – ADC will handle auth.
});

const dataset = process.env.BIGQUERY_DATASET; // e.g., "gcp_dashboard"

/**
 * Fetch all rows from the `sample_sales` table.
 * Returns an array of objects matching the SQLite schema.
 */
export async function getSampleSales() {
  const sql = `SELECT * FROM \`${process.env.GOOGLE_PROJECT_ID}.${dataset}.sample_sales\` ORDER BY order_id ASC`;
  const [rows] = await bigquery.query({
    query: sql,
    location: "US",
  });
  return rows;
}

/**
 * Generic query helper – useful for future extensions.
 */
export async function query(sql, params = []) {
  const [rows] = await bigquery.query({
    query: sql,
    params,
    location: "US",
  });
  return rows;
}
