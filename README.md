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

- [ ] Real OAuth for Handshake, LinkedIn, Indeed APIs
- [ ] PostgreSQL database with user accounts
- [ ] Location-based job search API integration
- [ ] Email notifications for status changes
- [ ] Export applications to CSV

## Note on Integrations

Handshake, LinkedIn, and Indeed require official developer API access for production use. The current "Connect" buttons simulate syncing sample data to demonstrate the UX.
