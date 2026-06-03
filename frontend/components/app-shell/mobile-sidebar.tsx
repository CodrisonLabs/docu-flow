"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BookOpenText,
  FolderKanban,
  KeyRound,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { label: "New chat", icon: Sparkles, href: "/" },
  { label: "Search chats", icon: Search, href: "/" },
  { label: "Knowledge Base", icon: BookOpenText, href: "/kb" },
  { label: "API Keys", icon: KeyRound, href: "/keys" },
  { label: "Projects", icon: FolderKanban, href: "#" },
  { label: "Apps", icon: LayoutGrid, href: "#" },
  { label: "Codex", icon: Bot, href: "#" },
  { label: "Settings", icon: Settings2, href: "#" },
  { label: "More", icon: MoreHorizontal, href: "#" },
];

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "absolute left-0 top-0 flex h-full w-[86vw] max-w-[320px] flex-col border-r border-border/70 bg-background shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full border border-border/70">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">DocuFlow</span>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 transition hover:bg-accent"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <button className="flex h-11 w-full items-center gap-3 rounded-xl bg-white/10 px-3 text-left text-sm font-medium text-foreground ring-1 ring-white/10 transition hover:bg-white/12">
            <Sparkles className="h-4 w-4" />
            <span>New chat</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {mobileItems.slice(1).map((item) => {
              const Icon = item.icon;
              const active =
                item.href !== "#" &&
                ((item.href === "/" && pathname === "/") || pathname === item.href);

              const baseClass =
                "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition";

              const activeClass = active
                ? "bg-accent/70 text-foreground"
                : "text-foreground/90 hover:bg-accent/60";

              if (item.href !== "#" && item.href) {
                return (
                  <Link key={item.label} href={item.href} className={cn(baseClass, activeClass)}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  className={cn(baseClass, activeClass)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recents
          </div>
          <div className="mt-2 space-y-1">
            <button className="flex h-10 w-full items-center rounded-xl px-3 text-left text-sm text-foreground/90 transition hover:bg-accent/60">
              Front-end Setup in Next.js
            </button>
          </div>
        </nav>

        <div className="border-t border-border/70 p-3">
          <div className="flex items-center justify-between rounded-2xl px-2 py-1.5 transition hover:bg-accent/40">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-yellow-400 text-[11px] font-semibold text-black">
                CW
              </div>
              <div>
                <div className="text-sm font-medium">Codrison Work</div>
                <div className="text-xs text-muted-foreground">Free</div>
              </div>
            </div>
            <button className="rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium transition hover:bg-accent">
              Upgrade
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}