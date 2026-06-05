"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, Database, CheckCircle2 } from "lucide-react";

export default function Header({ onMenuClick }) {
  const pathname = usePathname();

  // Simple breadcrumbs mapping
  const getPageTitle = (path) => {
    switch (path) {
      case "/":
        return "Dashboard";
      case "/glossary":
        return "Business Glossary";
      case "/tags":
        return "Governance Tags";
      case "/lineage":
        return "Data Lineage";
      case "/dataplex":
        return "Dataplex Architecture";
      case "/catalog":
        return "Metadata Catalog";
      case "/profiling":
        return "Data Profiling";
      case "/quality":
        return "Data Quality Rules";
      case "/support-lake":
        return "Customer Support Lake";
      default:
        return "Data Governance";
    }
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-card-border bg-card px-6 shadow-sm transition-colors duration-200">
      {/* Left side: Breadcrumb & Menu Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-background lg:hidden text-text-primary"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <nav className="hidden text-xs font-medium text-text-muted sm:flex items-center gap-1.5 mb-0.5">
            <span>GovPortal</span>
            <span>/</span>
            <span className="text-text-secondary">{pageTitle}</span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight text-text-primary leading-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Actions / Status */}
      <div className="flex items-center gap-4">
        {/* Database Status Indicator */}
        <div className="hidden items-center gap-2 rounded-full border border-card-border bg-background px-3 py-1.5 text-xs font-semibold text-text-secondary md:flex">
          <Database className="h-3.5 w-3.5 text-success animate-pulse" />
          <span className="text-text-muted">Database:</span>
          <span className="text-success flex items-center gap-1">
            SQLite Active <CheckCircle2 className="h-3 w-3 inline" />
          </span>
        </div>

        {/* Search Mock */}
        <div className="relative hidden max-w-xs sm:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search catalog, glossary..."
            className="w-48 rounded-lg border border-card-border bg-background py-1.5 pl-9 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200 focus:w-60"
          />
        </div>

        {/* Notifications and Profile */}
        <button
          className="relative rounded-lg p-2 hover:bg-background text-text-secondary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error" />
        </button>

        <div className="h-8 w-8 rounded-full bg-accent-light border border-accent/20 flex items-center justify-center font-bold text-accent text-xs select-none shadow-sm cursor-pointer hover:opacity-90">
          AD
        </div>
      </div>
    </header>
  );
}
