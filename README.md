# Shamba Sky 🌤️🌾

A cute, artsy **farm plot weather brief** for Kenyan smallholders. Compare up to **3 shamba plots** side by side, get a **Weather-AI** briefing with AI summaries, view **7-day charts** without burning AI quota (`ai=false`), and optional **Gemini** farming tips.

Built for the [Weather-AI](https://weather-ai.co/docs) developer assessment.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![API](https://img.shields.io/badge/Weather--AI-v1-green)

## Features

- **Saved plots** — name, lat/lon, crop, emoji; persisted in `localStorage`
- **Side-by-side compare** — 1–3 plots in a responsive grid
- **Dual API strategy** per plot:
  - `GET /v1/weather?ai=true` — today's briefing + Weather-AI summary (`lang=en` or `sw`)
  - `GET /v1/weather?ai=false` — 7-day forecast for charts (saves AI quota)
- **Farmer tips** — optional `GEMINI_API_KEY` for personalized advice; sensible fallback without it
- **Printable summary** — print-friendly daily log header + plot list
- **English / Kiswahili** UI toggle

## Prerequisites

- Node.js 20+
- A Weather-AI API key (`wai_…`) from the [dashboard](https://weather-ai.co/docs)
- (Optional) Google Gemini API key for extra tips

## Setup

```bash
git clone <your-repo-url>
cd shamba-sky
npm install
cp .env.example .env.local
```

Edit **`shamba-sky/.env.local`** (not a `.env` file in the parent `Assessments/` folder — Next.js will not see it there).

```env
WAI_API_KEY=wai_your_actual_key
GEMINI_API_KEY=your_gemini_key   # optional
NEXT_PUBLIC_HAS_GEMINI=true      # optional, footer hint
```

See [ENV_SETUP.md](./ENV_SETUP.md) if keys don’t seem to load.

Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel recommended)

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables:
   - `WAI_API_KEY` (required)
   - `GEMINI_API_KEY` (optional)
   - `NEXT_PUBLIC_HAS_GEMINI=true` if using Gemini
4. Deploy — your live URL goes in the submission email.

Other hosts (Render, Railway, Netlify) work the same: build command `npm run build`, start `npm start`, Node 20+.

## API routes (server proxy)

| Route | Purpose |
|-------|---------|
| `GET /api/weather` | Proxies Weather-AI `/v1/weather` — key never exposed to browser |
| `POST /api/farmer-advice` | Gemini or fallback farming tips |

## Project structure

```
src/
  app/api/weather/     # Weather-AI proxy
  app/api/farmer-advice/
  components/          # UI: plots, briefing, charts, print
  lib/                 # Types, normalizer, localStorage
```

## Quota tips

- Charts use `?ai=false` to preserve your **200 AI requests/month** on Free.
- Use **Refresh** only when you need new data.
- Each plot load = 2 weather calls (briefing + charts).

## License

MIT — assessment submission project.
