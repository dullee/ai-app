"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MODELS } from "@/lib/models";

export default function FoodInfoPage() {
  const [food, setFood] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!food.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setModel(null);

    try {
      const response = await fetch("/api/food-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setResult(data.text);
      setModel(data.model ?? MODELS.gemini);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Food Information</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <code>{MODELS.gemini}</code> generates a short description, typical
          ingredients, and a tip.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask about a dish</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="e.g. spicy ramen, avocado toast"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !food.trim()}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {result && (
            <div className="flex flex-col gap-2">
              {model && (
                <p className="font-mono text-xs text-muted-foreground">{model}</p>
              )}
              <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
