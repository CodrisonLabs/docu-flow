"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, LockKeyhole, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiKey } from "@/lib/types";

const PROVIDERS = [
  {
    value: "openai",
    label: "OpenAI",
    helper: "GPT models and chat completions",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    helper: "Claude models",
  },
  {
    value: "gemini",
    label: "Google / Gemini",
    helper: "Gemini models",
  },
  {
    value: "groq",
    label: "Groq",
    helper: "Fast model access",
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    helper: "Multi-model routing",
  },
  {
    value: "pinecone",
    label: "Pinecone",
    helper: "Knowledge base vector store",
  },
] as const;

function displayProviderName(provider: string) {
  const normalized = provider.toLowerCase();

  if (normalized === "gemini" || normalized === "google") {
    return "Google / Gemini";
  }

  const match = PROVIDERS.find(
    (item) => item.value.toLowerCase() === normalized
  );

  return match?.label ?? provider;
}

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectedProviders = useMemo(() => {
    return new Set(
      keys.map((key) => {
        const normalized = key.provider.toLowerCase();
        return normalized === "google" ? "gemini" : normalized;
      })
    );
  }, [keys]);

  async function loadKeys() {
    setLoading(true);
    setError(null);

    try {
      const data = await api.apiKeys.list();
      setKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadKeys();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = apiKey.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);

    try {
      await api.apiKeys.create({
        provider,
        key: trimmed,
      });

      setApiKey("");
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Delete this provider key? This cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      await api.apiKeys.remove(id);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete key");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 pb-4 pt-2 lg:px-6">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col overflow-hidden">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure provider vault
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Connect the providers you want to use in chat and knowledge base.
                Keys are saved on your backend and never shown again after storing.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-border/70 bg-background/60 px-4 py-3 shadow-sm backdrop-blur md:block">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Connected
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {connectedProviders.size}
              </div>
              <div className="text-xs text-muted-foreground">provider(s)</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur"
          >
            <div className="mb-4 flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Add a new provider key</div>
            </div>

            <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Provider
                </span>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground/40"
                >
                  {PROVIDERS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  API key
                </span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your secret key"
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/40"
                />
              </label>

              <button
                type="submit"
                disabled={saving || !apiKey.trim()}
                className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add key
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </form>

          <div className="rounded-[28px] border border-border/70 bg-card/70 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div>
                <div className="text-sm font-medium">Saved providers</div>
                <div className="text-xs text-muted-foreground">
                  Manage or remove connected keys
                </div>
              </div>
            </div>

            <div className="p-3">
              {loading ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : keys.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                  No keys connected yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                          {displayProviderName(key.provider).slice(0, 1)}
                        </div>

                        <div>
                          <div className="text-sm font-medium">
                            {displayProviderName(key.provider)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Connected and ready
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => void handleDelete(key.id)}
                        disabled={deletingId === key.id}
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-xs font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === key.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}