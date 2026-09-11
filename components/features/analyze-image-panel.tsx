"use client";

import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODELS } from "@/lib/models";

export function AnalyzeImagePanel() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(selected: File | null) {
    setFile(selected);
    setCaption(null);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || loading) return;

    setLoading(true);
    setError(null);
    setCaption(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setCaption(data.caption);
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
          Image Capture & Analysis
        </h1>
        <p className="text-sm text-muted-foreground">
          Caption an uploaded photo with <code>{MODELS.gemini}</code> vision.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Upload an image
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            disabled={loading}
          />
          <Button
            type="submit"
            className="self-start"
            disabled={loading || !file}
          >
            {loading ? "Analyzing..." : "Analyze image"}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      {preview && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Upload preview"
            className="max-h-72 w-full rounded-xl object-contain"
          />
        </section>
      )}

      {caption && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Caption
            </h2>
            {model && (
              <p className="font-mono text-xs text-muted-foreground">{model}</p>
            )}
          </div>
          <p className="text-sm leading-relaxed">{caption}</p>
        </section>
      )}
    </div>
  );
}
