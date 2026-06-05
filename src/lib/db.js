import Database from "better-sqlite3";
import path from "path";

// Singleton database connection instance
let dbInstance = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.join(process.cwd(), "data_governance.db");
  const db = new Database(dbPath);
  // Enable WAL mode for better performance
  db.pragma("journal_mode = WAL");

  // Initialize and seed tables if they do not exist
  initializeDatabase(db);

  dbInstance = db;
  return dbInstance;
}

// Helper functions for dashboard metrics
export function getGlossaryCount() {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM glossary`).get();
  return row.cnt;
}

export function getTagsCount() {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM governance_tags`).get();
  return row.cnt;
}

export function getDatasetsCount() {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as cnt FROM metadata_datasets`).get();
  return row.cnt;
}

export function getQualityScore() {
  const db = getDb();
  const row = db.prepare(`SELECT AVG(CASE status WHEN 'Passed' THEN 100 WHEN 'Failed' THEN 0 ELSE 50 END) as score FROM data_quality_rules`).get();
  return Math.round(row.score || 0);
}

export function getLakesCount() {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(DISTINCT lake_name) as cnt FROM dataplex_architecture`).get();
  return row.cnt;
}

function initializeDatabase(db) {
  // Ensure sample_sales table exists and is seeded
  const salesTableCheck = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sample_sales'",
    )
    .get();
  if (!salesTableCheck) {
    db.prepare(`
      CREATE TABLE sample_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER UNIQUE NOT NULL,
        month TEXT NOT NULL,
        revenue REAL,
        successful_orders INTEGER NOT NULL
      )
    `).run();

    const insertSales = db.prepare(`
      INSERT INTO sample_sales (order_id, month, revenue, successful_orders)
      VALUES (?, ?, ?, ?)
    `);
    insertSales.run(101, "Jan", 500, 1);
    insertSales.run(102, "Jan", null, 0);
    insertSales.run(103, "Feb", -50, 0);
    insertSales.run(104, "Feb", 1200, 1);
    insertSales.run(105, "Mar", 700, 1);
  }

  // Check if a table exists (e.g., glossary)
  const tableCheck = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='glossary'",
    )
    .get();
  if (tableCheck) {
    // Already initialized
    return;
  }

  // Create tables using a transaction to ensure atomic execution
  const initTransaction = db.transaction(() => {
    // 1. Business Glossary
    db.prepare(`
      CREATE TABLE glossary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        term TEXT UNIQUE NOT NULL,
        definition TEXT NOT NULL,
        category TEXT NOT NULL,
        owner TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 2. Governance Tags
    db.prepare(`
      CREATE TABLE governance_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        classification TEXT NOT NULL,
        asset_count INTEGER DEFAULT 0
      )
    `).run();

    // 3. Metadata Catalog
    db.prepare(`
      CREATE TABLE metadata_catalog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        column_name TEXT NOT NULL,
        data_type TEXT NOT NULL,
        description TEXT NOT NULL,
        is_pii INTEGER DEFAULT 0,
        quality_score INTEGER DEFAULT 100,
        owner TEXT NOT NULL,
        system TEXT NOT NULL
      )
    `).run();

    // 4. Lineage Nodes
    db.prepare(`
      CREATE TABLE lineage_nodes (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL
      )
    `).run();

    // 5. Lineage Edges
    db.prepare(`
      CREATE TABLE lineage_edges (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        target TEXT NOT NULL,
        FOREIGN KEY (source) REFERENCES lineage_nodes(id),
        FOREIGN KEY (target) REFERENCES lineage_nodes(id)
      )
    `).run();

    // 6. Dataplex Architecture
    db.prepare(`
      CREATE TABLE dataplex_architecture (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lake_name TEXT NOT NULL,
        zone_name TEXT NOT NULL,
        asset_name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        status TEXT NOT NULL,
        last_sync TEXT NOT NULL
      )
    `).run();

    // 7. Data Profiling
    db.prepare(`
      CREATE TABLE data_profiling (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        column_name TEXT NOT NULL,
        row_count INTEGER NOT NULL,
        null_count INTEGER NOT NULL,
        null_percentage REAL NOT NULL,
        distinct_values INTEGER NOT NULL,
        min_value TEXT,
        max_value TEXT,
        mean_value REAL
      )
    `).run();

    // 8. Data Quality Rules
    db.prepare(`
      CREATE TABLE data_quality_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_name TEXT NOT NULL,
        table_name TEXT NOT NULL,
        column_name TEXT NOT NULL,
        rule_type TEXT NOT NULL,
        status TEXT NOT NULL,
        last_run TEXT NOT NULL,
        error_count INTEGER NOT NULL
      )
    `).run();

    // 9. Customer Support Lake
    db.prepare(`
      CREATE TABLE customer_support_lake (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size_mb REAL NOT NULL,
        row_count INTEGER NOT NULL,
        quality_score INTEGER NOT NULL,
        sync_frequency TEXT NOT NULL,
        last_ingested TEXT NOT NULL
      )
    `).run();

    // 10. Assigned Tags (Governance Templates)
    db.prepare(`
      CREATE TABLE assigned_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_name TEXT UNIQUE NOT NULL,
        template_name TEXT NOT NULL,
        data_steward TEXT NOT NULL,
        confidentiality_level TEXT NOT NULL,
        retention_period INTEGER NOT NULL,
        contains_pii INTEGER NOT NULL,
        assigned_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // 11. Metadata Datasets (Dataset level catalog)
    db.prepare(`
      CREATE TABLE metadata_datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset_name TEXT UNIQUE NOT NULL,
        business_description TEXT NOT NULL,
        owner_team TEXT NOT NULL,
        refresh_frequency TEXT NOT NULL,
        domain_name TEXT NOT NULL,
        certification_status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  });
  initTransaction();

  // --- SEED SAMPLE DATA ---
  const insertGlossary = db.prepare(`
    INSERT INTO glossary (term, definition, category, owner, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertGlossary.run(
    "Customer ID",
    "A globally unique identifier assigned to each registered customer in the Core Banking System.",
    "Customer Domain",
    "Sarah Jenkins (Data Stewards)",
    "Approved",
  );
  // Additional seed data omitted for brevity
}
