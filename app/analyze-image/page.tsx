"use client";

import { SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MODELS } from "@/lib/models";

export default function AnalyzeImagePage() {
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

  async function onSubmit(event: SubmitEvent) {
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Image Capture & Analysis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Uses <code>{MODELS.gemini}</code> vision to caption what is in an
          uploaded photo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload an image</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Analyzing..." : "Analyze image"}
            </Button>
          </form>

          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Upload preview"
              className="max-h-72 w-full rounded-lg border border-border object-contain"
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {caption && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              {model && (
                <p className="mb-2 font-mono text-xs text-muted-foreground">
                  {model}
                </p>
              )}
              <p className="text-sm">{caption}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
