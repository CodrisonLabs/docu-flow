"use client";

import { useMemo, useState } from "react";
import { Mic, Paperclip, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatSession } from "@/components/chat/session";
import { ModelPicker } from "@/components/chat/model-picker";

type ChatComposerProps = {
  placeholder?: string;
  disabled?: boolean;
};

export function ChatComposer({
  placeholder = "Ask anything",
  disabled = false,
}: ChatComposerProps) {
  const [message, setMessage] = useState("");

  const {
    sendMessage,
    isLoading,
    isLoadingProviders,
    providerModels,
    selectedApiKeyId,
    selectedModel,
  } = useChatSession();

  const hasProviders = providerModels.length > 0;
  const hasSelection = selectedApiKeyId !== null && selectedModel.length > 0;

  const canSend = useMemo(
    () =>
      message.trim().length > 0 &&
      !disabled &&
      !isLoading &&
      !isLoadingProviders &&
      hasProviders &&
      hasSelection,
    [message, disabled, isLoading, isLoadingProviders, hasProviders, hasSelection]
  );

  async function handleSubmit() {
    if (!canSend) return;

    const value = message.trim();
    setMessage("");
    await sendMessage(value);
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/12 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <ModelPicker />
        <div className="text-xs text-muted-foreground">
          {isLoadingProviders
            ? "Loading provider keys..."
            : hasProviders
              ? "Models are loaded from your saved API keys"
              : "Connect a provider key to unlock models"}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/60 bg-background/40 transition hover:bg-accent"
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <div className="min-h-20 flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                void handleSubmit();
              }
            }}
            rows={3}
            placeholder={placeholder}
            disabled={disabled || isLoading || isLoadingProviders || !hasSelection}
            className={cn(
              "min-h-20 w-full resize-none bg-transparent px-1 py-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground",
              (disabled || isLoading || isLoadingProviders || !hasSelection) &&
                "cursor-not-allowed opacity-60"
            )}
          />

          <div className="flex items-center justify-between gap-3 px-1 pb-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Press ⌘/Ctrl + Enter to send</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/40 transition hover:bg-accent"
                aria-label="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSend}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full transition",
                  canSend
                    ? "bg-white text-black hover:scale-[1.02]"
                    : "cursor-not-allowed bg-white/20 text-white/40"
                )}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}