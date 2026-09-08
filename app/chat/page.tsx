"use client";

import { SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MODELS } from "@/lib/models";

type Message = {
  role: "user" | "model";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);

  async function onSubmit(event: SubmitEvent) {
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
      setModel(data.model ?? MODELS.gemini);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Intelligent Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Powered by <code>{MODELS.gemini}</code> via{" "}
          <code>@google/generative-ai</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex min-h-64 flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
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
                    ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[85%] rounded-lg bg-background px-3 py-2 text-sm shadow-sm"
                }
              >
                {message.content}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {model && (
            <p className="font-mono text-xs text-muted-foreground">{model}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
