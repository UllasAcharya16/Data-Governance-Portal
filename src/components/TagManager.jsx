"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { assignTagAction, removeTagAction } from "@/app/actions/tags";

export default function TagManager({ initialTags, initialAssignedTags }) {
  const [activeTab, setActiveTab] = useState("assignments");
  const [assignedTags, setAssignedTags] = useState(initialAssignedTags);
  const [tags, setTags] = useState(initialTags);
  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState(null);
  const [deletingTagName, setDeletingTagName] = useState("");
  // Form State
  const [errorMessage, setErrorMessage] = useState("");
  const [assignForm, setAssignForm] = useState({
    asset_name: "customers", // Default target asset dropdown
    data_steward: "",
    confidentiality_level: "Sensitive",
    retention_period: 365,
    contains_pii: true,
  });

  // Sync state with parent props
  useEffect(() => {
    setAssignedTags(initialAssignedTags);
  }, [initialAssignedTags]);

  const handleAssignTag = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (
      !assignForm.asset_name ||
      !assignForm.data_steward ||
      !assignForm.retention_period
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const res = await assignTagAction(
      assignForm.asset_name,
      assignForm.data_steward,
      assignForm.confidentiality_level,
      Number(assignForm.retention_period),
      assignForm.contains_pii,
    );

    if (res.success) {
      setShowAssignModal(false);
      setAssignForm({
        asset_name: "customers",
        data_steward: "",
        confidentiality_level: "Sensitive",
        retention_period: 365,
        contains_pii: true,
      });
    } else {
      setErrorMessage(res.error || "Failed to assign tag.");
    }
  };

  const openEditAssign = (tag) => {
    setAssignForm({
      asset_name: tag.asset_name,
      data_steward: tag.data_steward,
      confidentiality_level: tag.confidentiality_level,
      retention_period: tag.retention_period,
      contains_pii: tag.contains_pii === 1,
    });
    setErrorMessage("");
    setShowAssignModal(true);
  };

  const openDeleteConfirmation = (id, assetName) => {
    setDeletingTagId(id);
    setDeletingTagName(assetName);
    setErrorMessage("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingTagId === null) return;
    setErrorMessage("");
    const res = await removeTagAction(deletingTagId);
    if (res.success) {
      setShowDeleteModal(false);
      setDeletingTagId(null);
      setDeletingTagName("");
    } else {
      setErrorMessage(res.error || "Failed to remove tag assignment.");
    }
  };

  const getConfidentialityBadge = (level) => {
    switch (level) {
      case "Highly Confidential":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-error border border-rose-500/20">
            <ShieldAlert className="h-3 w-3" /> Highly Confidential
          </span>
        );
      case "Sensitive":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-warning border border-amber-500/20">
            <Shield className="h-3 w-3" /> Sensitive
          </span>
        );
      case "Internal":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-accent border border-blue-500/20">
            <CheckCircle2 className="h-3 w-3" /> Internal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-success border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" /> Public
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Subpage Tabs */}
      <div className="flex border-b border-card-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("assignments")}
          className={`whitespace-nowrap px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "assignments"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Template Assignments (Data_Governance_Template)
        </button>
        <button
          onClick={() => setActiveTab("taxonomy")}
          className={`whitespace-nowrap px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "taxonomy"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          General Tag Taxonomy
        </button>
      </div>

      {activeTab === "assignments" ? (
        <div className="space-y-6">
          {/* Template Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-bold uppercase text-accent tracking-wider">
                    Active Tag Template
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mt-1 font-mono">
                  Data_Governance_Template
                </h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  A standardized enterprise governance tag definition schema.
                  Mapped fields are dynamically enforced for all linked
                  resources inside the data platform catalog.
                </p>

                {/* Fields listing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-background p-3 rounded-lg border border-card-border/60 text-xs">
                    <span className="text-text-muted block font-bold">
                      Data Steward
                    </span>
                    <span className="text-text-primary font-semibold mt-1 block">
                      String
                    </span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border border-card-border/60 text-xs">
                    <span className="text-text-muted block font-bold">
                      Confidentiality
                    </span>
                    <span className="text-text-primary font-semibold mt-1 block">
                      Dropdown
                    </span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border border-card-border/60 text-xs">
                    <span className="text-text-muted block font-bold">
                      Retention Period
                    </span>
                    <span className="text-text-primary font-semibold mt-1 block">
                      Integer (Days)
                    </span>
                  </div>
                  <div className="bg-background p-3 rounded-lg border border-card-border/60 text-xs">
                    <span className="text-text-muted block font-bold">
                      Contains PII
                    </span>
                    <span className="text-text-primary font-semibold mt-1 block">
                      Boolean
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  Assign Template
                </h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Map values for the Data Governance Template to registered
                  assets such as the customers or transactions tables.
                </p>
              </div>
              <button
                onClick={() => {
                  setErrorMessage("");
                  setShowAssignModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 mt-4"
              >
                <Plus className="h-4 w-4" /> Assign Tag
              </button>
            </div>
          </div>

          {/* Assigned tags list */}
          <div className="rounded-xl border border-card-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-card-border p-4 bg-background/20">
              <h3 className="font-bold text-sm text-text-primary">
                Assigned Table Metadata Tags
              </h3>
            </div>

            {assignedTags.length === 0 ? (
              <div className="text-center py-12 text-text-muted text-xs">
                No active tag assignments. Click "Assign Tag" above to register
                metadata.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-card-border text-text-muted font-bold text-xs uppercase bg-background/40">
                      <th className="py-3 px-6">Table Asset</th>
                      <th className="py-3 px-6">Data Steward</th>
                      <th className="py-3 px-6">Confidentiality</th>
                      <th className="py-3 px-6">Retention</th>
                      <th className="py-3 px-6">Contains PII</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {assignedTags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-background/25">
                        <td className="py-4 px-6 font-bold text-text-primary flex items-center gap-2">
                          <FolderOpen className="h-4.5 w-4.5 text-accent shrink-0" />
                          <span className="font-mono text-xs">
                            {tag.asset_name} table
                          </span>
                        </td>
                        <td className="py-4 px-6 text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-text-muted" />{" "}
                            {tag.data_steward}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {getConfidentialityBadge(tag.confidentiality_level)}
                        </td>
                        <td className="py-4 px-6 text-text-secondary text-xs">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-text-muted" />{" "}
                            {tag.retention_period} Days
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {tag.contains_pii === 1 ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-error border border-rose-500/20">
                              <ShieldAlert className="h-3 w-3" /> Yes (PII)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-success border border-emerald-500/20">
                              <ShieldCheck className="h-3 w-3" /> No PII
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right font-medium">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditAssign(tag)}
                              className="rounded p-1 text-text-secondary hover:text-accent hover:bg-background transition-colors"
                              title="Edit Assignment"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                openDeleteConfirmation(tag.id, tag.asset_name)
                              }
                              className="rounded p-1 text-text-secondary hover:text-error hover:bg-background transition-colors"
                              title="Remove Assignment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Taxonomic Grid Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search classification tags..."
                className="w-full rounded-lg border border-card-border bg-card py-2 pl-10 pr-4 text-sm text-text-primary focus:outline-none"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-accent/10 text-accent flex items-center justify-center">
                        <Tag className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-base text-text-primary">
                        {tag.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {tag.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Tag Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center justify-between border-b border-card-border pb-4 mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Assign Governance Tag
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
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

            <form onSubmit={handleAssignTag} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                  Template
                </label>
                <input
                  type="text"
                  disabled
                  value="Data_Governance_Template"
                  className="w-full rounded-lg border border-card-border bg-background/50 p-2.5 text-sm text-text-muted font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Assign Target Table *
                  </label>
                  <select
                    value={assignForm.asset_name}
                    onChange={(e) =>
                      setAssignForm({
                        ...assignForm,
                        asset_name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:outline-none"
                  >
                    <option value="customers">customers</option>
                    <option value="transactions">transactions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Data Steward *
                  </label>
                  <input
                    type="text"
                    required
                    value={assignForm.data_steward}
                    onChange={(e) =>
                      setAssignForm({
                        ...assignForm,
                        data_steward: e.target.value,
                      })
                    }
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Confidentiality Level
                  </label>
                  <select
                    value={assignForm.confidentiality_level}
                    onChange={(e) =>
                      setAssignForm({
                        ...assignForm,
                        confidentiality_level: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:outline-none"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal">Internal</option>
                    <option value="Sensitive">Sensitive</option>
                    <option value="Highly Confidential">
                      Highly Confidential
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Retention Period (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={assignForm.retention_period}
                    onChange={(e) =>
                      setAssignForm({
                        ...assignForm,
                        retention_period: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-card-border/60">
                <input
                  type="checkbox"
                  id="contains-pii-checkbox"
                  checked={assignForm.contains_pii}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      contains_pii: e.target.checked,
                    })
                  }
                  className="h-4.5 w-4.5 rounded border-card-border bg-background text-accent focus:ring-accent accent-accent cursor-pointer"
                />

                <label
                  htmlFor="contains-pii-checkbox"
                  className="text-sm font-semibold text-text-primary cursor-pointer select-none"
                >
                  Contains Personally Identifiable Information (PII)
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-card-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-assign-button"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                >
                  Assign Tag
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
                <h3 className="text-lg font-bold text-text-primary">
                  Delete Tag Assignment
                </h3>
                <p className="text-xs text-text-muted">
                  This resets the table's governance attributes.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-error">
                {errorMessage}
              </div>
            )}

            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to remove the tag assignment on table{" "}
              <strong className="text-text-primary">"{deletingTagName}"</strong>
              ?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTagId(null);
                  setDeletingTagName("");
                }}
                className="rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-assign-button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-error text-white px-4 py-2 text-sm font-semibold hover:bg-error/90 shadow-sm"
              >
                Remove Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
