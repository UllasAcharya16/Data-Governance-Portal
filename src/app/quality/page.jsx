"use client";
// src/app/quality/page.jsx
import { useEffect, useState } from 'react';
import QualityManager from '@/components/QualityManager';

export default function QualityPage() {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchValidation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quality/validate');
      const data = await res.json();
      setValidation(data);
    } catch (e) {
      console.error('Validation fetch error', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchValidation();
  }, []);

  // Prepare initial rules for QualityManager UI based on validation data
  const initialRules = validation
    ? Object.entries(validation.ruleFailures).map(([column, count], idx) => ({
        id: idx + 1,
        rule_name: `${column} check`,
        table_name: 'sample_sales',
        column_name: column,
        rule_type: 'Custom',
        status: count === 0 ? 'Passed' : 'Failed',
        last_run: new Date().toISOString().replace('T', ' ').substring(0, 19),
        error_count: count,
      }))
    : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Quality Rules</h1>
      {loading && <p>Loading validation...</p>}
      {validation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-text-muted">Total Rows</p>
            <p className="text-xl font-semibold text-text-primary">{validation.totalRows}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-text-muted">Passed Rows</p>
            <p className="text-xl font-semibold text-success">{validation.passedRows}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-text-muted">Quality Score</p>
            <p className="text-xl font-semibold text-text-primary">{validation.qualityScore}%</p>
          </div>
        </div>
      )}
      {/* Use existing QualityManager component for rule overview */}
      <QualityManager initialRules={initialRules} />
    </div>
  );
}
