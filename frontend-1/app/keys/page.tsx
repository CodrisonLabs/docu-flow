"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Key, Cpu, Database as DbIcon, Loader2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LLM_PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google", name: "Google" },
  { id: "groq", name: "Groq" },
];

const DB_PROVIDERS = [
  { id: "pinecone", name: "Pinecone (Vector DB)" },
];

export default function APIKeysPage() {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [deleteKeyId, setDeleteKeyId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: apiKeys = [] } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: api.apiKeys.list,
  });

  const llmKeys = apiKeys.filter(k => LLM_PROVIDERS.some(p => p.id === k.provider));
  const dbKeys = apiKeys.filter(k => DB_PROVIDERS.some(p => p.id === k.provider));

  const addMutation = useMutation({
    mutationFn: () => api.apiKeys.create(provider, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setProvider("");
      setKey("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.apiKeys.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !key) return;
    setLoading(true);
    try {
      await addMutation.mutateAsync();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteKeyId === null) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteKeyId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteKeyId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-12 pb-20">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage your LLM and Database provider keys.</p>
        </div>

        <div className="space-y-10">
          {/* LLM Keys Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              <Cpu className="size-4" />
              <span>LLM Providers</span>
            </div>
            <div className="grid gap-3">
              {llmKeys.map((apiKey) => (
                <KeyCard key={apiKey.id} apiKey={apiKey} onDelete={() => setDeleteKeyId(apiKey.id)} />
              ))}
              {llmKeys.length === 0 && <EmptyState text="No LLM keys added." />}
            </div>
          </div>

          {/* Database Keys Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              <DbIcon className="size-4" />
              <span>Database (RAG)</span>
            </div>
            <div className="grid gap-3">
              {dbKeys.map((apiKey) => (
                <KeyCard key={apiKey.id} apiKey={apiKey} onDelete={() => setDeleteKeyId(apiKey.id)} />
              ))}
              {dbKeys.length === 0 && <EmptyState text="No Database keys added." />}
            </div>
          </div>

          {/* Add New Key Form - At the bottom */}
          <div className="pt-6 border-t border-border">
            <form onSubmit={handleAdd} className="p-6 border border-border rounded-2xl space-y-4 bg-card shadow-none">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Add New Key</h3>
                <p className="text-xs text-muted-foreground">Connect a new service to your workspace.</p>
              </div>
              <div className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Provider</label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="h-10 bg-transparent border-border focus:ring-0 rounded-xl">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llm_header" disabled className="text-[10px] font-bold text-muted-foreground bg-muted/30 py-1">LLM PROVIDERS</SelectItem>
                        {LLM_PROVIDERS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                        <SelectItem value="db_header" disabled className="text-[10px] font-bold text-muted-foreground bg-muted/30 border-t border-border mt-1 py-1">DATABASE PROVIDERS</SelectItem>
                        {DB_PROVIDERS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">API Key</label>
                    <Input 
                      type="password" 
                      value={key} 
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="Enter your key..."
                      className="h-10 bg-transparent border-border focus-visible:ring-0 rounded-xl"
                    />
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading || !provider || !key}
                className="w-full gap-2 rounded-xl shadow-none h-11 mt-2 font-medium"
              >
                <Plus className="size-4" />
                Connect Provider
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={deleteKeyId !== null} onOpenChange={(open) => !open && setDeleteKeyId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border">
          <DialogHeader>
            <DialogTitle>Remove API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this API key? You will need to add it again to use this provider.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteKeyId(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="rounded-xl shadow-none"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KeyCard({ apiKey, onDelete }: { apiKey: any, onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 px-4 border border-border rounded-2xl bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/50 rounded-xl text-accent-foreground">
          <Key className="size-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-tight">{apiKey.provider}</p>
          <p className="text-[10px] text-muted-foreground font-mono">••••••••••••••••</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon-sm" 
        onClick={onDelete}
        className="hover:text-destructive h-8 w-8 rounded-xl"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-6 border border-dashed border-border rounded-2xl text-center bg-accent/5">
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
