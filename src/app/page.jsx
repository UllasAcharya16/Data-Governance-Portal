import React from "react";
import { getDb } from "@/lib/db";
import DashboardCharts from "@/components/DashboardCharts";
import {
  BookOpen,
  Tag,
  Database,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Disable caching to fetch real-time SQLite changes

export default function DashboardPage() {
  let stats = {
    termsCount: 0,
    tagsCount: 0,
    tablesCount: 0,
    avgQualityScore: 0,
  };

  let qualityChartData = [
    { name: "Passed Rules", value: 0 },
    { name: "Failed Rules", value: 0 },
  ];

  let profilingChartData = [];
  let recentRuns = [];
  let systemAlerts = [];

  try {
    const db = getDb();

    // 1. Fetch counts
    const glossaryRes = db
      .prepare("SELECT COUNT(*) as count FROM glossary")
      .get();
    const tagsRes = db
      .prepare("SELECT COUNT(*) as count FROM governance_tags")
      .get();
    const tablesRes = db
      .prepare(
        "SELECT COUNT(DISTINCT table_name) as count FROM metadata_catalog",
      )
      .get();
    const qualityRes = db
      .prepare(
        "SELECT ROUND(AVG(quality_score)) as score FROM metadata_catalog",
      )
      .get();

    stats = {
      termsCount: glossaryRes?.count || 0,
      tagsCount: tagsRes?.count || 0,
      tablesCount: tablesRes?.count || 0,
      avgQualityScore: qualityRes?.score || 100,
    };

    // 2. Fetch quality chart data (passed vs failed)
    const passedRes = db
      .prepare(
        "SELECT COUNT(*) as count FROM data_quality_rules WHERE status = 'Passed'",
      )
      .get();
    const failedRes = db
      .prepare(
        "SELECT COUNT(*) as count FROM data_quality_rules WHERE status = 'Failed'",
      )
      .get();

    qualityChartData = [
      { name: "Passed Rules", value: passedRes?.count || 0 },
      { name: "Failed Rules", value: failedRes?.count || 0 },
    ];

    // 3. Fetch profiling table scores
    const scoresRes = db
      .prepare(
        `
      SELECT table_name as "table", ROUND(AVG(quality_score)) as score 
      FROM metadata_catalog 
      GROUP BY table_name
    `,
      )
      .all();

    profilingChartData = scoresRes || [];

    // 4. Fetch recent rules runs
    recentRuns = db
      .prepare(
        `
      SELECT rule_name, table_name, column_name, status, last_run, error_count 
      FROM data_quality_rules 
      ORDER BY last_run DESC 
      LIMIT 4
    `,
      )
      .all();

    // 5. Fetch system alerts (dataplex sync warning/errors)
    systemAlerts = db
      .prepare(
        `
      SELECT lake_name, zone_name, asset_name, status, last_sync 
      FROM dataplex_architecture 
      WHERE status != 'Active'
    `,
      )
      .all();
  } catch (error) {
    console.error("Failed to fetch dashboard data from SQLite:", error);
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-accent-light via-card to-card border border-card-border p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">
            Welcome to the Enterprise Governance Portal
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Real-time compliance monitoring, metadata management, and lineage
            tracing for your data platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-success relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          </span>
          <span className="text-xs font-semibold text-text-primary">
            All pipelines nominal
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Glossary Terms
            </span>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats.termsCount}
            </div>
            <Link
              href="/glossary"
              className="text-xs text-accent hover:underline flex items-center gap-1 mt-2"
            >
              View glossary <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Classification Tags
            </span>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats.tagsCount}
            </div>
            <Link
              href="/tags"
              className="text-xs text-accent hover:underline flex items-center gap-1 mt-2"
            >
              Manage tags <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <Tag className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Cataloged Tables
            </span>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats.tablesCount}
            </div>
            <Link
              href="/catalog"
              className="text-xs text-accent hover:underline flex items-center gap-1 mt-2"
            >
              Search catalog <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <Database className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Avg Quality Score
            </span>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats.avgQualityScore}%
            </div>
            <Link
              href="/quality"
              className="text-xs text-accent hover:underline flex items-center gap-1 mt-2"
            >
              Run audits <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              stats.avgQualityScore >= 95
                ? "bg-emerald-500/10 text-success"
                : "bg-amber-500/10 text-warning"
            }`}
          >
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts section */}
      <DashboardCharts
        qualityData={qualityChartData}
        profilingData={profilingChartData}
      />

      {/* Two Columns for Alerts & Recent Quality runs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Data Quality Runs (Col span 2) */}
        <div className="xl:col-span-2 rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" /> Recent Quality Rule
              Executions
            </h3>
            <Link
              href="/quality"
              className="text-xs text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-card-border text-text-muted font-medium text-xs uppercase">
                  <th className="pb-3">Rule Name</th>
                  <th className="pb-3">Table/Column</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Last Executed</th>
                  <th className="pb-3 text-right">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {recentRuns.map((run) => (
                  <tr key={run.rule_name} className="hover:bg-background/40">
                    <td className="py-3.5 font-medium text-text-primary">
                      {run.rule_name}
                    </td>
                    <td className="py-3.5 text-text-secondary">
                      <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-card-border">
                        {run.table_name}.{run.column_name}
                      </code>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          run.status === "Passed"
                            ? "bg-emerald-500/10 text-success"
                            : "bg-rose-500/10 text-error"
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-text-muted text-xs">
                      {run.last_run}
                    </td>
                    <td className="py-3.5 text-right font-medium text-text-secondary">
                      {run.error_count > 0 ? (
                        <span className="text-error">{run.error_count}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dataplex Sync Alerts (Col span 1) */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-warning" /> Active Sync
            Incidents
          </h3>
          {systemAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="h-10 w-10 text-success mb-3" />
              <p className="text-sm font-medium text-text-primary">
                All Zones Synchronized
              </p>
              <p className="text-xs text-text-muted mt-1">
                No active incidents reported in Dataplex architecture.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.asset_name}
                  className="p-3.5 rounded-lg bg-background border border-card-border hover:border-warning/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase">
                      {alert.lake_name}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                      {alert.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary mt-2">
                    {alert.asset_name}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Zone:{" "}
                    <span className="font-semibold">{alert.zone_name}</span>
                  </p>
                  <p className="text-[10px] text-text-muted mt-3">
                    Last sync attempt: {alert.last_sync}
                  </p>
                </div>
              ))}
              <Link
                href="/dataplex"
                className="block text-center text-xs text-accent hover:underline font-semibold mt-2"
              >
                Open Dataplex Manager
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
