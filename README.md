# Tracker — Job Application Tracker

Track job applications from Handshake, LinkedIn, and Indeed. Discover local jobs with a swipe-based interface.

## Features

- **Dashboard** — Donut or bar chart of application statuses (applied, rejected, interview rounds, offers)
- **Applications** — Sortable list of all jobs you've applied to
- **Discover** — Tinder-style card stack to browse jobs in your area
- **Settings** — Account management and platform connections (Handshake, LinkedIn, Indeed)
- **Auth** — Sign up / sign in with local persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (status charts)
- Framer Motion (swipe cards)

## Roadmap

- [x] OAuth linking + sync architecture for Handshake, LinkedIn, Indeed
- [ ] Production database for tokens and multi-user accounts
- [ ] Location-based job search API integration
- [ ] Email notifications for status changes
- [x] Export applications to Excel / CSV (Google Sheets)

## Note on Integrations

Platform linking uses Next.js API routes under `/api/integrations`:

- **Connect** — OAuth (LinkedIn, Indeed) or Handshake EDU API when configured; otherwise **demo mode** with sample data
- **Sync** — imports your applications into the pipeline and open roles into Discover
- **Disconnect** — clears the server session and removes synced data for that platform

Copy `.env.example` to `.env.local` and add credentials for live sync:

| Platform | Live access |
|----------|-------------|
| Handshake | [EDU API](https://support.joinhandshake.com/hc/en-us/articles/31061076506391) — institution API key + school ID |
| LinkedIn | [Developer app](https://www.linkedin.com/developers/) + Talent Solutions partner approval for job/application APIs |
| Indeed | [Partner Console](https://docs.indeed.com/getstarted/partner-console) — Job Sync API partner agreement |

Without credentials, Connect still works in demo mode so you can try the full flow locally.
