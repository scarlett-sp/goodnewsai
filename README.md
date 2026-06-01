# [untitled] - Positive AI News

A clean, minimal site that aggregates positive AI news from TechCrunch, The Verge, and The Wire.

## Features

- 📰 Automatic daily scraping of AI news from multiple sources
- 🔄 Manual refresh button to pull updates anytime
- 📅 2-week rolling history of stories
- 🎨 Minimalist futuristic design
- 📱 Fully responsive (mobile, tablet, desktop)

## How It Works

- **Daily Updates**: Runs automatically every day at 6 AM UTC via Vercel Cron
- **Manual Refresh**: Click the refresh button on the site anytime
- **Smart Filtering**: Pulls AI-related stories and avoids negative/regulatory coverage
- **Local Storage**: Data persists as JSON in the repository

## Deployment to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com/new) and connect your GitHub repository
3. Click "Deploy" — it will automatically set up everything
4. That's it! Your site will update every day and you can refresh manually anytime

## Customization

**Change the site title**: Edit `[untitled]` in `app/page.tsx`

**Update colors/branding**: 
- Colors are in `app/page.tsx` using Tailwind CSS
- Add your logo or favicon to `public/`

**Adjust keyword filtering**: Edit the keyword lists in `app/api/scrape/route.ts`

**Add or remove news sources**: Modify `RSS_FEEDS` in `app/api/scrape/route.ts`

**Change scraping time**: Edit the cron schedule in `vercel.json` (default: 6 AM UTC daily)

## Local Development

```bash
npm install
npm run dev
```

Then visit http://localhost:3000 and click the Refresh button to test scraping.

## Stack

- **Frontend**: Next.js + React + Tailwind CSS
- **Backend**: Next.js API routes  
- **Scraping**: RSS Parser
- **Hosting**: Vercel
- **Data Storage**: JSON file in `/public`
