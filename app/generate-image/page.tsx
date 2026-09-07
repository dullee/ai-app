"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState("a plate of fresh sushi on a wooden table");
  const [image, setImage] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setImage(data.image);
      setModel(data.model ?? null);
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
          Food Image Generation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Uses Stable Diffusion 3 via{" "}
          <code>@huggingface/inference</code>{" "}
          <code>InferenceClient.textToImage</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe the image</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "a bear eating honey pancakes"'
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </form>

          {loading && (
            <p className="text-sm text-muted-foreground">
              Generating image — this can take a while on first run.
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {model && image && (
            <p className="font-mono text-xs text-muted-foreground">{model}</p>
          )}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={prompt}
              className="max-h-[512px] w-full rounded-lg border border-border object-contain"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
