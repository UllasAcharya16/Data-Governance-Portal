"use client";

import React, { useState } from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  FolderOpen, 
  Database, 
  Activity, 
  Monitor, 
  CheckCircle2, 
  Clock, 
  Info 
} from 'lucide-react';

export default function DataplexManager({ assets }) {
  // Group assets by lake name
  const lakes = {};

  assets.forEach(asset => {
    if (!lakes[asset.lake_name]) {
      lakes[asset.lake_name] = {
        'Raw Zone': [],
        'Curated Zone': [],
        'Analytics Zone': []
      };
    }
    if (lakes[asset.lake_name][asset.zone_name]) {
      lakes[asset.lake_name][asset.zone_name].push(asset);
    }
  });

  // Expandable cards state (default expand the first lake)
  const [expandedLakes, setExpandedLakes] = useState({
    'Commerce Lake': true
  });

  const toggleLake = (lakeName) => {
    setExpandedLakes(prev => ({
      ...prev,
      [lakeName]: !prev[lakeName]
    }));
  };

  const getAssetIcon = (type) => {
    if (type.includes('File') || type.includes('Storage')) {
      return FolderOpen;
    }
    if (type.includes('Table') || type.includes('Query')) {
      return Database;
    }
    return Monitor; // View/Dashboard
  };

  const getAssetIconColor = (type) => {
    if (type.includes('File')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (type.includes('Table')) return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
    return 'text-violet-500 bg-violet-500/10 border-violet-500/20'; // Looker/Dashboard
  };

  const getZoneDescription = (zone) => {
    switch (zone) {
      case 'Raw Zone':
        return 'GCS ingestion landing buckets.';
      case 'Curated Zone':
        return 'Structured, schema-validated tables.';
      default:
        return 'Aggregated Looker views & metrics.';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-card-border p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
        <span className="text-text-secondary flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-accent shrink-0" />
          <span>Each Dataplex Lake is organized into structured zones. Click a Lake card header to expand or collapse its architectural topology.</span>
        </span>
      </div>

      <div className="space-y-4">
        {Object.keys(lakes).map(lakeName => {
          const isExpanded = !!expandedLakes[lakeName];
          const zoneGroups = lakes[lakeName];

          // Compute total assets in this lake
          const totalAssets = Object.values(zoneGroups).reduce((acc, list) => acc + list.length, 0);

          return (
            <div 
              key={lakeName} 
              className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden transition-all duration-200"
            >
              {/* Lake Card Header */}
              <div 
                onClick={() => toggleLake(lakeName)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-background/25 select-none transition-colors border-b border-transparent data-[expanded=true]:border-card-border"
                data-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <div className="text-text-muted">
                    {isExpanded ? <ChevronDown className="h-5.5 w-5.5" /> : <ChevronRight className="h-5.5 w-5.5" />}
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text-primary">{lakeName}</h3>
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      Google Cloud Dataplex Lake
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted block font-bold uppercase">Registered Zones</span>
                    <span className="text-xs font-bold text-text-primary">3 active zones</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted block font-bold uppercase">Assets Mapped</span>
                    <span className="text-xs font-bold text-accent">{totalAssets} items</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-success border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
                  </div>
                </div>
              </div>

              {/* Lake Zones Grid (Expanded) */}
              {isExpanded && (
                <div className="p-6 bg-background/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.keys(zoneGroups).map(zoneName => {
                      const zoneAssets = zoneGroups[zoneName];
                      return (
                        <div 
                          key={zoneName} 
                          className="bg-card border border-card-border rounded-xl p-5 shadow-sm flex flex-col justify-between"
                        >
                          {/* Zone Title */}
                          <div className="border-b border-card-border pb-3 mb-4">
                            <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                              {zoneName}
                            </h4>
                            <span className="text-[10px] text-text-muted block mt-0.5">
                              {getZoneDescription(zoneName)}
                            </span>
                          </div>

                          {/* Zone Assets List */}
                          <div className="space-y-3 flex-1">
                            {zoneAssets.length === 0 ? (
                              <div className="text-center py-6 text-text-muted text-xs italic">
                                No assets registered
                              </div>
                            ) : (
                              zoneAssets.map(asset => {
                                const AssetIcon = getAssetIcon(asset.asset_type);
                                const iconColors = getAssetIconColor(asset.asset_type);
                                return (
                                  <div 
                                    key={asset.id} 
                                    className="p-3.5 rounded-lg bg-background border border-card-border/80 hover:border-accent/40 transition-colors"
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div className={`p-1.5 rounded border shrink-0 ${iconColors}`}>
                                        <AssetIcon className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-xs text-text-primary font-mono truncate" title={asset.asset_name}>
                                          {asset.asset_name}
                                        </h5>
                                        <span className="text-[10px] text-text-muted block mt-0.5">
                                          {asset.asset_type}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Asset Status Footer */}
                                    <div className="border-t border-card-border/60 mt-3 pt-2 flex items-center justify-between text-[9px] text-text-muted font-medium">
                                      <span className="flex items-center gap-1">
                                        <Activity className="h-2.5 w-2.5 text-success" /> {asset.status}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" /> Sync: {asset.last_sync}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
