"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Play,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";

export default function QualityManager({ initialRules }) {
  const [rules, setRules] = useState(initialRules);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isRunning, setIsRunning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newRule, setNewRule] = useState({
    rule_name: "",
    table_name: "",
    column_name: "",
    rule_type: "Format Check",
  });

  const passedRules = rules.filter((r) => r.status === "Passed").length;
  const passRate = rules.length
    ? Math.round((passedRules / rules.length) * 100)
    : 100;

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.rule_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.column_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.rule_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || rule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRunChecks = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Simulate running: randomly resolve some failures or reset timestamps
      const updatedRules = rules.map((rule) => ({
        ...rule,
        last_run: new Date().toISOString().replace("T", " ").substring(0, 19),
        // Keep status but refresh execution
      }));
      setRules(updatedRules);
      setIsRunning(false);
    }, 1500);
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.rule_name || !newRule.table_name || !newRule.column_name)
      return;

    const ruleToAdd = {
      id: rules.length + 1,
      rule_name: newRule.rule_name,
      table_name: newRule.table_name,
      column_name: newRule.column_name,
      rule_type: newRule.rule_type,
      status: "Passed", // Default to passed on registration
      last_run: new Date().toISOString().replace("T", " ").substring(0, 19),
      error_count: 0,
    };

    setRules([ruleToAdd, ...rules]);
    setShowAddModal(false);
    setNewRule({
      rule_name: "",
      table_name: "",
      column_name: "",
      rule_type: "Format Check",
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview stats & execute triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass rate card */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Overall Pass Rate
            </span>
            <div className="text-3xl font-extrabold text-text-primary mt-1">
              {passRate}%
            </div>
            <p className="text-xs text-text-muted mt-2">
              {passedRules} of {rules.length} validations active and passing.
            </p>
          </div>
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center font-bold text-lg border-4 ${
              passRate >= 90
                ? "border-emerald-500/20 text-success"
                : passRate >= 70
                  ? "border-amber-500/20 text-warning"
                  : "border-rose-500/20 text-error"
            }`}
          >
            {passRate}%
          </div>
        </div>

        {/* Total Checks card */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Active Rules
            </span>
            <div className="text-3xl font-extrabold text-text-primary mt-1">
              {rules.length}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Running continuously on schema changes.
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Execution panel */}
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Rule Execution Engine
            </span>
            <p className="text-xs text-text-secondary mt-1">
              Trigger a fresh batch execution check across all tables.
            </p>
          </div>
          <button
            onClick={handleRunChecks}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 mt-4"
          >
            <Play className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Running Audits..." : "Run Rules Audit"}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search rules, columns, tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-card-border bg-card py-2 pl-10 pr-4 text-sm text-text-primary focus:outline-none"
            />
          </div>

          <div className="relative shrink-0">
            <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-card-border bg-card py-2 pl-10 pr-8 text-sm text-text-primary appearance-none focus:outline-none cursor-pointer"
            >
              <option value="All">All Rules</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 justify-center"
        >
          <Plus className="h-4 w-4" /> Create Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-bold text-xs uppercase bg-background/40">
                <th className="py-3 px-6">Rule Name</th>
                <th className="py-3 px-6">Target Column</th>
                <th className="py-3 px-6">Rule Type</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Last Run</th>
                <th className="py-3 px-6 text-right">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-background/25">
                  <td className="py-4 px-6 font-semibold text-text-primary">
                    {rule.rule_name}
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-xs bg-background px-2 py-0.5 rounded border border-card-border font-mono text-text-secondary">
                      {rule.table_name}.{rule.column_name}
                    </code>
                  </td>
                  <td className="py-4 px-6 text-text-secondary">
                    {rule.rule_type}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        rule.status === "Passed"
                          ? "bg-emerald-500/10 text-success"
                          : "bg-rose-500/10 text-error"
                      }`}
                    >
                      {rule.status === "Passed" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      {rule.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-text-muted text-xs">
                    {rule.last_run}
                  </td>
                  <td className="py-4 px-6 text-right font-bold">
                    {rule.error_count > 0 ? (
                      <span className="text-error">
                        {rule.error_count.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-text-muted font-medium">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center justify-between border-b border-card-border pb-4 mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Create Data Quality Rule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text-primary rounded-lg p-1 hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRule.rule_name}
                  onChange={(e) =>
                    setNewRule({ ...newRule, rule_name: e.target.value })
                  }
                  placeholder="e.g. Validate Zipcodes Format"
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Table Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRule.table_name}
                    onChange={(e) =>
                      setNewRule({ ...newRule, table_name: e.target.value })
                    }
                    placeholder="e.g. customers_raw"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Column Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRule.column_name}
                    onChange={(e) =>
                      setNewRule({ ...newRule, column_name: e.target.value })
                    }
                    placeholder="e.g. zipcode"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                  Validation Rule Type
                </label>
                <select
                  value={newRule.rule_type}
                  onChange={(e) =>
                    setNewRule({ ...newRule, rule_type: e.target.value })
                  }
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="Null Check">
                    Null Check (Required Field)
                  </option>
                  <option value="Format Check">
                    Format Check (RegEx match)
                  </option>
                  <option value="Range Check">
                    Range Check (Numeric bounds)
                  </option>
                  <option value="Referential Integrity">
                    Referential Integrity (Primary/Foreign Key)
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-card-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
