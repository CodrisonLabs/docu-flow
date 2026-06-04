"use client";

import React from "react";
import { useConversations } from "@/hooks/use-conversations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Sparkles, Database, Shield } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { createConversation } = useConversations();

  const handleStart = () => {
    router.push('/chat');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto border border-primary/10">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">DocuFlow</h1>
          <p className="text-muted-foreground">
            Ultra-minimal AI workspace for your documents and ideas.
          </p>
        </div>

        <div className="grid gap-3 pt-4">
          <Button 
            onClick={handleStart}
            size="lg" 
            className="w-full gap-2 rounded-xl shadow-none h-12 text-base font-medium"
          >
            <MessageSquarePlus className="size-5" />
            Start a new conversation
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 border border-border rounded-xl text-left space-y-2">
              <Database className="size-4 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">RAG Ready</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Connect your knowledge base for context-aware AI.</p>
            </div>
            <div className="p-4 border border-border rounded-xl text-left space-y-2">
              <Shield className="size-4 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Private</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Your data remains yours. Bring your own API keys.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-8">
          DocuFlow • Ultra-Premium AI Interface
        </p>
      </div>
    </div>
  );
}
