# SyncPlay - YouTube Music Clone

SyncPlay is a pixel-perfect clone of YouTube Music featuring real-time playback synchronization between two partners ("You" and "Radhika").

## Features
- **YouTube Music Pixel-Perfect Clone**: Replicates the layout, typography, chips, sidebars, and dark mode exactly.
- **Zero-Latency Real-Time Sync**: Utilizes Supabase Realtime Broadcasts (<100ms lag) for play, pause, seek, and track changes.
- **Background Audio**: Connects to the YouTube iframe API for completely free streaming (no API key needed).
- **Partner Heartbeats**: Shows online presence and live sync status in real time.
- **Live Search**: Filters tracks instantly without server requests.

## Stack
- Next.js 14 App Router
- Zustand for State Management
- Tailwind CSS (ytDark, ytBlack, ytRed colors)
- Supabase (Postgres & Realtime)
- react-youtube

## Setup Instructions
1. **Clone the Repo**
   ```bash
   git clone <repo>
   cd syncplay
   npm install
   ```

2. **Supabase Database**
   Go to Supabase.com and create a project.
   Run the schema found in `supabase/schema.sql` in the SQL Editor.

3. **Environment setup**
   Copy `.env.local.example` to `.env.local` and add your Supabase URL and Anon key.

4. **Deploy**
   Use `./deploy.sh` to seamlessly deploy to Vercel.

## Environment Variables

| Variable | Description |
|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public access key for the API |
| `VERCEL_TOKEN` | (GitHub Secrets only) deployment token |
| `VERCEL_ORG_ID` | (GitHub Secrets only) vercel org id |
| `VERCEL_PROJECT_ID`| (GitHub Secrets only) vercel project id |

## Final Checklist
1. `npm install`
2. Supabase SQL executed
3. `cp .env.local.example .env.local`
4. Set Keys in `.env.local`
5. `npm run dev`
6. Test in dual browsers (Host + Guest)
7. Make sure YouTube iframe loads
8. Make sure SyncToasts fire
9. Set Vercel secrets in GitHub repo
10. Run `setup.sh` to initialize Git + GitHub
11. Run `deploy.sh` for Vercel
12. Share live URL with partner!
