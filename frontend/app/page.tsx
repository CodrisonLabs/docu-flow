"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/app-shell/app-chrome";
import { ChatEmptyState } from "@/components/chat/empty-state";
import { ChatConversationView } from "@/components/chat/conversation-view";
import { useChatSession } from "@/components/chat/session";
import { getToken } from "@/lib/auth";

function ChatStage() {
  const { messages } = useChatSession();

  if (messages.length === 0) {
    return <ChatEmptyState />;
  }

  return <ChatConversationView />;
}

export default function Page() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </main>
    );
  }

  return (
    <AppChrome>
      <ChatStage />
    </AppChrome>
  );
}