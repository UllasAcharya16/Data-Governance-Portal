// src/app/api/quality/validate/route.js

import { NextResponse } from 'next/server';
import { getSampleSales } from '@/lib/bigquery';

export async function GET() {
  // Fetch sample_sales from BigQuery (fallback to empty array if error)
  let rows = [];
  try {
    rows = await getSampleSales();
  } catch (err) {
    console.error('Failed to fetch sample_sales from BigQuery:', err);
    // In fallback mode, you could retrieve mock data here.
  }

  const totalRows = rows.length;
  let passedRows = 0;
  const ruleFailures = {
    revenue: 0,
    month: 0,
    successful_orders: 0,
  };

  rows.forEach(row => {
    const revenuePass = row.revenue > 0;
    const monthPass = row.month != null && row.month !== '';
    const successfulPass = row.successful_orders >= 0;
    if (revenuePass && monthPass && successfulPass) {
      passedRows++;
    } else {
      if (!revenuePass) ruleFailures.revenue++;
      if (!monthPass) ruleFailures.month++;
      if (!successfulPass) ruleFailures.successful_orders++;
    }
  });

  const failedRows = totalRows - passedRows;
  const qualityScore = totalRows === 0 ? 0 : Math.round((passedRows / totalRows) * 100);

  return NextResponse.json({
    totalRows,
    passedRows,
    failedRows,
    ruleFailures,
    qualityScore,
  });
}
