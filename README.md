# Enterprise Governance Portal

## Demo

https://data-governance-portal.vercel.app

## Project Overview

Enterprise Governance Portal is a cloud-enabled Data Governance and Analytics platform built using Next.js, React, SQLite, and Google BigQuery.

The application helps organizations manage data governance activities including:

* Business Glossary Management
* Governance Tag Management
* Metadata Catalog Discovery
* Data Quality Monitoring
* Data Profiling Analysis
* Data Lineage Visualization
* Dataplex Lake Architecture Management

The platform demonstrates modern Data Governance concepts commonly used in enterprise data platforms and Google Cloud environments.

---

## Architecture

### Hybrid Data Architecture

The application uses a hybrid architecture:

#### Governance Metadata Layer

Stored locally using SQLite.

Tables include:

* glossary
* governance_tags
* metadata_catalog
* metadata_datasets
* lineage_nodes
* lineage_edges
* governance_policies

#### Analytics Layer

Stored in Google BigQuery.

Dataset:

gcp_dashboard

Analytics Table:

sample_sales

This architecture simulates a real-world enterprise environment where governance metadata and analytical workloads are managed separately.

---

## Technology Stack

### Frontend

* Next.js 16
* React 19
* Tailwind CSS
* Lucide React
* Recharts

### Backend

* Next.js API Routes
* Node.js

### Databases

* SQLite (Governance Metadata)
* Google BigQuery (Analytics Data)

### Cloud Platform

* Google Cloud Platform (GCP)
* BigQuery
* Google Cloud SDK
* Application Default Credentials (ADC)

---

## Features

### Business Glossary

Centralized repository for business definitions.

Example:

Net Revenue = Revenue after returns and discounts, excluding tax and shipping.

### Governance Tags

Classification and metadata tagging for datasets.

Examples:

* Public
* Internal
* Sensitive
* Highly Confidential

### Metadata Catalog

Provides searchable dataset ownership and documentation.

### Data Profiling

Analyzes datasets and reports:

* Row Count
* Null Count
* Distinct Values
* Minimum Values
* Maximum Values
* Suspicious Records

### Data Quality Monitoring

Validates data using business rules.

Examples:

* Revenue > 0
* Month IS NOT NULL
* Successful Orders >= 0

### Data Lineage

Visualizes data flow:

Cloud Storage
→ BigQuery Raw Layer
→ Reporting Layer
→ Dashboard

### Dataplex Architecture

Demonstrates:

* Commerce Lake
* Operations Lake
* Marketing Lake
* Raw Zone
* Curated Zone
* Analytics Zone

---

## BigQuery Integration

The application uses Google BigQuery as the analytics backend.

### Dataset

gcp_dashboard

### Table

sample_sales

### Authentication

Local development uses:

gcloud auth application-default login

Application Default Credentials (ADC)

No service account JSON key is required for local development.

---

## Environment Variables

```env
USE_GCP_DB=true
GOOGLE_PROJECT_ID=governance-demo-498517
BIGQUERY_DATASET=gcp_dashboard
```

---

## Running Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

---

## Resume Highlights

* Built a Data Governance Portal using Next.js and React.
* Integrated Google BigQuery for real-time analytics and data quality monitoring.
* Implemented data profiling and governance dashboards.
* Designed hybrid architecture using SQLite and BigQuery.
* Applied Google Cloud authentication using Application Default Credentials.
* Developed cloud-native analytics workflows using GCP services.

---

## Future Enhancements

* Full BigQuery migration
* Cloud Storage integration
* Dataplex API integration
* Role-Based Access Control (RBAC)
* Real-time data ingestion pipelines
* Looker Studio dashboards

---

## License

MIT License
