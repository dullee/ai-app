# AI Demo App

Single-page Next.js demo that combines Gemini, free FLUX image generation, and a floating chat widget.

## Features

| Feature | Model / backend | Notes |
| --- | --- | --- |
| Floating chat (bottom-right) | `gemini-3.6-flash` | Free-tier Gemini text chat |
| Ingredients extraction | `gemini-3.6-flash` | Pulls food ingredients from free-form text |
| Image captioning | `gemini-3.6-flash` | Vision caption for an uploaded photo |
| Image generation | `black-forest-labs/FLUX.1-schnell` via [Pollinations](https://pollinations.ai) | Free, no API key |
| Image generation | `stabilityai/stable-diffusion-3-medium-diffusers` via Hugging Face | Needs `HF_TOKEN` |
| Optional Gemini image | `gemini-2.5-flash-image` | Paid Gemini plan required |

UI highlights:

- Tabbed main view (Ingredients / Generate Image / Analyze Image)
- Dark mode toggle (system preference + manual)
- API keys stay on the server in `app/api/*` routes

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- `@google/generative-ai` for Gemini
- Pollinations HTTP API for free FLUX images

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root:

```bash
# Required for chat, ingredients, and image captioning
GEMINI_API_KEY=your_gemini_api_key

# Optional — only needed if you use Hugging Face helpers later
HF_TOKEN=your_hf_token
```

Get a Gemini key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # run production build
npm run lint   # ESLint
```

## Project structure

```
app/
  page.tsx                 # single-page shell
  api/
    chat/                  # Gemini chat
    ingredients/           # ingredient extraction
    analyze-image/         # image captioning
    generate-image/        # FLUX (free) or Gemini image (paid)
components/
  app-shell.tsx            # tab switcher
  chat-widget.tsx          # floating chat
  features/                # feature panels
lib/
  models.ts                # shared model ids
  gemini.ts                # Gemini helpers
  flux.ts                  # free Pollinations FLUX helper
```

## Notes

- Pollinations anonymous image generation can be rate-limited (roughly one request every ~15 seconds).
- Gemini image generation requires a paid Gemini plan; free-tier quota for image models is `0`.
- Never commit `.env.local` — keep API keys out of git.
