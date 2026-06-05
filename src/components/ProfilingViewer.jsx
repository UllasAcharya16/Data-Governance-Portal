"use client";

import React, { useState, useEffect } from "react";
import { 
  TableProperties, 
  Percent, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  FileSpreadsheet, 
  Layers,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  ReferenceLine 
} from "recharts";

export default function ProfilingViewer({ initialProfiling = [], salesData = [] }) {
  const [activeTab, setActiveTab] = useState("sales_profile");
  const [mounted, setMounted] = useState(false);
  const [chartType, setChartType] = useState("order"); // 'order', 'monthly', 'completeness'

  // Original schema tab state
  const tables = Array.from(
    new Set(initialProfiling.map((item) => item.table_name))
  );
  const [selectedTable, setSelectedTable] = useState(tables[0] || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = initialProfiling.filter(
    (item) => item.table_name === selectedTable
  );
  const rowCount = filteredItems[0]?.row_count || 0;

  // --- Calculations for Sample Sales Dataset ---
  const totalRows = salesData.length;
  const nullCount = salesData.filter(d => d.revenue === null).length;
  const nonNullRevenues = salesData.filter(d => d.revenue !== null).map(d => d.revenue);
  
  const minRevenue = nonNullRevenues.length > 0 ? Math.min(...nonNullRevenues) : 0;
  const maxRevenue = nonNullRevenues.length > 0 ? Math.max(...nonNullRevenues) : 0;

  // Distinct Counts
  const distinctOrderIds = new Set(salesData.map(d => d.order_id)).size;
  const distinctMonths = new Set(salesData.map(d => d.month)).size;
  const distinctRevenues = new Set(salesData.filter(d => d.revenue !== null).map(d => d.revenue)).size;

  // Suspicious Values
  // A suspicious value is negative revenue or a null value
  const suspiciousList = salesData.filter(d => d.revenue === null || d.revenue < 0).map(d => {
    if (d.revenue === null) {
      return {
        order_id: d.order_id,
        month: d.month,
        value: "NULL",
        reason: "Missing Revenue Value",
        severity: "warning"
      };
    } else {
      return {
        order_id: d.order_id,
        month: d.month,
        value: `$${d.revenue}`,
        reason: "Negative Revenue Value",
        severity: "critical"
      };
    }
  });

  // Recharts Chart Data Prep
  // 1. Revenue by Order ID (treating NULL as 0 for chart, but flagging it)
  const orderChartData = salesData.map(d => ({
    name: `Order ${d.order_id}`,
    revenue: d.revenue === null ? 0 : d.revenue,
    rawValue: d.revenue,
    month: d.month,
    isSuspicious: d.revenue === null || d.revenue < 0
  }));

  // 2. Monthly aggregated revenue (ignoring NULL)
  const monthlyAggMap = {};
  salesData.forEach(d => {
    const rev = d.revenue === null ? 0 : d.revenue;
    monthlyAggMap[d.month] = (monthlyAggMap[d.month] || 0) + rev;
  });
  const monthlyChartData = Object.keys(monthlyAggMap).map(m => ({
    name: m,
    revenue: monthlyAggMap[m]
  }));

  // 3. Completeness Pie Chart
  const completenessData = [
    { name: "Valid Data", value: totalRows - nullCount, color: "#0ea5e9" }, // Teal
    { name: "Missing (NULL)", value: nullCount, color: "#f43f5e" } // Rose
  ];

  return (
    <div className="space-y-6">
      {/* Subpage Tabs */}
      <div className="flex border-b border-card-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("sales_profile")}
          className={`whitespace-nowrap px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "sales_profile"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Sample Sales Profile
        </button>
        <button
          onClick={() => setActiveTab("db_profile")}
          className={`whitespace-nowrap px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "db_profile"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <Layers className="h-4 w-4" />
          Database Columns Profile
        </button>
      </div>

      {activeTab === "sales_profile" ? (
        /* Sales Dataset Profile Tab */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Total Rows */}
            <div className="bg-card border border-card-border p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-accent/5 rounded-bl-full flex items-center justify-center text-accent/25 group-hover:scale-110 transition-transform">
                <Database className="h-5 w-5 absolute top-3 right-3" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-extrabold uppercase tracking-wider">Total Rows</span>
                <span className="text-3xl font-black text-text-primary mt-2 block font-mono">{totalRows}</span>
              </div>
              <p className="text-xs text-text-secondary mt-3">Active database sales records.</p>
            </div>

            {/* Null Count */}
            <div className="bg-card border border-card-border p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-warning/5 rounded-bl-full flex items-center justify-center text-warning/25 group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5 absolute top-3 right-3" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-extrabold uppercase tracking-wider">Null Count</span>
                <span className={`text-3xl font-black mt-2 block font-mono ${nullCount > 0 ? 'text-warning' : 'text-success'}`}>{nullCount}</span>
              </div>
              <p className="text-xs text-text-secondary mt-3">Missing revenue rows flagged.</p>
            </div>

            {/* Min Revenue */}
            <div className="bg-card border border-card-border p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-bl-full flex items-center justify-center text-rose-500/25 group-hover:scale-110 transition-transform">
                <TrendingDown className="h-5 w-5 absolute top-3 right-3" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-extrabold uppercase tracking-wider">Min Revenue</span>
                <span className="text-3xl font-black text-rose-500 mt-2 block font-mono">
                  {minRevenue < 0 ? `-$${Math.abs(minRevenue)}` : `$${minRevenue}`}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3">Lowest sale value calculated.</p>
            </div>

            {/* Max Revenue */}
            <div className="bg-card border border-card-border p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full flex items-center justify-center text-emerald-500/25 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 absolute top-3 right-3" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-extrabold uppercase tracking-wider">Max Revenue</span>
                <span className="text-3xl font-black text-success mt-2 block font-mono">${maxRevenue.toLocaleString()}</span>
              </div>
              <p className="text-xs text-text-secondary mt-3">Highest sale value calculated.</p>
            </div>

            {/* Distinct Count */}
            <div className="bg-card border border-card-border p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div>
                <span className="text-[10px] text-text-muted block font-extrabold uppercase tracking-wider">Distinct Count</span>
                <div className="grid grid-cols-3 gap-1 mt-2.5 font-mono text-center">
                  <div className="bg-background/50 border border-card-border/60 py-1 rounded">
                    <span className="text-xs text-text-muted block font-bold">IDs</span>
                    <span className="text-sm font-black text-text-primary">{distinctOrderIds}</span>
                  </div>
                  <div className="bg-background/50 border border-card-border/60 py-1 rounded">
                    <span className="text-xs text-text-muted block font-bold">Mths</span>
                    <span className="text-sm font-black text-text-primary">{distinctMonths}</span>
                  </div>
                  <div className="bg-background/50 border border-card-border/60 py-1 rounded">
                    <span className="text-xs text-text-muted block font-bold">Revs</span>
                    <span className="text-sm font-black text-text-primary">{distinctRevenues}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary mt-3">Unique value checks.</p>
            </div>

            {/* Suspicious Values Count */}
            <div className="bg-card border border-card-border p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-error/5 rounded-bl-full flex items-center justify-center text-error/25 group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5 absolute top-3 right-3" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-extrabold uppercase tracking-wider">Suspicious</span>
                <span className={`text-3xl font-black mt-2 block font-mono ${suspiciousList.length > 0 ? 'text-error' : 'text-success'}`}>
                  {suspiciousList.length}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3">Anomalies requiring review.</p>
            </div>

          </div>

          {/* Interactive Visualizations & Suspicious values list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Column */}
            <div className="lg:col-span-2 bg-card border border-card-border p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-card-border pb-4 gap-3">
                <div>
                  <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    Dataset Profiling Analytics
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">Interactive graphs showing dataset value trends and shapes.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border border-card-border shrink-0 self-start sm:self-center">
                  <button 
                    onClick={() => setChartType("order")} 
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      chartType === "order" 
                        ? "bg-accent text-accent-foreground shadow-sm" 
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Revenue by Order
                  </button>
                  <button 
                    onClick={() => setChartType("monthly")} 
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      chartType === "monthly" 
                        ? "bg-accent text-accent-foreground shadow-sm" 
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Monthly Total
                  </button>
                  <button 
                    onClick={() => setChartType("completeness")} 
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      chartType === "completeness" 
                        ? "bg-accent text-accent-foreground shadow-sm" 
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Data Quality
                  </button>
                </div>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                {mounted ? (
                  chartType === "order" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={orderChartData}
                        margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--card-border-rgb, 120, 120, 120), 0.1)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card-bg, #1e293b)",
                            borderColor: "var(--card-border, #334155)",
                            borderRadius: "8px",
                            color: "var(--text-primary, #f1f5f9)"
                          }}
                          labelStyle={{ fontWeight: "bold" }}
                          formatter={(value, name, props) => {
                            if (props.payload.rawValue === null) return ["NULL (No Data)", "Revenue"];
                            return [`$${value}`, "Revenue"];
                          }}
                        />
                        <ReferenceLine y={0} stroke="rgba(244, 63, 94, 0.6)" strokeDasharray="3 3" />
                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                          {orderChartData.map((entry, index) => {
                            if (entry.rawValue === null) return <Cell key={`cell-${index}`} fill="#475569" stroke="#64748b" strokeWidth={1} strokeDasharray="2 2" />;
                            if (entry.revenue < 0) return <Cell key={`cell-${index}`} fill="#f43f5e" />; // Rose for negative
                            return <Cell key={`cell-${index}`} fill="#0ea5e9" />; // Teal for positive
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : chartType === "monthly" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyChartData}
                        margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--card-border-rgb, 120, 120, 120), 0.1)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card-bg, #1e293b)",
                            borderColor: "var(--card-border, #334155)",
                            borderRadius: "8px",
                            color: "var(--text-primary, #f1f5f9)"
                          }}
                          labelStyle={{ fontWeight: "bold" }}
                          formatter={(value) => [`$${value}`, "Total Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completenessData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {completenessData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card-bg, #1e293b)",
                            borderColor: "var(--card-border, #334155)",
                            borderRadius: "8px",
                            color: "var(--text-primary, #f1f5f9)"
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )
                ) : (
                  <div className="text-text-muted text-xs">Loading analytics...</div>
                )}
              </div>
            </div>

            {/* Suspicious Values Panel */}
            <div className="bg-card border border-card-border p-6 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="border-b border-card-border pb-4">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Suspicious Values Analysis
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Automated flags on null values and negatives.</p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-60 space-y-3 pr-1">
                {suspiciousList.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-success mb-2" />
                    <p className="text-xs text-text-primary font-bold">All values clean</p>
                    <p className="text-[10px] text-text-secondary">No suspicious values flagged.</p>
                  </div>
                ) : (
                  suspiciousList.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                        item.severity === "critical"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          : "bg-amber-500/10 border-amber-500/20 text-warning"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">
                          Order {item.order_id} ({item.month})
                        </p>
                        <p className="text-text-secondary text-[11px]">
                          Value: <strong className="font-mono">{item.value}</strong>
                        </p>
                        <p className="text-text-secondary text-[11px]">
                          Issue: {item.reason}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-background p-3 rounded-lg border border-card-border/60 text-[11px] text-text-muted leading-relaxed">
                <HelpCircle className="h-3.5 w-3.5 inline mr-1 text-accent align-text-bottom" />
                Negative values represent potential refund returns or bookkeeping errors. NULL values indicate incomplete integration sync logs.
              </div>
            </div>

          </div>

          {/* Raw Dataset Table */}
          <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-card-border bg-background/20 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-text-primary">Raw Sales Sample Dataset</h4>
                <p className="text-xs text-text-secondary mt-0.5">Loaded from SQLite `sample_sales` table.</p>
              </div>
              <span className="text-[10px] font-bold text-accent uppercase bg-accent-light px-2.5 py-0.5 rounded">
                Active Source
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border text-text-muted font-bold uppercase bg-background/40">
                    <th className="py-2.5 px-6">Order ID</th>
                    <th className="py-2.5 px-6">Month</th>
                    <th className="py-2.5 px-6 text-right">Revenue</th>
                    <th className="py-2.5 px-6 text-right">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border font-mono">
                  {salesData.map(row => (
                    <tr key={row.id} className="hover:bg-background/40">
                      <td className="py-3 px-6 font-bold text-text-primary">#{row.order_id}</td>
                      <td className="py-3 px-6 text-text-secondary">{row.month}</td>
                      <td className="py-3 px-6 text-right font-bold">
                        {row.revenue === null ? (
                          <span className="text-text-muted italic bg-background border border-card-border px-2 py-0.5 rounded">NULL</span>
                        ) : row.revenue < 0 ? (
                          <span className="text-rose-500">-${Math.abs(row.revenue)}</span>
                        ) : (
                          <span className="text-text-primary">${row.revenue}</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {row.revenue === null ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-warning border border-amber-500/20">
                            Missing Value
                          </span>
                        ) : row.revenue < 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-error border border-rose-500/20">
                            Negative Value
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-success border border-emerald-500/20">
                            Valid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Database Columns Profile Tab (Original Code) */
        <div className="space-y-6">
          {/* Selector and overview */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-card-border p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <TableProperties className="h-5 w-5 text-accent shrink-0" />
              <div className="w-full sm:w-60">
                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                  Select Profiled Table
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-background py-2 px-3 text-sm text-text-primary focus:outline-none"
                >
                  {tables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedTable && (
              <div className="flex gap-6 self-start sm:self-center">
                <div className="text-left">
                  <span className="text-[10px] text-text-muted block font-bold uppercase">
                    Total Rows Profiled
                  </span>
                  <span className="text-base font-extrabold text-text-primary">
                    {rowCount.toLocaleString()}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-text-muted block font-bold uppercase">
                    Columns Scanned
                  </span>
                  <span className="text-base font-extrabold text-text-primary">
                    {filteredItems.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Columns Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredItems.map((col) => (
              <div
                key={col.id}
                className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {/* Column Title */}
                <div className="border-b border-card-border pb-3 mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-text-primary font-mono flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    {col.column_name}
                  </h3>
                  <span className="text-[10px] font-bold text-text-muted bg-background border border-card-border px-2 py-0.5 rounded">
                    Column Profile
                  </span>
                </div>

                {/* Metrics List */}
                <div className="space-y-4">
                  {/* Null rate visual progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-text-secondary mb-1.5">
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3" /> Null Percentage
                      </span>
                      <span
                        className={
                          col.null_percentage > 2
                            ? "text-error font-bold"
                            : "text-success"
                        }
                      >
                        {col.null_percentage}% ({col.null_count.toLocaleString()}{" "}
                        rows)
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-card-border">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          col.null_percentage > 4
                            ? "bg-error"
                            : col.null_percentage > 2
                              ? "bg-warning"
                              : "bg-success"
                        }`}
                        style={{ width: `${col.null_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats detail columns */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-background p-3 rounded-lg border border-card-border/60">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">
                        Distinct Values
                      </span>
                      <span className="text-xs font-bold text-text-primary mt-1 block">
                        {col.distinct_values.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-background p-3 rounded-lg border border-card-border/60">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">
                        Uniqueness Rate
                      </span>
                      <span className="text-xs font-bold text-text-primary mt-1 block">
                        {((col.distinct_values / col.row_count) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Range block (min, max, mean) */}
                  {(col.min_value !== null ||
                    col.max_value !== null ||
                    col.mean_value !== null) && (
                    <div className="bg-background p-4 rounded-lg border border-card-border/60 space-y-2.5">
                      <span className="text-[10px] text-text-muted block font-bold uppercase">
                        Value Ranges & Metrics
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {col.min_value !== null && (
                          <div>
                            <span className="text-[10px] text-text-muted block">
                              Min Value
                            </span>
                            <span
                              className="font-mono font-bold text-text-primary block mt-0.5 truncate"
                              title={col.min_value}
                            >
                              {col.min_value}
                            </span>
                          </div>
                        )}
                        {col.max_value !== null && (
                          <div>
                            <span className="text-[10px] text-text-muted block">
                              Max Value
                            </span>
                            <span
                              className="font-mono font-bold text-text-primary block mt-0.5 truncate"
                              title={col.max_value}
                            >
                              {col.max_value}
                            </span>
                          </div>
                        )}
                        {col.mean_value !== null && (
                          <div>
                            <span className="text-[10px] text-text-muted block">
                              Mean/Average
                            </span>
                            <span className="font-mono font-bold text-text-primary block mt-0.5">
                              {col.mean_value.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
