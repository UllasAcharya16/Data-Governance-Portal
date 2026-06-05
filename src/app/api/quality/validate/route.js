// src/app/api/quality/validate/route.js
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM sample_sales').all();
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
