import { Search } from "lucide-react";
import { ChatComposer } from "@/components/chat/composer";

const quickActions = [
  "Create an image",
  "Write or edit",
  "Look something up",
];

export function ChatEmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 pb-10 pt-4">
      <div className="w-full max-w-4xl">
        <div className="text-center text-[34px] font-medium tracking-tight md:text-[40px]">
          Ready when you are.
        </div>

        <div className="mx-auto mt-12 w-full max-w-4xl">
          <ChatComposer />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {quickActions.map((label) => (
              <button
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground/90 transition hover:bg-accent"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full border border-border/70">
                  <Search className="h-3.5 w-3.5" />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}