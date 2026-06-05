"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Database, 
  Layers, 
  FileSpreadsheet, 
  LayoutDashboard, 
  Monitor, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

const initialNodesList = [
  {
    id: 'raw_csv',
    type: 'default',
    data: { 
      label: 'Cloud Storage Raw CSV Files',
      type: 'Raw GCS Storage',
      owner: 'Customer Support Ingest',
      description: 'Raw CSV ticket logs synced hourly from Salesforce & Zendesk API dumps.',
      status: 'healthy',
      system: 'Google Cloud Storage'
    },
    position: { x: 50, y: 120 },
    style: {
      background: 'var(--card)',
      color: 'var(--foreground)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '16px',
      width: 220,
      boxShadow: 'var(--shadow-md)'
    }
  },
  {
    id: 'bronze_table',
    type: 'default',
    data: { 
      label: 'Bronze Table',
      type: 'Delta Lake (Raw)',
      owner: 'CS Data Platform Team',
      description: 'Raw append-only landing table. Stores schemas-on-read JSON ticket payloads.',
      status: 'healthy',
      system: 'Databricks Delta Lake'
    },
    position: { x: 330, y: 120 },
    style: {
      background: 'var(--card)',
      color: 'var(--foreground)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '16px',
      width: 200,
      boxShadow: 'var(--shadow-md)'
    }
  },
  {
    id: 'silver_table',
    type: 'default',
    data: { 
      label: 'Silver Table',
      type: 'Delta Lake (Clean)',
      owner: 'Analytics Engineering',
      description: 'Deduplicated, schema-validated, and masked customer ticket table. PII is redacted.',
      status: 'healthy',
      system: 'Databricks Delta Lake'
    },
    position: { x: 590, y: 120 },
    style: {
      background: 'var(--card)',
      color: 'var(--foreground)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '16px',
      width: 200,
      boxShadow: 'var(--shadow-md)'
    }
  },
  {
    id: 'gold_view',
    type: 'default',
    data: { 
      label: 'Gold Reporting View',
      type: 'BigQuery View',
      owner: 'Business Intelligence',
      description: 'Aggregated view computing daily resolution rates, agent SLAs, and CSAT averages.',
      status: 'healthy',
      system: 'Google BigQuery'
    },
    position: { x: 850, y: 120 },
    style: {
      background: 'var(--card)',
      color: 'var(--foreground)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '16px',
      width: 200,
      boxShadow: 'var(--shadow-md)'
    }
  },
  {
    id: 'ceo_dashboard',
    type: 'default',
    data: { 
      label: 'CEO Dashboard',
      type: 'Looker Dashboard',
      owner: 'Executive Operations',
      description: 'Real-time executive performance dashboard monitoring daily CSAT indices.',
      status: 'healthy',
      system: 'Looker Studio'
    },
    position: { x: 1110, y: 120 },
    style: {
      background: 'var(--card)',
      color: 'var(--foreground)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '16px',
      width: 200,
      boxShadow: 'var(--shadow-md)'
    }
  }
];

const initialEdgesList = [
  {
    id: 'e-raw-bronze',
    source: 'raw_csv',
    target: 'bronze_table',
    animated: true,
    style: { strokeWidth: 2, stroke: '#94a3b8' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
  },
  {
    id: 'e-bronze-silver',
    source: 'bronze_table',
    target: 'silver_table',
    animated: true,
    style: { strokeWidth: 2, stroke: '#94a3b8' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
  },
  {
    id: 'e-silver-gold',
    source: 'silver_table',
    target: 'gold_view',
    animated: true,
    style: { strokeWidth: 2, stroke: '#94a3b8' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
  },
  {
    id: 'e-gold-ceo',
    source: 'gold_view',
    target: 'ceo_dashboard',
    animated: true,
    style: { strokeWidth: 2, stroke: '#94a3b8' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
  }
];

export default function LineageView() {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesList);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesList);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Upstream traversal
  const getUpstreamNodes = useCallback((nodeId, visited = new Set()) => {
    visited.add(nodeId);
    initialEdgesList.forEach(edge => {
      if (edge.target === nodeId && !visited.has(edge.source)) {
        getUpstreamNodes(edge.source, visited);
      }
    });
    return visited;
  }, []);

  // Downstream traversal
  const getDownstreamNodes = useCallback((nodeId, visited = new Set()) => {
    visited.add(nodeId);
    initialEdgesList.forEach(edge => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        getDownstreamNodes(edge.target, visited);
      }
    });
    return visited;
  }, []);

  // Node Selection Handler
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Update styling depending on selection highlights
  useEffect(() => {
    if (!selectedNodeId) {
      // Reset all node colors
      setNodes(nodes => nodes.map(n => ({
        ...n,
        style: {
          ...n.style,
          border: '1px solid var(--card-border)',
          opacity: 1
        }
      })));
      setEdges(edges => edges.map(e => ({
        ...e,
        animated: true,
        style: { ...e.style, stroke: '#94a3b8', strokeWidth: 2 }
      })));
      return;
    }

    const upstream = getUpstreamNodes(selectedNodeId);
    const downstream = getDownstreamNodes(selectedNodeId);

    setNodes(nodes => nodes.map(n => {
      const isSelected = n.id === selectedNodeId;
      const isUp = upstream.has(n.id);
      const isDown = downstream.has(n.id);

      let border = '1px solid var(--card-border)';
      let opacity = 0.35;

      if (isSelected) {
        border = '2px solid var(--accent)';
        opacity = 1;
      } else if (isUp) {
        border = '2px solid var(--info)';
        opacity = 1;
      } else if (isDown) {
        border = '2px solid var(--success)';
        opacity = 1;
      }

      return {
        ...n,
        style: {
          ...n.style,
          border,
          opacity
        }
      };
    }));

    setEdges(edges => edges.map(e => {
      const isUpstreamEdge = upstream.has(e.source) && upstream.has(e.target);
      const isDownstreamEdge = downstream.has(e.source) && downstream.has(e.target);

      let stroke = '#e2e8f0';
      let strokeWidth = 1;

      if (isUpstreamEdge) {
        stroke = 'var(--info)';
        strokeWidth = 3;
      } else if (isDownstreamEdge) {
        stroke = 'var(--success)';
        strokeWidth = 3;
      }

      return {
        ...e,
        animated: isUpstreamEdge || isDownstreamEdge,
        style: { ...e.style, stroke, strokeWidth }
      };
    }));

  }, [selectedNodeId, getUpstreamNodes, getDownstreamNodes, setNodes, setEdges]);

  if (!mounted) {
    return (
      <div className="h-[350px] w-full rounded-xl border border-card-border bg-card flex items-center justify-center animate-pulse">
        <span className="text-sm text-text-muted">Loading React Flow canvas...</span>
      </div>
    );
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const upstreamSet = selectedNodeId ? getUpstreamNodes(selectedNodeId) : new Set();
  const downstreamSet = selectedNodeId ? getDownstreamNodes(selectedNodeId) : new Set();
  
  // Remove the self node from sets for counting
  upstreamSet.delete(selectedNodeId);
  downstreamSet.delete(selectedNodeId);

  const getNodeIcon = (id) => {
    switch (id) {
      case 'raw_csv': return FileSpreadsheet;
      case 'bronze_table': return Layers;
      case 'silver_table': return Layers;
      case 'gold_view': return Database;
      case 'ceo_dashboard': return LayoutDashboard;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Canvas Container */}
      <div className="h-[380px] w-full rounded-xl border border-card-border bg-background shadow-inner relative overflow-hidden">
        {/* Floating Instruction */}
        <div className="absolute top-4 left-4 z-10 bg-card/85 backdrop-blur-md border border-card-border px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm pointer-events-none text-text-secondary flex items-center gap-1.5">
          <Info className="h-4 w-4 text-accent" />
          <span>Interactive Canvas: Click a node to trace upstream/downstream lineage dependencies.</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
          nodesConnectable={false}
          nodesDraggable={true}
        >
          <Background color="var(--card-border)" gap={16} size={1} />
          <Controls className="bg-card border-card-border text-text-primary fill-current rounded-lg overflow-hidden shadow-sm" />
          <MiniMap 
            nodeColor={() => 'var(--accent-light)'}
            maskColor="rgba(0, 0, 0, 0.15)"
            className="border border-card-border rounded-lg bg-card overflow-hidden shadow-sm"
          />
        </ReactFlow>
      </div>

      {/* Selected Node Details & Impact Analysis Panel */}
      {selectedNode ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
          {/* Node Specification (Col span 2) */}
          <div className="xl:col-span-2 rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    {React.createElement(getNodeIcon(selectedNode.id), { className: "h-5 w-5" })}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-text-primary font-mono">{selectedNode.data.label}</h3>
                    <span className="text-[10px] text-text-muted font-semibold uppercase">{selectedNode.data.type} ({selectedNode.data.system})</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-success border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
                </span>
              </div>

              <p className="text-sm text-text-secondary mt-4 leading-relaxed bg-background/50 p-3.5 rounded-lg border border-card-border/80">
                {selectedNode.data.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-card-border mt-6 pt-4 text-xs">
              <div>
                <span className="text-text-muted block font-semibold">Metadata Custodian</span>
                <span className="text-text-primary font-bold mt-1 block">{selectedNode.data.owner}</span>
              </div>
              <div>
                <span className="text-text-muted block font-semibold">Lineage Sync Status</span>
                <span className="text-success font-bold mt-1 block flex items-center gap-1">
                  Active Sync <CheckCircle2 className="h-3 w-3 inline" />
                </span>
              </div>
            </div>
          </div>

          {/* Impact Analysis Panel (Col span 1) */}
          <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 pb-3 border-b border-card-border">
                <AlertTriangle className="h-4.5 w-4.5 text-warning" />
                Lineage Impact Analysis
              </h3>
              
              <div className="space-y-4 mt-4 text-xs">
                {/* Upstream list */}
                <div>
                  <span className="text-text-muted font-bold block uppercase tracking-wider text-[10px] mb-2">
                    Upstream Dependencies ({upstreamSet.size})
                  </span>
                  {upstreamSet.size === 0 ? (
                    <span className="text-text-secondary italic">None (Root source)</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {Array.from(upstreamSet).map((nodeId, idx) => {
                        const name = initialNodesList.find(n => n.id === nodeId)?.data.label;
                        return (
                          <React.Fragment key={nodeId}>
                            {idx > 0 && <ArrowRight className="h-3 w-3 text-text-muted" />}
                            <span className="bg-info/10 text-info font-semibold px-2 py-0.5 rounded text-[10px] border border-info/20">
                              {name}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Downstream list */}
                <div className="pt-2">
                  <span className="text-text-muted font-bold block uppercase tracking-wider text-[10px] mb-2">
                    Downstream Impact ({downstreamSet.size})
                  </span>
                  {downstreamSet.size === 0 ? (
                    <span className="text-text-secondary italic">None (Terminal node)</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {Array.from(downstreamSet).map((nodeId, idx) => {
                        const name = initialNodesList.find(n => n.id === nodeId)?.data.label;
                        return (
                          <React.Fragment key={nodeId}>
                            {idx > 0 && <ArrowRight className="h-3 w-3 text-text-muted" />}
                            <span className="bg-success/10 text-success font-semibold px-2 py-0.5 rounded text-[10px] border border-success/20">
                              {name}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Impact Severity Alert */}
            <div className={`mt-6 p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              downstreamSet.size > 1 
                ? 'bg-rose-500/10 text-error border-rose-500/20' 
                : downstreamSet.size > 0 
                  ? 'bg-amber-500/10 text-warning border-amber-500/20' 
                  : 'bg-emerald-500/10 text-success border-emerald-500/20'
            }`}>
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <div>
                <span>Impact Severity: {
                  downstreamSet.size > 1 ? 'High' : downstreamSet.size > 0 ? 'Medium' : 'Low'
                }</span>
                <span className="block text-[10px] font-normal text-text-muted mt-0.5">
                  {downstreamSet.size > 0 
                    ? `Failure will affect ${downstreamSet.size} downstream consumers.` 
                    : 'Failure will not affect other systems.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Detail Panel */
        <div className="rounded-xl border-2 border-dashed border-card-border p-8 text-center text-text-muted text-sm bg-card/25">
          Click on any node in the diagram to inspect its pipeline detail catalog and perform impact analysis.
        </div>
      )}
    </div>
  );
}
