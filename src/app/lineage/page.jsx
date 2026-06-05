import React from 'react';
import LineageView from '@/components/LineageView';
import { GitBranch } from 'lucide-react';

export default function LineagePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <GitBranch className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            Interactive pipeline visualizer tracing data flows from cloud storage buckets, Delta Lake bronze and silver tables, BigQuery gold views, to final CEO dashboards.
          </p>
        </div>
      </div>

      <LineageView />
    </div>
  );
}
