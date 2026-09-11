"use client";

import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODELS } from "@/lib/models";

export function GenerateImagePanel() {
  const [prompt, setPrompt] = useState(
    "a plate of fresh sushi on a wooden table",
  );
  const [image, setImage] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(
    MODELS.imageGeneration,
  );

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setImage(data.image);
      setModel(data.model ?? selectedModel);
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
          Food Image Generation
        </h1>
        <p className="text-sm text-muted-foreground">
          Free <code>{MODELS.imageGeneration}</code> via Pollinations. Gemini
          image needs a paid plan.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Describe the image
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Select
            value={selectedModel}
            onValueChange={(value) => {
              if (value != null) setSelectedModel(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MODELS.imageGeneration}>
                {MODELS.imageGeneration}
              </SelectItem>
              <SelectItem value={MODELS.geminiImage}>
                {MODELS.geminiImage}
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "a bear eating honey pancakes"'
            disabled={loading}
          />
          <Button
            type="submit"
            className="self-start"
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </form>

        {loading && (
          <p className="text-sm text-muted-foreground">
            Generating image — this can take a while on first run.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      {image && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Result</h2>
            {model && (
              <p className="font-mono text-xs text-muted-foreground">{model}</p>
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={prompt}
            className="max-h-[512px] w-full rounded-xl object-contain"
          />
        </section>
      )}
    </div>
  );
}
