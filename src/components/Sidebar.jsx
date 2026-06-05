"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  GitBranch,
  Layers,
  Database,
  BarChart3,
  ShieldCheck,
  LifeBuoy,
  Sun,
  Moon,
  X,
  ShieldAlert,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Business Glossary", href: "/glossary", icon: BookOpen },
    { name: "Governance Tags", href: "/tags", icon: Tag },
    { name: "Data Lineage", href: "/lineage", icon: GitBranch },
    { name: "Dataplex Architecture", href: "/dataplex", icon: Layers },
    { name: "Metadata Catalog", href: "/catalog", icon: Database },
    { name: "Data Profiling", href: "/profiling", icon: BarChart3 },
    { name: "Data Quality Rules", href: "/quality", icon: ShieldCheck },
    { name: "Customer Support Lake", href: "/support-lake", icon: LifeBuoy },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold shadow-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-wide block leading-none text-white">
                GovPortal
              </span>
              <span className="text-[10px] text-text-muted font-medium tracking-wider uppercase">
                Enterprise Data
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 hover:bg-sidebar-accent lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? "" : "text-sidebar-foreground/50"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with Theme Toggle */}
        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white transition-colors"
          >
            <span className="flex items-center gap-3">
              {theme === "dark" ? (
                <>
                  <Sun className="h-5 w-5 text-amber-400" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 text-indigo-400" />
                  Dark Mode
                </>
              )}
            </span>
            <div className="relative h-6 w-11 rounded-full bg-sidebar-accent transition-colors p-1">
              <div
                className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
