"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Plus, 
  Database, 
  FileText, 
  Upload, 
  Folder,
  Loader2,
  FileIcon
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function KBPage() {
  const queryClient = useQueryClient();
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<number | null>(null);
  const [newNamespaceName, setNewNamespaceName] = useState("");
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: namespaces = [], isLoading: isLoadingNamespaces } = useQuery({
    queryKey: ["namespaces"],
    queryFn: api.kb.listNamespaces,
  });

  const { data: documents = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ["documents", selectedNamespaceId],
    queryFn: () => api.kb.listDocuments(selectedNamespaceId!),
    enabled: !!selectedNamespaceId,
  });

  // Mutations
  const createNamespaceMutation = useMutation({
    mutationFn: (name: string) => api.kb.createNamespace(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["namespaces"] });
      setNewNamespaceName("");
    },
  });

  const deleteNamespaceMutation = useMutation({
    mutationFn: (id: number) => api.kb.deleteNamespace(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["namespaces"] });
      if (selectedNamespaceId === variables) setSelectedNamespaceId(null);
    },
  });

  const handleCreateNamespace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamespaceName) return;
    createNamespaceMutation.mutate(newNamespaceName);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNamespaceId) return;

    setUploading(true);
    try {
      await api.kb.uploadDocument(selectedNamespaceId, file);
      queryClient.invalidateQueries({ queryKey: ["documents", selectedNamespaceId] });
    } catch (err) {
      console.error(err);
      alert("Failed to upload document. Make sure you have a Pinecone API key configured in Settings.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-1 min-h-0 bg-background overflow-hidden">
      {/* Sidebar for Namespaces */}
      <div className="w-64 border-r border-border flex flex-col bg-card/50">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Folder className="size-4" />
            Namespaces
          </h2>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-4">
            {namespaces.map((ns) => (
              <button
                key={ns.id}
                onClick={() => setSelectedNamespaceId(ns.id)}
                className={cn(
                  "group w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                  selectedNamespaceId === ns.id ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <span className="truncate">{ns.name}</span>
                <Trash2 
                  className="opacity-0 group-hover:opacity-100 size-3 hover:text-destructive transition-opacity" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNamespaceMutation.mutate(ns.id);
                  }}
                />
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border">
          <form onSubmit={handleCreateNamespace} className="flex gap-2">
            <Input 
              value={newNamespaceName}
              onChange={(e) => setNewNamespaceName(e.target.value)}
              placeholder="New namespace..."
              className="h-8 text-xs bg-transparent border-border focus-visible:ring-0"
            />
            <Button size="icon-sm" type="submit" disabled={!newNamespaceName} className="size-8 shrink-0 shadow-none">
              <Plus className="size-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content: Documents */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNamespaceId ? (
          <>
            <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50">
              <h2 className="text-sm font-semibold">
                {namespaces.find(n => n.id === selectedNamespaceId)?.name}
              </h2>
              <div className="flex items-center gap-3">
                <Input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="gap-2 h-8 border-border shadow-none rounded-md"
                  disabled={uploading}
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    {uploading ? "Uploading..." : "Upload Document"}
                  </label>
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="grid gap-2">
                  {documents.length > 0 ? (
                    documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-accent/50 rounded-md">
                            <FileIcon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.filename}</p>
                            <p className="text-xs text-muted-foreground uppercase">{doc.file_type}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center border border-dashed border-border rounded-xl">
                      <FileText className="size-8 mx-auto text-muted-foreground mb-3 opacity-20" />
                      <p className="text-sm text-muted-foreground">No documents in this namespace yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload files (PDF, TXT, CSV) to start building your knowledge base.</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/20">
            <div className="size-16 bg-accent/50 rounded-full flex items-center justify-center mb-4">
              <Database className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Select a Namespace</h2>
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
              Namespaces allow you to organize your documents into logical collections for RAG queries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
