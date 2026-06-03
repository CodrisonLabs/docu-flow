"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/app-shell/app-chrome";
import { KnowledgeBasePage } from "@/components/settings/knowledge-base-page";
import { getToken } from "@/lib/auth";

export default function KBPage() {
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
      <KnowledgeBasePage />
    </AppChrome>
  );
}
