import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MODELS } from "@/lib/models";

const demos = [
  {
    href: "/chat",
    title: "Intelligent Chat",
    model: MODELS.gemini,
    description: "Talk with Google Gemini through a simple chat UI.",
  },
  {
    href: "/food-info",
    title: "Food Information",
    model: MODELS.gemini,
    description: "Generate a short description, ingredients, and tip for any dish.",
  },
  {
    href: "/ingredients",
    title: "Ingredients Identification",
    model: MODELS.gemini,
    description: "Extract food ingredients mentioned in free-form text.",
  },
  {
    href: "/generate-image",
    title: "Food Image Generation",
    model: MODELS.imageGeneration,
    description: "Turn a text prompt into an image with Stable Diffusion 3.",
  },
  {
    href: "/analyze-image",
    title: "Image Capture & Analysis",
    model: MODELS.gemini,
    description: "Upload a photo and get an AI-generated caption.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">AI Demo App</h1>
        <p className="max-w-2xl text-muted-foreground">
          This project integrates Gemini for chat, food info, ingredients, and
          image captions, plus Stable Diffusion 3 for image generation. Keys
          stay on the server in API routes.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {demos.map((demo) => (
          <Link key={demo.href} href={demo.href} className="group">
            <Card className="h-full transition-colors group-hover:border-foreground/30">
              <CardHeader>
                <CardTitle>{demo.title}</CardTitle>
                <CardDescription>
                  <span className="mb-2 block font-mono text-xs text-foreground/70">
                    {demo.model}
                  </span>
                  {demo.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
