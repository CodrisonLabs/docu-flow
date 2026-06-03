"use client";

import { Circle, ChevronDown, Menu, Sparkles } from "lucide-react";

type AppTopbarProps = {
  onOpenSidebar: () => void;
};

export function AppTopbar({ onOpenSidebar }: AppTopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-background transition hover:bg-accent lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button className="inline-flex items-center gap-1.5 text-base font-semibold tracking-tight">
          <span>DocuFlow</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-foreground transition hover:bg-accent">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Upgrade</span>
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-accent">
          <Circle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}