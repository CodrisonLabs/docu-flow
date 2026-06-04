"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-shell/sidebar";
import { AppTopbar } from "@/components/app-shell/topbar";
import { MobileSidebar } from "@/components/app-shell/mobile-sidebar";
import { useChatSession } from "@/components/chat/session";
import { useConversations } from "@/hooks/use-conversations";
import { api } from "@/lib/api";

export function AppChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    conversationId,
    loadConversationMessages,
    clearMessages,
    setConversationId,
  } = useChatSession();

  const { conversations, loading, refresh } = useConversations();

  async function handleDeleteConversation(id: number) {
    const confirmed = window.confirm(
      "Delete this conversation? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      await api.conversations.remove(id);

      if (conversationId === id) {
        clearMessages();
        setConversationId(null);
        router.replace("/");
      }

      await refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full overflow-hidden">
        <AppSidebar
          collapsed={collapsed}
          onCollapse={() => setCollapsed((v) => !v)}
          conversations={conversations}
          loading={loading}
          activeConversationId={conversationId}
          onSelectConversation={(id) => {
            router.replace("/");
            void loadConversationMessages(id);
            setMobileOpen(false);
          }}
          onNewChat={() => {
            router.replace("/");
            clearMessages();
            setConversationId(null);
            setMobileOpen(false);
          }}
          onDeleteConversation={(id) => {
            void handleDeleteConversation(id);
          }}
        />

        <MobileSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppTopbar onOpenSidebar={() => setMobileOpen(true)} />
          <div className="flex-1 overflow-hidden">{children}</div>
        </section>
      </div>
    </main>
  );
}