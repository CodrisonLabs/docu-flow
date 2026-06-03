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
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

const sidebarItems = [
  { label: "Search chats", icon: Search, href: "/" },
  { label: "Knowledge Base", icon: BookOpenText, href: "/kb" },
  { label: "API Keys", icon: KeyRound, href: "/keys" },
  { label: "Projects", icon: FolderKanban, href: "#" },
  { label: "Apps", icon: LayoutGrid, href: "#" },
  { label: "Codex", icon: Bot, href: "#" },
  { label: "Settings", icon: Settings2, href: "#" },
  { label: "More", icon: MoreHorizontal, href: "#" },
];

type SidebarProps = {
  collapsed: boolean;
  onCollapse: () => void;
  conversations: Conversation[];
  loading?: boolean;
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: number) => void;
};

export function AppSidebar({
  collapsed,
  onCollapse,
  conversations,
  loading = false,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-border/70 bg-background lg:flex lg:flex-col",
        collapsed ? "w-[84px]" : "w-[280px]"
      )}
    >
      <div
        className={cn(
          "group flex items-center py-3",
          collapsed ? "justify-center px-3" : "justify-between px-3"
        )}
      >
        {collapsed ? (
          <button
            onClick={onCollapse}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border/70 transition-all duration-200 hover:bg-accent"
            aria-label="Expand sidebar"
          >
            <span className="absolute inset-0 grid place-items-center opacity-100 transition-opacity duration-200 group-hover:opacity-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <PanelLeftOpen className="h-4 w-4" />
            </span>
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full border border-border/70">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">DocuFlow</span>
            </div>

            <button
              onClick={onCollapse}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className="px-2">
        <button
          onClick={onNewChat}
          className={cn(
            "flex h-11 w-full items-center rounded-xl bg-white/10 text-sm font-medium ring-1 ring-white/10 transition hover:bg-white/15",
            collapsed ? "justify-center" : "gap-3 px-3 text-left"
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>New chat</span>}
        </button>
      </div>

      <nav className="mt-3 flex-1 overflow-y-auto px-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href !== "#" &&
              ((item.href === "/" && pathname === "/") || pathname === item.href);

            const baseClass = cn(
              "flex h-10 w-full items-center rounded-xl text-sm transition",
              collapsed ? "justify-center" : "gap-3 px-3"
            );

            const activeClass = active
              ? "bg-accent/70 text-foreground"
              : "text-foreground/90 hover:bg-accent/60";

            if (item.href !== "#" && item.href) {
              return (
                <Link key={item.label} href={item.href} className={cn(baseClass, activeClass)}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                className={cn(baseClass, "text-foreground/90 hover:bg-accent/60")}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {!collapsed && (
          <>
            <div className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recents
            </div>

            <div className="mt-2 space-y-1 px-1">
              {loading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
              ) : conversations.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => {
                  const active = conversation.id === activeConversationId;

                  return (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group flex h-10 items-center gap-2 rounded-xl px-3 transition",
                        active
                          ? "bg-accent/70 text-foreground"
                          : "text-foreground/90 hover:bg-accent/60"
                      )}
                    >
                      <button
                        onClick={() => onSelectConversation(conversation.id)}
                        className="min-w-0 flex-1 text-left"
                        title={conversation.title}
                      >
                        <span className="block truncate text-sm">
                          {conversation.title}
                        </span>
                      </button>

                      <button
                        onClick={() => onDeleteConversation(conversation.id)}
                        className="grid h-8 w-8 place-items-center rounded-full opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete conversation ${conversation.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-border/70 p-3">
        <div
          className={cn(
            "flex items-center rounded-2xl transition hover:bg-accent/40",
            collapsed ? "justify-center p-1" : "justify-between px-2 py-1.5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-yellow-400 text-[11px] font-semibold text-black">
              CW
            </div>

            {!collapsed && (
              <div>
                <div className="text-sm font-medium">Codrison Work</div>
                <div className="text-xs text-muted-foreground">Free</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button className="rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium transition hover:bg-accent">
              Upgrade
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}