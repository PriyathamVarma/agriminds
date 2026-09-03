"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { cx } from "@/shared/lib/utils";
import { NAV_BY_VARIANT, type DashboardNavItem, type DashboardNavVariant } from "./dashboardNavConfig";

export type { DashboardNavItem } from "./dashboardNavConfig";

function NavLinks({
  navItems,
  pathname,
  collapsed,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const isActive = (item: DashboardNavItem) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-primary text-primary-foreground" : "text-deep-foreground/75 hover:bg-deep-elevated hover:text-deep-foreground",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="h-4.5 w-4.5 flex-none" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardShell({
  variant,
  sectionLabel,
  userName,
  userRoleLabel,
  children,
}: {
  variant: DashboardNavVariant;
  sectionLabel: string;
  userName: string;
  userRoleLabel: string;
  children: React.ReactNode;
}) {
  const navItems = NAV_BY_VARIANT[variant];
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-svh w-full bg-surface">
      {/* Desktop sidebar */}
      <aside
        className={cx(
          "sticky top-0 hidden h-svh flex-col border-r border-deep-border bg-deep transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex h-16 flex-none items-center justify-between border-b border-deep-border px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center">
              <Image
                src="/brand/images/agriminds_svg.svg"
                alt="AgriMinds"
                width={612}
                height={139}
                className="h-6 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-deep-foreground/60 transition hover:bg-deep-elevated hover:text-deep-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>
        <NavLinks navItems={navItems} pathname={pathname} collapsed={collapsed} />
        <div className="flex-none border-t border-deep-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={cx(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-deep-foreground/75 transition hover:bg-deep-elevated hover:text-deep-foreground",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4.5 w-4.5 flex-none" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-deep/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="relative flex h-full w-72 flex-col bg-deep">
            <div className="flex h-16 flex-none items-center justify-between border-b border-deep-border px-4">
              <Image
                src="/brand/images/agriminds_svg.svg"
                alt="AgriMinds"
                width={612}
                height={139}
                className="h-6 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-deep-foreground/60 hover:bg-deep-elevated hover:text-deep-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks navItems={navItems} pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <div className="flex-none border-t border-deep-border p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-deep-foreground/75 hover:bg-deep-elevated hover:text-deep-foreground"
              >
                <LogOut className="h-4.5 w-4.5 flex-none" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex min-h-svh flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 flex-none items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-body hover:bg-surface lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground-heading">{sectionLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground-heading">{userName}</p>
              <p className="text-xs text-foreground-muted">{userRoleLabel}</p>
            </div>
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
              {userName.trim().charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
