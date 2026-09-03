"use client";

// Nav configs (including Lucide icon component references) must live in client-only code —
// passing them as props from a Server Component layout to <DashboardShell> tried to serialize
// the icon function across the RSC boundary and crashed at runtime ("Functions cannot be passed
// directly to Client Components"). DashboardShell picks the right list itself via `variant`.
import {
  LayoutDashboard,
  Building2,
  Users,
  ListChecks,
  Newspaper,
  FolderOpen,
  BarChart3,
  ClipboardList,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = { label: string; href: string; icon: LucideIcon; exact?: boolean };
export type DashboardNavVariant = "general" | "chapter" | "admin";

export const GENERAL_NAV: DashboardNavItem[] = [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true }];

export const CHAPTER_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/chapter", icon: LayoutDashboard, exact: true },
  { label: "Chapter Profile", href: "/dashboard/chapter/profile", icon: Building2 },
  { label: "Team", href: "/dashboard/chapter/team", icon: Users },
  { label: "Requirements", href: "/dashboard/chapter/requirements", icon: ListChecks },
  { label: "Updates", href: "/dashboard/chapter/updates", icon: Newspaper },
  { label: "Documents", href: "/dashboard/chapter/documents", icon: FolderOpen },
  { label: "Impact", href: "/dashboard/chapter/impact", icon: BarChart3 },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Chapters", href: "/admin/chapters", icon: Building2 },
  { label: "Applications", href: "/admin/applications", icon: ClipboardList },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
];

export const NAV_BY_VARIANT: Record<DashboardNavVariant, DashboardNavItem[]> = {
  general: GENERAL_NAV,
  chapter: CHAPTER_NAV,
  admin: ADMIN_NAV,
};
