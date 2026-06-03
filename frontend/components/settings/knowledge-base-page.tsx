"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileUp,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Database,
} from "lucide-react";
import { api } from "@/lib/api";
import type { KnowledgeBase, Namespace } from "@/lib/types";

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function namespaceAccent(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "KB";
}

type DocumentItem = {
  id?: number | string;
  title?: string;
  name?: string;
  filename?: string;
  created_at?: string;
  createdAt?: string;
};

export function KnowledgeBasePage() {
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [namespaceName, setNamespaceName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedNamespace = useMemo(
    () => namespaces.find((item) => item.id === selectedNamespaceId) ?? null,
    [namespaces, selectedNamespaceId]
  );

  async function loadKb() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.kb.get();
      setKb(data);
      setNamespaces(data.namespaces ?? []);
      const first = data.namespaces?.[0] ?? null;
      setSelectedNamespaceId((current) => current ?? first?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments(namespaceId: number) {
    setLoadingDocs(true);
    setError(null);
    try {
      const data = await api.kb.namespaces.documents(namespaceId);
      if (Array.isArray(data)) {
        setDocuments(data as DocumentItem[]);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setDocuments([]);
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoadingDocs(false);
    }
  }

  useEffect(() => {
    void loadKb();
  }, []);

  useEffect(() => {
    if (selectedNamespaceId !== null) {
      void loadDocuments(selectedNamespaceId);
    } else {
      setDocuments([]);
    }
  }, [selectedNamespaceId]);

  async function handleCreateNamespace(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = namespaceName.trim();
    if (!trimmed) return;

    setCreating(true);
    setError(null);
    try {
      const created = await api.kb.namespaces.create({ name: trimmed });
      setNamespaceName("");
      await loadKb();
      setSelectedNamespaceId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create namespace");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteNamespace(id: number) {
    const confirmed = window.confirm("Delete this namespace and all of its documents?");
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);
    try {
      await api.kb.namespaces.remove(id);
      if (selectedNamespaceId === id) {
        setSelectedNamespaceId(null);
        setDocuments([]);
      }
      await loadKb();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete namespace");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUploadFile(namespaceId: number, file: File) {
    setUploadingId(namespaceId);
    setError(null);
    try {
      await api.kb.namespaces.upload(namespaceId, file);
      await loadDocuments(namespaceId);
      await loadKb();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 pb-4 pt-2 lg:px-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col overflow-hidden">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Knowledge base manager
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Knowledge Base</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Organize your documents into namespaces, then connect them to chat for retrieval.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-border/70 bg-background/60 px-4 py-3 shadow-sm backdrop-blur md:block">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Namespaces</div>
            <div className="mt-1 text-2xl font-semibold">{namespaces.length}</div>
            <div className="text-xs text-muted-foreground">active workspace(s)</div>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
          <section className="rounded-[28px] border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Namespaces</div>
            </div>

            <form onSubmit={handleCreateNamespace} className="space-y-3">
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Create namespace
                </span>
                <div className="flex gap-2">
                  <input
                    value={namespaceName}
                    onChange={(e) => setNamespaceName(e.target.value)}
                    placeholder="e.g. Product docs"
                    className="h-12 flex-1 rounded-2xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/40"
                  />
                  <button
                    type="submit"
                    disabled={creating || !namespaceName.trim()}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add
                  </button>
                </div>
              </label>
            </form>

            {/* -- Changed: namespace rows use <div> instead of <button> to allow a nested <button> for delete without invalid HTML nesting -- */}
            <div className="mt-5 space-y-2">
              {loading ? (
                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : namespaces.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                  No namespaces yet.
                </div>
              ) : (
                namespaces.map((item) => {
                  const active = item.id === selectedNamespaceId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNamespaceId(item.id)}
                      className={[
                        "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition cursor-pointer",
                        active
                          ? "border-foreground/20 bg-foreground text-background"
                          : "border-border/70 bg-background hover:bg-accent/50",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={[
                            "grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold",
                            active ? "bg-background text-foreground" : "bg-white/10",
                          ].join(" ")}
                        >
                          {namespaceAccent(item.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{item.name}</div>
                          <div
                            className={[
                              "text-xs",
                              active ? "text-background/70" : "text-muted-foreground",
                            ].join(" ")}
                          >
                            Pinecone ref: {item.pinecone_ref}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteNamespace(item.id);
                        }}
                        disabled={deletingId === item.id}
                        className={[
                          "inline-flex h-9 w-9 items-center justify-center rounded-full transition",
                          active
                            ? "bg-background/15 hover:bg-background/20"
                            : "border border-border/70 hover:bg-accent",
                        ].join(" ")}
                        aria-label={`Delete namespace ${item.name}`}
                      >
                        {deletingId === item.id ? (
                          <Loader2
                            className={[
                              "h-4 w-4 animate-spin",
                              active ? "text-background" : "",
                            ].join(" ")}
                          />
                        ) : (
                          <Trash2
                            className={[
                              "h-4 w-4",
                              active ? "text-background" : "",
                            ].join(" ")}
                          />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Documents</div>
                <div className="text-xs text-muted-foreground">
                  {selectedNamespace ? selectedNamespace.name : "Select a namespace"}
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-medium transition hover:bg-accent">
                <Upload className="h-3.5 w-3.5" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file || !selectedNamespaceId) return;
                    void handleUploadFile(selectedNamespaceId, file);
                    e.currentTarget.value = "";
                  }}
                  disabled={!selectedNamespaceId || uploadingId !== null}
                />
              </label>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/60">
              {loadingDocs ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Loading documents…
                </div>
              ) : selectedNamespaceId === null ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Choose a namespace to see documents.
                </div>
              ) : documents.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <FileUp className="h-5 w-5" />
                  No documents uploaded yet.
                </div>
              ) : (
                <div className="divide-y divide-border/70">
                  {documents.map((doc, index) => {
                    const name = doc.title ?? doc.name ?? doc.filename ?? `Document ${index + 1}`;
                    const created = doc.created_at ?? doc.createdAt;
                    return (
                      <div key={String(doc.id ?? index)} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">
                            {created ? formatDate(created) : "Uploaded document"}
                          </div>
                        </div>
                        <div className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                          Saved
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {uploadingId !== null ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Uploading document…
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}