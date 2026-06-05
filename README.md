# Shamba Sky 🌤️🌾

**Shamba Sky** is a cozy, artsy farm-weather web app for Kenyan smallholders. Compare up to three shamba plots side by side, pull live forecasts from [Weather-AI](https://weather-ai.co/docs), get Gemini-powered farming tips, and receive weather alert webhooks — all in English or Kiswahili.

Built as a take-home integration project for the Weather-AI developer platform.

---

## Live demo

| | URL |
|---|-----|
| **App** | `https://shamba-sky.onrender.com` *(replace with your deploy URL)* |
| **Health** | `https://shamba-sky.onrender.com/health` |
| **Webhook** | `https://shamba-sky.onrender.com/webhook` |

---

## Features

- **Multi-plot dashboard** — save up to 3 fields (name, lat/lon, crop, emoji) in `localStorage`
- **Side-by-side compare** — responsive grid for 1–3 plots
- **Weather-AI integration**
  - `GET /v1/weather?ai=true` — today's briefing + AI summary (`lang=en` \| `sw`)
  - `GET /v1/weather?ai=false` — 7-day chart data without burning AI quota
- **Gemini farmer tips** — personalized headline + 3 practical tips per plot ([Gemini API](https://ai.google.dev/gemini-api/docs))
- **Webhook alerts** — `POST /webhook` receives Weather-AI triggers; inbox on the home page
- **Print summary** — printable daily shamba log
- **Bilingual UI** — English / Kiswahili toggle

---

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** — warm farm aesthetic (Fredoka + Caveat fonts)
- **Weather-AI REST API** — server-side proxy (API key never sent to browser)
- **Google Gemini** — structured JSON farmer advice via `x-goog-api-key`
- **Deploy target** — Render (health check at `/health`)

---

## Quick start

### Prerequisites

- Node.js **20+**
- [Weather-AI API key](https://weather-ai.co/docs) (`wai_…`)
- [Gemini API key](https://ai.google.dev/gemini-api/docs) (for farmer tips)
- Weather-AI **Pro** plan (for webhooks in dashboard)

### Install & run

```bash
git clone <your-repo-url>
cd shamba-sky
npm install
cp .env.example .env.local
```

Edit **`.env.local`** in the `shamba-sky` folder *(not a parent-folder `.env` — Next.js only reads env from the app root)*:

```env
# Required — Weather-AI
WAI_API_KEY=wai_your_key_here

# Required for farmer tips — Google AI Studio
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional
NEXT_PUBLIC_HAS_GEMINI=true
NEXT_PUBLIC_WEBHOOK_URL=https://your-app.onrender.com/webhook
WEBHOOK_SECRET=
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verify integrations

```bash
# Health
curl http://localhost:3000/health

# Weather proxy (needs WAI_API_KEY)
curl "http://localhost:3000/api/weather?lat=-1.2921&lon=36.8219&days=1&ai=false"

# Gemini farmer tips
npm run test:gemini

# Webhook receiver
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"trigger":"rain","message":"Heavy rain expected tomorrow","lat":-1.2921,"lon":36.8219}'
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WAI_API_KEY` | Yes | Weather-AI bearer token (`wai_…`) |
| `GEMINI_API_KEY` | For tips | Google Gemini key from AI Studio |
| `GEMINI_MODEL` | No | Default `gemini-2.5-flash` (avoid `gemini-2.0-flash` — often 429 on free tier) |
| `NEXT_PUBLIC_HAS_GEMINI` | No | Shows Gemini note in footer |
| `NEXT_PUBLIC_WEBHOOK_URL` | No | Displayed in webhook setup UI |
| `WEBHOOK_SECRET` | No | If set, incoming webhooks must send `x-webhook-secret` header |

See [ENV_SETUP.md](./ENV_SETUP.md) for troubleshooting.

---

## Deploy on Render

1. Push repo to GitHub.
2. **New Web Service** → connect repo → root directory `shamba-sky` (if monorepo) or repo root.
3. **Build command:** `npm install && npm run build`
4. **Start command:** `npm start`
5. **Health check path:** `/health`
6. Add all env vars from `.env.example` under **Environment**.

---

## Weather-AI webhook setup

In the [Weather-AI dashboard](https://weather-ai.co/docs) → **Webhooks & Alerts** (Pro+):

| Field | Value |
|-------|--------|
| Webhook URL | `https://<your-host>/webhook` |
| Timezone | `Africa/Nairobi` |
| Lat / Lon | Coordinates of the plot to monitor |

### Recommended coordinates

| Plot | Lat | Lon |
|------|-----|-----|
| Upper Plot — Nairobi *(default)* | `-1.2921` | `36.8219` |
| Tea Terrace — Bomet | `-0.7813` | `35.3419` |

One webhook = one location. Pro supports up to **10** webhooks. Use the lat/lon from your saved field cards if you edited them in the app.

Incoming alerts appear in the **Weather alerts (webhook)** panel on the home page.

---

## Architecture

```
Browser (React)
    │
    ├─► GET /api/weather          ──► Weather-AI GET /v1/weather
    ├─► POST /api/farmer-advice   ──► Gemini generateContent (structured JSON)
    ├─► GET /api/webhooks/alerts  ──► in-memory alert store
    │
Weather-AI dashboard
    └─► POST /webhook              ──► records alert → UI polls /api/webhooks/alerts
```

**Design choices**

- **Server-side API proxy** — `WAI_API_KEY` and `GEMINI_API_KEY` stay on the server
- **Dual weather fetch** — `ai=true` for briefing, `ai=false` for charts (saves AI quota on Free tier)
- **Flexible response normalizer** — handles varied Weather-AI JSON shapes
- **Gemini structured output** — `responseMimeType: application/json` + schema for reliable tips
- **Model fallback** — tries `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash`

---

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/` | GET | Main app UI |
| `/health` | GET | Render health check |
| `/webhook` | GET, POST | Weather-AI webhook receiver |
| `/api/weather` | GET | Proxy to Weather-AI `/v1/weather` |
| `/api/farmer-advice` | POST | Gemini farming tips for a plot |
| `/api/webhooks/alerts` | GET | Recent webhook events (last 20) |

### Weather proxy example

```
GET /api/weather?lat=-1.2921&lon=36.8219&days=7&ai=true&lang=sw&units=metric
```

### Farmer advice example

```bash
curl -X POST http://localhost:3000/api/farmer-advice \
  -H "Content-Type: application/json" \
  -d '{
    "fieldName": "Upper Plot — Nairobi",
    "crop": "maize",
    "lang": "en",
    "current": { "temp": 24, "condition": "Partly cloudy", "humidity": 60 },
    "daily": [{ "label": "Thu", "tempMax": 26, "tempMin": 18, "condition": "Sunny" }]
  }'
```

---

## Project structure

```
shamba-sky/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── weather/          # Weather-AI proxy
│   │   │   ├── farmer-advice/    # Gemini tips endpoint
│   │   │   └── webhooks/alerts/  # Alert feed for UI
│   │   ├── health/               # Render health check
│   │   ├── webhook/              # Weather-AI webhook receiver
│   │   ├── page.tsx              # Main dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── PlotPanel.tsx         # Per-plot weather + tips
│   │   ├── BriefingCard.tsx      # AI summary card
│   │   ├── ForecastChart.tsx     # 7-day bar chart
│   │   ├── FarmerTips.tsx        # Gemini tips display
│   │   ├── WebhookAlerts.tsx     # Webhook inbox + coord guide
│   │   └── FieldEditor.tsx       # Plot CRUD (localStorage)
│   └── lib/
│       ├── gemini.ts             # Gemini API client
│       ├── weather-normalize.ts  # Weather-AI response parser
│       ├── webhook-store.ts      # In-memory alert buffer
│       └── fields-storage.ts     # localStorage helpers
├── scripts/test-gemini.mts       # Gemini integration test
├── .env.example
├── ENV_SETUP.md
└── README.md
```

---

## Quota tips (Weather-AI Free tier)

- Charts use `?ai=false` → does not count against **200 AI requests/month**
- Each plot refresh = **2** weather calls (briefing + charts)
- Use **Refresh** only when you need new data
- Check `X-RateLimit-Remaining` headers in `/api/weather` responses

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |
| `npm run test:gemini` | Test Gemini farmer-advice integration |

---

## Author

Unwana — Weather-AI developer assessment submission.

## License

MIT
