"use client";

import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react";
import { type SubmitEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODELS } from "@/lib/models";

type Message = {
  role: "user" | "model";
  content: string;
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, loading]);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setError(null);
    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setMessages((prev) => [...prev, { role: "model", content: data.text }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(32rem,calc(100vh-6rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">Chat</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                {MODELS.gemini}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <XIcon />
            </Button>
          </div>

          <div
            ref={listRef}
            className="flex flex-1 flex-col gap-2 overflow-y-auto bg-muted/20 p-3"
          >
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask anything to start chatting.
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-background px-3 py-2 text-sm"
                }
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <p className="text-xs text-muted-foreground">Thinking…</p>
            )}
          </div>

          <div className="border-t border-border p-3">
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}
                className="h-9"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </Button>
            </form>
            {error && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
          </div>
        </div>
      )}

      <Button
        type="button"
        size="icon-lg"
        className="size-12 rounded-full shadow-lg"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <XIcon /> : <MessageCircleIcon />}
      </Button>
    </div>
  );
}
