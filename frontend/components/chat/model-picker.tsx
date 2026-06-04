"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, KeyRound, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatSession } from "@/components/chat/session";

function displayProviderName(provider: string) {
  const normalized = provider.toLowerCase();

  if (normalized === "google" || normalized === "gemini") {
    return "Google";
  }

  if (normalized === "openai") return "OpenAI";
  if (normalized === "anthropic") return "Anthropic";
  if (normalized === "groq") return "Groq";
  if (normalized === "openrouter") return "OpenRouter";

  return provider;
}

export function ModelPicker() {
  const {
    providerModels,
    selectedApiKeyId,
    setSelectedApiKeyId,
    selectedModel,
    setSelectedModel,
    isLoadingProviders,
  } = useChatSession();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedKey = useMemo(() => {
    if (selectedApiKeyId !== null) {
      return providerModels.find((item) => item.id === selectedApiKeyId) ?? null;
    }

    return providerModels[0] ?? null;
  }, [providerModels, selectedApiKeyId]);

  const selectedModelItem = useMemo(() => {
    if (!selectedKey) return null;
    return (
      selectedKey.models.find((item) => item.id === selectedModel) ??
      selectedKey.models[0] ??
      null
    );
  }, [selectedKey, selectedModel]);

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

  useEffect(() => {
    if (!selectedKey) return;

    if (selectedApiKeyId !== selectedKey.id) {
      setSelectedApiKeyId(selectedKey.id);
    }

    const hasSelectedModel = selectedKey.models.some(
      (item) => item.id === selectedModel
    );

    if (!hasSelectedModel) {
      setSelectedModel(selectedKey.models[0]?.id ?? "");
    }
  }, [
    selectedKey,
    selectedApiKeyId,
    selectedModel,
    setSelectedApiKeyId,
    setSelectedModel,
  ]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoadingProviders}
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-xs font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="truncate">
          {selectedKey && selectedModelItem
            ? `${displayProviderName(selectedKey.provider)} · ${selectedModelItem.display_name}`
            : isLoadingProviders
              ? "Loading models..."
              : "Select model"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(460px,84vw)] overflow-hidden rounded-[24px] border border-border/70 bg-background p-2 shadow-2xl">
          <div className="px-2 pb-2 pt-1 text-xs uppercase tracking-wider text-muted-foreground">
            Choose a model
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {providerModels.length === 0 ? (
              <div className="px-2 py-6 text-sm text-muted-foreground">
                No provider keys found. Add a key first.
              </div>
            ) : (
              providerModels.map((key) => {
                const activeKey = key.id === selectedKey?.id;

                return (
                  <div key={key.id} className="space-y-1">
                    <div className="flex items-center justify-between px-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {displayProviderName(key.provider)}
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-1 text-[11px] text-muted-foreground">
                        <KeyRound className="h-3 w-3" />
                        Key #{key.id}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {key.models.map((model) => {
                        const active = activeKey && model.id === selectedModel;

                        return (
                          <button
                            key={`${key.id}:${model.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedApiKeyId(key.id);
                              setSelectedModel(model.id);
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition",
                              active ? "bg-accent/80 text-foreground" : "hover:bg-accent/60"
                            )}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{model.display_name}</div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {model.description || "Supported model"}
                              </div>
                            </div>

                            <div className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              Ready
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}