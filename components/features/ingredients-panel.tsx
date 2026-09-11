"use client";

import { type SubmitEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Ingredients Identification
        </h1>
        <p className="text-sm text-muted-foreground">
          Extract food ingredients from free-form text with{" "}
          <code>{MODELS.gemini}</code>.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Meal or recipe text
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            disabled={loading}
          />
          <Button
            type="submit"
            className="self-start"
            disabled={loading || !text.trim()}
          >
            {loading ? "Detecting..." : "Detect ingredients"}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      {(ingredients.length > 0 || (model && !loading && !error)) && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Identified ingredients
            </h2>
            {model && (
              <p className="font-mono text-xs text-muted-foreground">{model}</p>
            )}
          </div>

          {ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary">
                  {ingredient}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No food entities detected. Try a more descriptive sentence.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
