# Enterprise Governance Portal

A **Next.js 16** application that provides a real‑time data‑governance dashboard backed by an **SQLite** database powered by `better-sqlite3`. The app showcases modern UI design (glass‑morphism cards, dark mode, micro‑animations) and implements a suite of API routes for data quality validation, lineage, profiling, and catalog management.

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Development](#setup--development)
- [Building & Deployment](#building--deployment)
- [Database](#database)
- [API Routes](#api-routes)
- [UI Components](#ui-components)
- [Design System & Styling](#design-system--styling)
- [Extending the Project](#extending-the-project)
- [Testing](#testing)
- [License](#license)

---

## Overview
The **Enterprise Governance Portal** visualises key metrics for data‑quality, taxonomy, lineage and lake health. It demonstrates:
- **Live SQLite queries** via a singleton `getDb()` helper.
- **Client‑only components** for interactive charts (Recharts) and stateful logic.
- **Server‑only routes** for secure data access (`app/api/**`).
- **Premium UI**: glass‑morphic cards, smooth hover transitions, dark‑mode ready, and custom fonts from Google Fonts (Inter).

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: JavaScript (ES Modules) – `package.json` sets `"type": "module"`
- **Database**: SQLite via `better-sqlite3`
- **Styling**: Vanilla CSS with Tailwind utilities (included for convenience)
- **UI Libraries**: 
  - `lucide-react` – icons
  - `recharts` – responsive charts
- **State Management**: React `useState` / `useEffect` in client components
- **Build Tools**: npm scripts (`dev`, `build`, `start`, `lint`)

---

## Project Structure
```
Assignment1/
├─ src/
│  ├─ app/                     # Next.js App Router pages & API routes
│  │   ├─ page.jsx              # Dashboard (home) – server component
│  │   ├─ quality/page.jsx      # Quality page – **client component**
│  │   ├─ profiling/page.jsx    # Profiling UI
│  │   ├─ lineage/page.jsx      # Data lineage visualiser
│  │   └─ api/
│  │       └─ quality/validate/route.js   # API endpoint for validation
│  ├─ components/               # Reusable UI components
│  │   ├─ DashboardCharts.jsx
│  │   ├─ QualityManager.jsx
│  │   ├─ DataplexManager.jsx
│  │   ├─ TagManager.jsx
│  │   ├─ … (12 total)
│  └─ lib/
│      └─ db.js                 # SQLite singleton helper (ESM)
├─ public/                      # Static assets (optional)
├─ styles/ or globals.css       # Global CSS (tailwind config lives in package.json)
├─ README.md                    # ← This file (project documentation)
└─ package.json
```

---

## Setup & Development
```bash
# Clone the repo (if not already local)
git clone <repo‑url>
cd Assignment1

# Install dependencies
npm install

# Run the development server (http://localhost:3000)
npm run dev
```
The server will automatically reload on file changes. If you encounter the "another next dev server is already running" error, terminate the stray process (`taskkill /PID <pid> /F`).

### Environment
- No additional environment variables are required; the SQLite file `data_governance.db` is created in the project root at runtime.
- Ensure Node.js ≥ 20 is installed (required for the latest React 19 features).

---

## Building & Deployment
```bash
# Create an optimized production build
npm run build

# Start the production server
npm run start
```
Deployment to Vercel is the recommended approach – the platform detects the Next.js framework automatically.

---

## Database
- **File**: `data_governance.db` (created on first request).
- **Schema**: Created lazily in `src/lib/db.js` – tables include:
  - `sample_sales` (demo sales data)
  - `glossary`, `governance_tags`, `metadata_catalog`, `metadata_datasets`
  - `data_quality_rules`, `dataplex_architecture`, `lineage_nodes`, `lineage_edges`
  - … plus several auxiliary tables for profiling and support lakes.
- **Access**: `getDb()` returns a singleton `Database` instance. All queries are performed using prepared statements.

---

## API Routes
| Route | Method | Description |
|------|--------|-------------|
| `/api/quality/validate` | GET | Executes simple quality checks on `sample_sales` and returns a JSON payload used by the Quality page.
| *(additional routes can be added under `src/app/api/...`)* |

All API routes live under `src/app/api/` and use the **Next.js server‑only** runtime (`next/server`). They import the DB helper via `import { getDb } from '@/lib/db'`.

---

## UI Components
- **DashboardCharts.jsx** – renders Recharts line/bar charts for quality & profiling.
- **QualityManager.jsx** – displays a table of rule results; receives `initialRules` as prop.
- **DataplexManager.jsx** – shows lake/zone sync alerts.
- **TagManager.jsx**, **GlossarySearch.jsx**, **CatalogSearch.jsx**, **LineageView.jsx**, etc. – each encapsulates a specific governance view.
- All components are **client components** (`"use client"` at the top) when they need React hooks or browser APIs.

---

## Design System & Styling
- **Typography**: Google Font *Inter* (imported via `next/font`).
- **Colors**: Dark‑mode palette with subtle gradients; uses CSS variables for easy theme switching.
- **Micro‑animations**: Tailwind utility classes such as `transition-shadow`, `hover:shadow-md`, `animate-fadeIn`.
- **Glass‑morphism cards**: `bg-card bg-opacity-60 backdrop-blur-md` combined with border‑radius and soft shadows.
- **Responsive layout**: Grid utilities (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) ensure a consistent experience on all screen sizes.

---

## Extending the Project
1. **Add a new page** – create a folder under `src/app/<new‑page>/page.jsx`. If the page needs state or effects, add `"use client"` at the top.
2. **Expose new data** – add a new file in `src/app/api/<resource>/route.js` and import the DB helper.
3. **Create a component** – add a file under `src/components/`. Export as a default React component and import with the `@/components/...` alias.
4. **Update styling** – modify `globals.css` or add Tailwind classes directly in JSX.

---

## Testing
*No test suite is included currently.*
- You can add unit tests with **Jest** and **React Testing Library**.
- End‑to‑end tests can be written using **Playwright** (Next.js provides a starter config).

---

## License
This project is provided for educational purposes. Feel free to modify, extend, or redistribute it under the MIT license.

---

---

*Generated on 2026‑06‑05 by Antigravity – your AI coding assistant.*
