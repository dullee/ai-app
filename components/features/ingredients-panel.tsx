"use client";

import { type SubmitEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MODELS } from "@/lib/models";

export function IngredientsPanel() {
  const [text, setText] = useState(
    "Today's meal: Fresh olive poke bowl topped with chia seeds and avocado.",
  );
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    setIngredients([]);

    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setIngredients(data.ingredients ?? []);
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Ingredients Identification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Uses <code>{MODELS.gemini}</code> to extract food ingredients
          mentioned in free-form text.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paste meal or recipe text</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !text.trim()}>
              {loading ? "Detecting..." : "Detect ingredients"}
            </Button>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {ingredients.length > 0 && (
            <div className="flex flex-col gap-2">
              {model && (
                <p className="font-mono text-xs text-muted-foreground">{model}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <Badge key={ingredient} variant="secondary">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!loading && ingredients.length === 0 && model && !error && (
            <p className="text-sm text-muted-foreground">
              No food entities detected. Try a more descriptive sentence.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
