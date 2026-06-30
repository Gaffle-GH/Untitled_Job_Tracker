# Tracker — Job Application Tracker

Track job applications from Handshake, LinkedIn, and Indeed. Discover local jobs with a swipe-based interface.

## Features

- **Dashboard** — Donut or bar chart of application statuses (applied, rejected, interview rounds, offers)
- **Applications** — Sortable list with editable status (triggers email notifications when configured)
- **Discover** — Tinder-style card stack with location-based job search
- **Settings** — Account, profile, exports, and platform connections (Handshake, LinkedIn, Indeed)
- **Auth** — Multi-user accounts with password login and server-side sessions

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), complete onboarding, then **Sign up** with email and password.

## Tech Stack

- Next.js 16 (App Router)
- Prisma + SQLite (local) / Postgres (production)
- TypeScript, Tailwind CSS
- Recharts, Framer Motion
- Resend (email), Adzuna (optional job search API)

## Database & multi-user auth

When `DATABASE_URL` is set:

- Users, applications, and profiles are stored per account in the database
- Integration OAuth tokens are stored per user (not shared browser cookies)
- Sessions use an httpOnly `jt-auth` cookie

For production, point `DATABASE_URL` at Postgres:

```env
DATABASE_URL="postgresql://user:pass@host:5432/tracker"
```

Then run `npx prisma migrate deploy`.

## Location-based job search

`GET /api/jobs/search` geocodes your profile location (OpenStreetMap Nominatim) and:

1. Fetches nearby roles from **Adzuna** when `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` are set
2. Falls back to location-filtered mock listings otherwise

Use **Refresh** on Discover or update your location in Settings to run a new search.

## Email notifications

When signed in with the database enabled, changing an application status sends an email via **Resend** if `RESEND_API_KEY` is set. Toggle notifications in **Settings → Job Profile**.

Without Resend, emails are logged to the server console in development.

## Platform integrations

Platform linking uses Next.js API routes under `/api/integrations`:

- **Connect** — OAuth (LinkedIn, Indeed) or Handshake EDU API when configured; otherwise **demo mode**
- **Sync** — imports applications into the pipeline and open roles into Discover
- **Disconnect** — clears the server session for that platform

| Platform | Live access |
|----------|-------------|
| Handshake | [EDU API](https://support.joinhandshake.com/hc/en-us/articles/31061076506391) |
| LinkedIn | [Developer app](https://www.linkedin.com/developers/) + partner approval |
| Indeed | [Partner Console](https://docs.indeed.com/getstarted/partner-console) |

## Roadmap

- [x] OAuth linking + sync architecture
- [x] Production database for tokens and multi-user accounts
- [x] Location-based job search API integration
- [x] Email notifications for status changes
- [x] Export applications to Excel / Google Sheets
