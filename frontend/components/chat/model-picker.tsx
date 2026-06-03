"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODEL_GROUPS,
  findModel,
  isModelEnabled,
} from "@/lib/models";
import { useChatSession } from "@/components/chat/session";

export function ModelPicker() {
  const {
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
    availableProviders,
  } = useChatSession();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => {
    return (
      findModel(selectedProvider, selectedModel) ??
      MODEL_GROUPS[0]?.models[0] ??
      null
    );
  }, [selectedProvider, selectedModel]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-xs font-medium transition hover:bg-accent"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="truncate">
          {selected ? `${selected.providerLabel} · ${selected.label}` : "Select model"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(420px,80vw)] overflow-hidden rounded-[24px] border border-border/70 bg-background p-2 shadow-2xl">
          <div className="px-2 pb-2 pt-1 text-xs uppercase tracking-wider text-muted-foreground">
            Choose a model
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {MODEL_GROUPS.map((group) => {
              const providerAvailable = availableProviders.includes(group.provider);

              return (
                <div key={group.provider} className="space-y-1">
                  <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.providerLabel}
                  </div>

                  <div className="space-y-1">
                    {group.models.map((model) => {
                      const enabled = isModelEnabled(model, availableProviders);
                      const active =
                        model.provider === selectedProvider &&
                        model.model === selectedModel;

                      return (
                        <button
                          key={`${model.provider}:${model.model}`}
                          type="button"
                          disabled={!enabled}
                          onClick={() => {
                            if (!enabled) return;
                            setSelectedProvider(model.provider);
                            setSelectedModel(model.model);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition",
                            active
                              ? "bg-accent/80 text-foreground"
                              : enabled
                                ? "hover:bg-accent/60"
                                : "cursor-not-allowed opacity-45"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{model.label}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {model.description}
                            </div>
                          </div>

                          <div
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-medium",
                              enabled
                                ? "border border-border/70 bg-background text-muted-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {enabled ? "Ready" : providerAvailable ? "Unavailable" : "Connect key"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}