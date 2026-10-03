# ks-buddy

A clickable apprenticeship evidence prototype centred on talking to Buddy about your day. Review suggested Knowledge, Skills and Behaviours (KSB) mappings, track evidence coverage, import CSV/JSON activities and generate progress reports.

**Stack:** Next.js (App Router) · React 19 · TypeScript · Supabase (Postgres + Auth) · deployable on Vercel.

## Set up

1. **Supabase project.** Create one at [supabase.com](https://supabase.com), then run [supabase/migrations/0001_records.sql](supabase/migrations/0001_records.sql) in the SQL editor (or `supabase db push` with the Supabase CLI). It creates the `records` table with row level security, so each user only sees their own activities.
2. **Environment.** Copy `.env.example` to `.env.local` and fill in your project URL and publishable (anon) key from *Project Settings → API*.
3. **Auth URLs.** In *Authentication → URL Configuration*, set the Site URL to your deployed URL and add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback` to the redirect URLs. (For quick local testing you can switch off *Confirm email* under *Authentication → Providers → Email*.)
4. **Run.**

```sh
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

## Deploy to Vercel

Import the repo in Vercel (framework preset: Next.js, no build settings needed) and add the two environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Then add the Vercel URL to Supabase's redirect URLs (step 3 above).

## Features

- Conversation-led daily capture with editable simulated KSB suggestions
- Individual evidence trackers and KSB timelines
- CSV/JSON import with validation and row selection
- Progress reports, text downloads and printing to PDF
- Email/password accounts; activities stored per user in Supabase
- Optional sample data, separate from your own record

## Import format

CSV requires `date` (YYYY-MM-DD) and `work` (or `description`). Optional columns: `learning`, `hours`, `project`, `otj`, `codes`, `evidence`. Separate KSB codes with semicolons, for example `K1;S3`. Use the in-app example download to see the format.

## Prototype limitations

Buddy's analysis uses local rules, not a live AI service. KSB descriptions are illustrative; evidence coverage is not a prediction of passing. Attachments save filenames/references only.

## Layout

- `src/app/(app)/`: signed-in pages (Buddy home, daily log, analysis, progress, report, import, history, KSB detail)
- `src/app/login/`, `src/app/auth/callback/`: sign-in/up and email confirmation
- `src/components/`: app shell, shared UI, and `WorkspaceProvider` (records, draft and demo state)
- `src/lib/`: KSB data and progress maths, suggestion rules, importers, Supabase clients
- `src/proxy.ts`: refreshes the Supabase session and redirects signed-out visitors to `/login`
- `supabase/migrations/`: database schema
