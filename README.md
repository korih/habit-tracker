# Streak & XP Tracker

A habit-tracking web application that lets you add skills, log daily practice sessions, and maintain streaks. Built with React + Vite, backed by Supabase (Postgres + Auth).

## Features

- **Google & Apple sign-in** via Supabase OAuth
- **Per-user data** – habits are private and synced across all your devices
- Add / rename / delete skills
- Log practice time in 30-min or 1-hour increments
- Automatic streak calculation and XP totals
- Manual historical data entry
- JSON export / import for backup

## Tech Stack

| Layer      | Choice                        |
|------------|-------------------------------|
| Frontend   | React 19 + Vite 7             |
| Styling    | CSS Modules                   |
| Backend    | Supabase (Postgres + Auth)    |
| Auth       | Google OAuth, Apple OAuth     |

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, paste and run the contents of [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).

### 2. Enable OAuth providers

In your Supabase dashboard, go to **Authentication → Providers** and enable:

- **Google** – create a Google Cloud OAuth 2.0 client at [console.cloud.google.com](https://console.cloud.google.com) and paste the client ID and secret.
- **Apple** – follow the [Supabase Apple OAuth guide](https://supabase.com/docs/guides/auth/social-login/auth-apple) to create a Service ID and key.

Add your app's URL (e.g. `http://localhost:5173`) to the **Redirect URLs** allow-list in **Authentication → URL Configuration**.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values from your Supabase project's **Settings → API** page:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deployment

Build a static bundle and deploy to any static host (Cloudflare Pages, Vercel, Netlify, etc.):

```bash
npm run build   # outputs to dist/
```

For **Cloudflare Pages**, point the build output directory to `dist` and set the same environment variables in the Pages project settings.

Remember to add your production domain to the Supabase **Redirect URLs** allow-list and to the OAuth app's authorised redirect URIs.
