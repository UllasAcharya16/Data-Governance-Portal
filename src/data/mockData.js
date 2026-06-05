// src/data/mockData.js
// Static mock data used to replace SQLite database for Vercel deployment.

// Sample sales data (used by quality validation)
export const sampleSales = [
  { id: 1, order_id: 101, month: "Jan", revenue: 500, successful_orders: 1 },
  { id: 2, order_id: 102, month: "Jan", revenue: null, successful_orders: 0 },
  { id: 3, order_id: 103, month: "Feb", revenue: -50, successful_orders: 0 },
  { id: 4, order_id: 104, month: "Feb", revenue: 1200, successful_orders: 1 },
  { id: 5, order_id: 105, month: "Mar", revenue: 700, successful_orders: 1 },
];

// Catalog metadata (metadata_catalog)
export const catalog = [
  {
    id: 1,
    table_name: "sample_sales",
    column_name: "order_id",
    data_type: "INTEGER",
    description: "Unique order identifier",
    is_pii: 0,
    quality_score: 95,
    owner: "Finance",
    system: "Core Banking",
  },
  // add more entries as needed
];

// Datasets metadata (metadata_datasets)
export const datasets = [
  {
    id: 1,
    dataset_name: "Sales_2023",
    business_description: "All sales transactions for 2023",
    owner_team: "Finance",
    refresh_frequency: "Daily",
    domain_name: "Revenue",
    certification_status: "Certified",
  },
];

// Glossary entries
export const glossary = [
  {
    id: 1,
    term: "Customer ID",
    definition:
      "Globally unique identifier for a customer in the Core Banking System.",
    category: "Customer Domain",
    owner: "Sarah Jenkins (Data Steward)",
    status: "Approved",
  },
];

// Governance tags
export const tags = [
  {
    id: 1,
    name: "PII",
    description: "Personally Identifiable Information",
    classification: "Sensitive",
    asset_count: 12,
  },
];

// Assigned tags (governance templates)
export const assignedTags = [
  {
    id: 1,
    asset_name: "sample_sales",
    template_name: "Data_Governance_Template",
    data_steward: "Sarah Jenkins",
    confidentiality_level: "High",
    retention_period: 365,
    contains_pii: 1,
    assigned_at: "2024-01-15",
  },
];

// Data quality rules
export const qualityRules = [
  {
    id: 1,
    rule_name: "Revenue > 0",
    table_name: "sample_sales",
    column_name: "revenue",
    rule_type: "numeric",
    status: "Passed",
    last_run: "2026-06-01",
    error_count: 0,
  },
  {
    id: 2,
    rule_name: "Month not empty",
    table_name: "sample_sales",
    column_name: "month",
    rule_type: "string",
    status: "Failed",
    last_run: "2026-06-01",
    error_count: 3,
  },
];

// Data profiling reports
export const profiling = [
  {
    id: 1,
    table_name: "sample_sales",
    column_name: "revenue",
    row_count: 5,
    null_count: 1,
    null_percentage: 20,
    distinct_values: 4,
    min_value: "-50",
    max_value: "1200",
    mean_value: 350,
  },
];

// Lineage data (dataplex architecture)
export const lineage = {
  nodes: [
    { id: "lake_raw", label: "Raw Lake", type: "lake", status: "active" },
    { id: "tbl_sales", label: "sample_sales", type: "table", status: "active" },
  ],
  edges: [
    { id: "e1", source: "lake_raw", target: "tbl_sales" },
  ],
};

// Governance policies
export const governancePolicies = [
  {
    id: 1,
    name: "Data Retention",
    description: "Data must be retained for 7 years.",
    enforcement: "Automated",
    last_review: "2025-12-15",
  },
];

// Export bundles for convenience
export const mockData = {
  sampleSales,
  catalog,
  datasets,
  glossary,
  tags,
  assignedTags,
  qualityRules,
  profiling,
  lineage,
  governancePolicies,
};
