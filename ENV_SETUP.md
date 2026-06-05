# Environment variables — read this

Next.js **only** loads env files from **this folder** (`shamba-sky/`), not from the parent `Assessments/` folder.

## Correct location

```
shamba-sky/.env.local   ← put keys HERE
```

## Required variables

```env
WAI_API_KEY=wai_your_key_from_weather_ai_dashboard
GEMINI_API_KEY=your_gemini_key   # optional
```

## After changing env

1. Stop the dev server (`Ctrl+C`)
2. Run `npm run dev` again from `shamba-sky/`

Next.js may hot-reload `.env.local`, but a full restart is safest.

## Gemini (farmer tips)

Uses the [Gemini API](https://ai.google.dev/gemini-api/docs) with `x-goog-api-key` header (not query-string `?key=`).

```env
GEMINI_API_KEY=your_key_from_aistudio.google.com
GEMINI_MODEL=gemini-2.5-flash   # recommended; avoid gemini-2.0-flash (often 429 on free tier)
```

Test from project root:

```bash
npm run test:gemini
```

## Verify

Open in browser:

```
http://localhost:3000/api/weather?lat=-1.2921&lon=36.8219&days=1&ai=false
```

- `{"error":"WAI_API_KEY is not configured..."}` → key file missing or wrong folder
- `{"error":"Invalid or revoked API key."}` → key is loaded but rejected by Weather-AI — create a new key in the dashboard
- JSON with `"current"` and `"daily"` → working
