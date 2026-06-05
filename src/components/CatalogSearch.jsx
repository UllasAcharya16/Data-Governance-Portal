"use client";

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Eye, 
  ShieldAlert, 
  ChevronDown, 
  ChevronRight, 
  Info,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  RefreshCw,
  FolderOpen,
  X
} from 'lucide-react';
import { addDatasetAction, editDatasetAction, deleteDatasetAction } from '@/app/actions/datasets';

export default function CatalogSearch({ initialCatalog, initialDatasets }) {
  const [activeTab, setActiveTab] = useState('datasets');
  const [datasets, setDatasets] = useState(initialDatasets);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Tables / Schema tab state
  const [systemFilter, setSystemFilter] = useState('All');
  const [piiFilter, setPiiFilter] = useState('All');
  const [expandedTables, setExpandedTables] = useState({
    'customers_raw': true
  });

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState(null);
  const [deletingDatasetId, setDeletingDatasetId] = useState(null);
  const [deletingDatasetName, setDeletingDatasetName] = useState('');
  
  // Form states
  const [errorMessage, setErrorMessage] = useState('');
  const [newDataset, setNewDataset] = useState({
    name: '',
    description: '',
    owner: '',
    refresh: 'Daily',
    domain: '',
    status: 'Certified'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    owner: '',
    refresh: 'Daily',
    domain: '',
    status: 'Certified'
  });

  // Sync state with server component updates
  useEffect(() => {
    setDatasets(initialDatasets);
  }, [initialDatasets]);

  // Group columns by table name for the Schema tab
  const tables = {};
  initialCatalog.forEach(item => {
    if (!tables[item.table_name]) {
      tables[item.table_name] = {
        system: item.system,
        owner: item.owner,
        columns: []
      };
    }
    tables[item.table_name].columns.push(item);
  });

  // Filters for datasets tab
  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = 
      dataset.dataset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.business_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.owner_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.domain_name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || dataset.certification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filters for schema tab
  const tableList = Object.keys(tables).filter(tableName => {
    const tableInfo = tables[tableName];
    if (systemFilter !== 'All' && tableInfo.system !== systemFilter) return false;
    if (piiFilter === 'PII' && !tableInfo.columns.some(col => col.is_pii === 1)) return false;
    if (piiFilter === 'Non-PII' && tableInfo.columns.every(col => col.is_pii === 1)) return false;

    const matchesSearch = 
      tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tableInfo.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tableInfo.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tableInfo.columns.some(col => 
        col.column_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.data_type.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesSearch;
  });

  // Form Submissions
  const handleAddDataset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!newDataset.name || !newDataset.description || !newDataset.owner || !newDataset.domain) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const res = await addDatasetAction(
      newDataset.name,
      newDataset.description,
      newDataset.owner,
      newDataset.refresh,
      newDataset.domain,
      newDataset.status
    );

    if (res.success) {
      setShowAddModal(false);
      setNewDataset({ name: '', description: '', owner: '', refresh: 'Daily', domain: '', status: 'Certified' });
    } else {
      setErrorMessage(res.error || 'Failed to add dataset.');
    }
  };

  const handleEditDataset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!editingDataset) return;
    if (!editForm.name || !editForm.description || !editForm.owner || !editForm.domain) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const res = await editDatasetAction(
      editingDataset.id,
      editForm.name,
      editForm.description,
      editForm.owner,
      editForm.refresh,
      editForm.domain,
      editForm.status
    );

    if (res.success) {
      setShowEditModal(false);
      setEditingDataset(null);
    } else {
      setErrorMessage(res.error || 'Failed to update dataset.');
    }
  };

  const openEditDataset = (dataset) => {
    setEditingDataset(dataset);
    setEditForm({
      name: dataset.dataset_name,
      description: dataset.business_description,
      owner: dataset.owner_team,
      refresh: dataset.refresh_frequency,
      domain: dataset.domain_name,
      status: dataset.certification_status
    });
    setErrorMessage('');
    setShowEditModal(true);
  };

  const openDeleteConfirmation = (id, name) => {
    setDeletingDatasetId(id);
    setDeletingDatasetName(name);
    setErrorMessage('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingDatasetId === null) return;
    setErrorMessage('');
    const res = await deleteDatasetAction(deletingDatasetId);
    if (res.success) {
      setShowDeleteModal(false);
      setDeletingDatasetId(null);
      setDeletingDatasetName('');
    } else {
      setErrorMessage(res.error || 'Failed to delete dataset.');
    }
  };

  const getSystemBadge = (system) => {
    switch (system) {
      case 'Snowflake':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">Snowflake</span>;
      case 'BigQuery':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">BigQuery</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">PostgreSQL</span>;
    }
  };

  const getCertificationBadge = (status) => {
    switch (status) {
      case 'Certified':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-success border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Certified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-warning border border-amber-500/20">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-error border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" /> Deprecated
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Subpage Tabs */}
      <div className="flex border-b border-card-border overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('datasets');
            setSearchQuery('');
          }}
          className={`whitespace-nowrap px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === 'datasets'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Dataset Catalog
        </button>
        <button
          onClick={() => {
            setActiveTab('schemas');
            setSearchQuery('');
          }}
          className={`whitespace-nowrap px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === 'schemas'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Schema Catalog (Columns)
        </button>
      </div>

      {activeTab === 'datasets' ? (
        /* Dataset Tab */
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 max-w-md">
              <div className="relative w-full">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search dataset names, descriptions, owners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-card py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>

              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-card-border bg-card py-2 px-3 text-sm text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Certified">Certified</option>
                  <option value="Pending">Pending</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                setErrorMessage('');
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 transition-opacity justify-center"
            >
              <Plus className="h-4 w-4" /> Add Dataset
            </button>
          </div>

          {/* Datasets Grid */}
          {filteredDatasets.length === 0 ? (
            <div className="text-center py-16 bg-card border border-card-border rounded-xl">
              <FolderOpen className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <h3 className="text-lg font-semibold text-text-primary">No datasets registered</h3>
              <p className="text-sm text-text-secondary mt-1">Try resetting search filters or add a new dataset.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDatasets.map(dataset => (
                <div 
                  key={dataset.id} 
                  className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-base text-text-primary font-mono block">
                          {dataset.dataset_name}
                        </h4>
                        <span className="inline-block text-[10px] font-bold text-accent uppercase bg-accent-light px-2 py-0.5 rounded mt-2">
                          Domain: {dataset.domain_name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {getCertificationBadge(dataset.certification_status)}
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            onClick={() => openEditDataset(dataset)}
                            className="rounded p-1 text-text-secondary hover:text-accent hover:bg-background transition-colors"
                            title="Edit Dataset"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirmation(dataset.id, dataset.dataset_name)}
                            className="rounded p-1 text-text-secondary hover:text-error hover:bg-background transition-colors"
                            title="Delete Dataset"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary mt-4 leading-relaxed bg-background/40 p-3 rounded-lg border border-card-border/60">
                      {dataset.business_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-card-border mt-6 pt-4 text-xs">
                    <div>
                      <span className="text-text-muted font-semibold flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Owner Team</span>
                      <span className="text-text-primary font-bold mt-1 block">{dataset.owner_team}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-semibold flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> Refresh</span>
                      <span className="text-text-primary font-bold mt-1 block">{dataset.refresh_frequency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Expandable Schema catalog Tab */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search tables, columns, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-card-border bg-card py-2 pl-10 pr-4 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-muted font-semibold uppercase">System:</span>
                <select
                  value={systemFilter}
                  onChange={(e) => setSystemFilter(e.target.value)}
                  className="rounded-lg border border-card-border bg-card py-1.5 px-3 text-xs text-text-primary focus:outline-none"
                >
                  <option value="All">All Systems</option>
                  <option value="Postgres">Postgres</option>
                  <option value="Snowflake">Snowflake</option>
                  <option value="BigQuery">BigQuery</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-muted font-semibold uppercase">Privacy:</span>
                <select
                  value={piiFilter}
                  onChange={(e) => setPiiFilter(e.target.value)}
                  className="rounded-lg border border-card-border bg-card py-1.5 px-3 text-xs text-text-primary focus:outline-none"
                >
                  <option value="All">All Privacy</option>
                  <option value="PII">Contains PII</option>
                  <option value="Non-PII">No PII</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {tableList.map(tableName => {
              const tableInfo = tables[tableName];
              const isExpanded = !!expandedTables[tableName];
              const tableQualityScore = Math.round(
                tableInfo.columns.reduce((acc, col) => acc + col.quality_score, 0) / tableInfo.columns.length
              );

              return (
                <div key={tableName} className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
                  <div 
                    onClick={() => setExpandedTables(p => ({ ...p, [tableName]: !p[tableName] }))}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-background/25 select-none transition-colors border-b border-transparent data-[expanded=true]:border-card-border"
                    data-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-text-muted">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </button>
                      <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                          {tableName}
                          {getSystemBadge(tableInfo.system)}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          Owner: <span className="font-semibold text-text-secondary">{tableInfo.owner}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-text-muted block font-bold uppercase">Schema Size</span>
                        <span className="text-xs font-bold text-text-primary">{tableInfo.columns.length} columns</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-text-muted block font-bold uppercase">Avg Quality</span>
                        <span className={`text-xs font-bold ${tableQualityScore >= 95 ? 'text-success' : 'text-warning'}`}>{tableQualityScore}%</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="overflow-x-auto bg-background/20 border-t border-card-border">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-card-border text-text-muted font-bold uppercase bg-background/40">
                            <th className="py-2.5 px-6">Column Name</th>
                            <th className="py-2.5 px-6">Data Type</th>
                            <th className="py-2.5 px-6">Description</th>
                            <th className="py-2.5 px-6">Classification</th>
                            <th className="py-2.5 px-6 text-right">Quality</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                          {tableInfo.columns.map(col => (
                            <tr key={col.id} className="hover:bg-background/60">
                              <td className="py-3 px-6 font-semibold text-text-primary font-mono">{col.column_name}</td>
                              <td className="py-3 px-6 font-mono text-text-secondary">{col.data_type}</td>
                              <td className="py-3 px-6 text-text-secondary max-w-sm leading-relaxed">{col.description}</td>
                              <td className="py-3 px-6">
                                {col.is_pii === 1 ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-error border border-rose-500/20">
                                    <ShieldAlert className="h-3 w-3" /> PII Masked
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-text-muted">None</span>
                                )}
                              </td>
                              <td className="py-3 px-6 text-right font-bold text-text-secondary">
                                <span className={col.quality_score >= 95 ? 'text-success' : 'text-warning'}>{col.quality_score}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Dataset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center justify-between border-b border-card-border pb-4 mb-4">
              <h3 className="text-lg font-bold text-text-primary">Add Dataset Metadata</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary rounded-lg p-1 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-error flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddDataset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Dataset Name *</label>
                <input
                  type="text"
                  required
                  value={newDataset.name}
                  onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })}
                  placeholder="e.g. sales_summary"
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Business Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newDataset.description}
                  onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })}
                  placeholder="Business definition or aggregate calculations summary..."
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Domain Name *</label>
                  <input
                    type="text"
                    required
                    value={newDataset.domain}
                    onChange={(e) => setNewDataset({ ...newDataset, domain: e.target.value })}
                    placeholder="e.g. Commerce"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Owner Team *</label>
                  <input
                    type="text"
                    required
                    value={newDataset.owner}
                    onChange={(e) => setNewDataset({ ...newDataset, owner: e.target.value })}
                    placeholder="e.g. Sales Analytics Team"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Refresh Frequency</label>
                  <select
                    value={newDataset.refresh}
                    onChange={(e) => setNewDataset({ ...newDataset, refresh: e.target.value })}
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:outline-none"
                  >
                    <option value="Real-time">Real-time</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Certification Status</label>
                  <select
                    value={newDataset.status}
                    onChange={(e) => setNewDataset({ ...newDataset, status: e.target.value })}
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:outline-none"
                  >
                    <option value="Certified">Certified</option>
                    <option value="Pending">Pending</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </div>
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
                  id="submit-dataset-button"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                >
                  Add Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dataset Modal */}
      {showEditModal && editingDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center justify-between border-b border-card-border pb-4 mb-4">
              <h3 className="text-lg font-bold text-text-primary">Edit Dataset Metadata</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDataset(null);
                }}
                className="text-text-muted hover:text-text-primary rounded-lg p-1 hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-error flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEditDataset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Dataset Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. sales_summary"
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Business Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description..."
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Domain Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.domain}
                    onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                    placeholder="e.g. Commerce"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Owner Team *</label>
                  <input
                    type="text"
                    required
                    value={editForm.owner}
                    onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                    placeholder="e.g. Sales Analytics Team"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Refresh Frequency</label>
                  <select
                    value={editForm.refresh}
                    onChange={(e) => setEditForm({ ...editForm, refresh: e.target.value })}
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="Real-time">Real-time</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">Certification Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="Certified">Certified</option>
                    <option value="Pending">Pending</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-card-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDataset(null);
                  }}
                  className="rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center gap-3 border-b border-card-border pb-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 text-error flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Delete Dataset Metadata</h3>
                <p className="text-xs text-text-muted">This action will remove the catalog registration.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-error">
                {errorMessage}
              </div>
            )}

            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to permanently delete the dataset <strong className="text-text-primary">"{deletingDatasetName}"</strong> from the catalog?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingDatasetId(null);
                  setDeletingDatasetName('');
                }}
                className="rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-dataset-button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-error text-white px-4 py-2 text-sm font-semibold hover:bg-error/90 shadow-sm"
              >
                Delete Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
