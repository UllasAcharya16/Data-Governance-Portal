"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardCharts({ qualityData, profilingData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px] animate-pulse">
        <div className="bg-card border border-card-border rounded-xl h-full"></div>
        <div className="bg-card border border-card-border rounded-xl h-full"></div>
      </div>
    );
  }

  // Color constants
  const COLORS = ["#10b981", "#ef4444"]; // green, red

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Data Quality Rules Status */}
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Data Quality Rules Summary
        </h3>
        {qualityData && qualityData.length > 0 ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--card-border)",
                    color: "var(--foreground)",
                    borderRadius: "8px",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-text-secondary font-medium">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-sm text-text-muted py-8">
            No data available
          </div>
        )}
      </div>

      {/* Chart 2: Database Table Quality Scores */}
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Table Metadata Scores
        </h3>
        {profilingData && profilingData.length > 0 ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={profilingData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="table"
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--card-border)" }}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--card-border)" }}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--card-border)",
                    color: "var(--foreground)",
                    borderRadius: "8px",
                  }}
                />

                <Bar
                  dataKey="score"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                  barSize={35}
                >
                  {profilingData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.score > 90
                          ? "var(--success)"
                          : entry.score > 70
                            ? "var(--accent)"
                            : "var(--warning)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-sm text-text-muted py-8">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
