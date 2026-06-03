"use client";

import { ChatComposer } from "@/components/chat/composer";
import { useChatSession } from "@/components/chat/session";

export function ChatConversationView() {
  const { messages, isLoading } = useChatSession();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 pb-4 pt-2 lg:px-6">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex min-h-full flex-col justify-end gap-4 py-6">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={isUser ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={[
                      "max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
                      isUser
                        ? "bg-white text-black"
                        : "border border-border/70 bg-background text-foreground",
                    ].join(" ")}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-3xl border border-border/70 bg-background px-4 py-3 text-sm leading-6 text-muted-foreground shadow-sm">
                  Thinking…
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 pt-4">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}
