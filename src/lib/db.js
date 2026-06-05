// src/lib/db.js

// Mock DB module for Vercel deployment
// Provides the same API as the original SQLite implementation using static mock data.

import { glossary, tags, datasets, qualityRules, lineage, profiling, assignedTags } from "@/data/mockData";

/**
 * Simple query executor that understands the subset of SQL used in the app.
 * Returns either an array (for SELECT * queries) or an object for scalar results.
 */
function executeQuery(sql) {
  const q = sql.trim().toLowerCase();

  // ----- Count queries -----
  if (q.includes("count(*) as count from glossary")) return { count: glossary.length };
  if (q.includes("count(*) as count from governance_tags")) return { count: tags.length };
  if (q.includes("count(*) as count from metadata_catalog")) {
    const tables = new Set(profiling.map(p => p.table_name));
    return { count: tables.size };
  }
  if (q.includes("count(*) as count from metadata_datasets")) return { count: datasets.length };
  if (q.includes("count(*) as count from sample_sales")) return { count: 0 }; // fallback, real data via BigQuery

  // ----- Average quality score -----
  if (q.includes("avg(quality_score) as score")) {
    const scores = profiling.map(p => p.quality_score).filter(v => typeof v === "number");
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { score: avg };
  }

  // ----- Generic SELECT * queries -----
  if (q.includes("select * from glossary")) return glossary;
  if (q.includes("select * from governance_tags")) return tags;
  if (q.includes("select * from assigned_tags")) return assignedTags;
  if (q.includes("select * from metadata_datasets")) return datasets;
  if (q.includes("select * from data_quality_rules")) return qualityRules;
  if (q.includes("select * from metadata_catalog")) return profiling;
  if (q.includes("select * from sample_sales")) return []; // real data via BigQuery

  // Default empty result
  return [];
}

// Export count helpers
export function getGlossaryCount() { return glossary.length; }
export function getTagsCount() { return tags.length; }
export function getDatasetsCount() { return datasets.length; }

export function getQualityScore() {
  if (!qualityRules.length) return 0;
  const total = qualityRules.reduce((sum, r) => (r.status === "Passed" ? sum + 100 : sum + 0), 0);
  return Math.round(total / qualityRules.length);
}

export function getLakesCount() {
  if (!lineage?.nodes) return 0;
  const lakeNames = new Set(lineage.nodes.filter(n => n.type === "lake").map(n => n.label));
  return lakeNames.size;
}

// Additional getters mirroring original API
export function getAllGlossary() { return glossary; }
export function getAllGovernanceTags() { return tags; }
export function getAllAssignedTags() { return assignedTags; }
export function getAllQualityRules() { return qualityRules; }
export function getAllLineage() { return lineage; }
export function getAllDataplex() { return []; }
export function getAllProfiling() { return profiling; }
export function getAllSupportLake() { return []; }

/** Compatibility layer mimicking the subset of the SQLite API used by the app */
export function getDb() {
  return {
    prepare: sql => {
      const result = executeQuery(sql);
      const isArray = Array.isArray(result);
      return {
        all: () => (isArray ? result : []),
        get: () => (!isArray ? result : undefined),
      };
    },
    // Direct get for scalar queries (e.g., count, avg)
    get: sql => executeQuery(sql),
  };
}
