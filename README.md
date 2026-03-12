# AI Trend Intelligence

Real-time AI ecosystem intelligence platform that aggregates signals from developer and discussion platforms and ranks AI tools by trend momentum.

## Features

- **Signal Feed**: Real-time signals from GitHub Trending and Hacker News
- **Tools Directory**: Comprehensive directory of AI tools with trend scores
- **Submit Tool**: Community-driven tool submissions

## Tech Stack

- Next.js 15 (App Router)
- Supabase (PostgreSQL + RLS)
- Tailwind CSS
- TypeScript
- Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your credentials

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.local.example` for required environment variables.

## Deployment

Deploy to Vercel with one click or use the Vercel CLI:

```bash
vercel --prod
```

## License

MIT
