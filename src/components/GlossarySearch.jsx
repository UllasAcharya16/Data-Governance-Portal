"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  X,
  BookOpen,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  addTermAction,
  editTermAction,
  deleteTermAction,
} from "@/app/actions/glossary";

export default function GlossarySearch({ initialTerms }) {
  const [terms, setTerms] = useState(initialTerms);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [deletingTermId, setDeletingTermId] = useState(null);
  const [deletingTermName, setDeletingTermName] = useState("");
  // Form states
  const [errorMessage, setErrorMessage] = useState("");
  const [newTerm, setNewTerm] = useState({
    term: "",
    definition: "",
    category: "",
    owner: "",
  });

  const [editForm, setEditForm] = useState({
    term: "",
    definition: "",
    category: "",
    owner: "",
  });

  // Sync state with server component updates (e.g. from Server Actions)
  useEffect(() => {
    setTerms(initialTerms);
  }, [initialTerms]);

  const filteredTerms = terms.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTerm = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (
      !newTerm.term ||
      !newTerm.definition ||
      !newTerm.owner ||
      !newTerm.category
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const res = await addTermAction(
      newTerm.term,
      newTerm.definition,
      newTerm.owner,
      newTerm.category,
    );
    if (res.success) {
      setShowAddModal(false);
      setNewTerm({ term: "", definition: "", category: "", owner: "" });
    } else {
      setErrorMessage(res.error || "Failed to add term.");
    }
  };

  const handleEditTerm = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!editingTerm) return;
    if (
      !editForm.term ||
      !editForm.definition ||
      !editForm.owner ||
      !editForm.category
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const res = await editTermAction(
      editingTerm.id,
      editForm.term,
      editForm.definition,
      editForm.owner,
      editForm.category,
    );

    if (res.success) {
      setShowEditModal(false);
      setEditingTerm(null);
    } else {
      setErrorMessage(res.error || "Failed to update term.");
    }
  };

  const openDeleteConfirmation = (id, termName) => {
    setDeletingTermId(id);
    setDeletingTermName(termName);
    setErrorMessage("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingTermId === null) return;
    setErrorMessage("");
    const res = await deleteTermAction(deletingTermId);
    if (res.success) {
      setShowDeleteModal(false);
      setDeletingTermId(null);
      setDeletingTermName("");
    } else {
      setErrorMessage(res.error || "Failed to delete term.");
    }
  };

  const openEditModal = (term) => {
    setEditingTerm(term);
    setEditForm({
      term: term.term,
      definition: term.definition,
      category: term.category,
      owner: term.owner,
    });
    setErrorMessage("");
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-success">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            <FileText className="h-3 w-3" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search, Filter, Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search terms, definitions, owners, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-card-border bg-card py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div className="relative shrink-0">
            <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-card-border bg-card py-2 pl-10 pr-8 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent appearance-none transition-colors cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Under Review">Under Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMessage("");
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90 transition-opacity justify-center"
        >
          <Plus className="h-4 w-4" /> Add Term
        </button>
      </div>

      {/* Grid of Glossary Cards */}
      {filteredTerms.length === 0 ? (
        <div className="text-center py-16 bg-card border border-card-border rounded-xl">
          <BookOpen className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-text-primary">
            No glossary terms found
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Try resetting search query or filter settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTerms.map((term) => (
            <div
              key={term.id}
              className="rounded-xl border border-card-border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-accent/30 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">
                      {term.term}
                    </h3>
                    <span className="inline-block text-[10px] font-bold text-accent uppercase bg-accent-light px-2 py-0.5 rounded mt-2">
                      {term.category}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {getStatusBadge(term.status)}
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => openEditModal(term)}
                        className="rounded p-1 text-text-secondary hover:text-accent hover:bg-background transition-colors"
                        title="Edit Term"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          openDeleteConfirmation(term.id, term.term)
                        }
                        className="rounded p-1 text-text-secondary hover:text-error hover:bg-background transition-colors"
                        title="Delete Term"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text-secondary mt-4 leading-relaxed whitespace-pre-wrap">
                  {term.definition}
                </p>
              </div>

              <div className="border-t border-card-border mt-6 pt-4 flex items-center justify-between text-xs text-text-muted">
                <div>
                  Owner:{" "}
                  <span className="font-semibold text-text-secondary">
                    {term.owner}
                  </span>
                </div>
                <div>
                  Added: <span>{term.created_at.split(" ")[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Term Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center justify-between border-b border-card-border pb-4 mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Add Glossary Term
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddTerm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                  Term Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTerm.term}
                  onChange={(e) =>
                    setNewTerm({ ...newTerm, term: e.target.value })
                  }
                  placeholder="e.g. Net Revenue"
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                  Definition *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTerm.definition}
                  onChange={(e) =>
                    setNewTerm({ ...newTerm, definition: e.target.value })
                  }
                  placeholder="Net Revenue represents total sales after deducting returns, refunds and discounts..."
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTerm.category}
                    onChange={(e) =>
                      setNewTerm({ ...newTerm, category: e.target.value })
                    }
                    placeholder="e.g. Financial Metrics"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Owner *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTerm.owner}
                    onChange={(e) =>
                      setNewTerm({ ...newTerm, owner: e.target.value })
                    }
                    placeholder="e.g. Finance Team"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  />
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
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
                >
                  Add Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Term Modal */}
      {showEditModal && editingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center justify-between border-b border-card-border pb-4 mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Edit Glossary Term
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTerm(null);
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

            <form onSubmit={handleEditTerm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                  Term Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.term}
                  onChange={(e) =>
                    setEditForm({ ...editForm, term: e.target.value })
                  }
                  placeholder="e.g. Net Revenue"
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                  Definition *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.definition}
                  onChange={(e) =>
                    setEditForm({ ...editForm, definition: e.target.value })
                  }
                  placeholder="Definition..."
                  className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    placeholder="e.g. Financial Metrics"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1.5">
                    Owner *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.owner}
                    onChange={(e) =>
                      setEditForm({ ...editForm, owner: e.target.value })
                    }
                    placeholder="e.g. Finance Team"
                    className="w-full rounded-lg border border-card-border bg-background p-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-card-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTerm(null);
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

      {/* Delete Term Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-card-border bg-card p-6 shadow-lg animate-scaleIn">
            <div className="flex items-center gap-3 border-b border-card-border pb-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 text-error flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Delete Glossary Term
                </h3>
                <p className="text-xs text-text-muted">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-error">
                {errorMessage}
              </div>
            )}

            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to permanently delete the term{" "}
              <strong className="text-text-primary">
                "{deletingTermName}"
              </strong>{" "}
              from the database?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTermId(null);
                  setDeletingTermName("");
                }}
                className="rounded-lg border border-card-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-error text-white px-4 py-2 text-sm font-semibold hover:bg-error/90 shadow-sm"
              >
                Delete Term
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
