import { NextResponse } from 'next/server';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  timestamp: number;
}

const RSS_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'The Wire', url: 'https://thewire.in/feed' },
];

const AI_KEYWORDS = ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'algorithm', 'gpt', 'claude', 'openai', 'anthropic', 'chatbot', 'transformer', 'llm'];
const NEGATIVE_KEYWORDS = ['no-ai', 'no ai', 'concerns about ai', 'risks of ai'];

function parseXMLItems(xml: string): Array<{title?: string; link?: string; pubDate?: string; description?: string}> {
  const items = [];
  const itemRegex = /<item[^>]*>[\s\S]*?<\/item>/g;
  const matches = xml.match(itemRegex) || [];

  for (const match of matches) {
    const title = match.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] || '';
    const link = match.match(/<link[^>]*>([^<]*)<\/link>/)?.[1] || '';
    const pubDate = match.match(/<pubDate[^>]*>([^<]*)<\/pubDate>/)?.[1] || '';
    const description = match.match(/<description[^>]*>([^<]*)<\/description>/)?.[1] || '';

    if (title) {
      items.push({ title: decodeHTMLEntities(title), link, pubDate, description: decodeHTMLEntities(description) });
    }
  }

  return items;
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return text.replace(/&[^;]+;/g, (match) => entities[match] || match);
}

export async function GET() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const DATA_FILE = path.join(process.cwd(), '.data', 'news.json');

    let existing: NewsItem[] = [];
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      existing = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }

    const allItems: NewsItem[] = [];

    for (const feed of RSS_FEEDS) {
      try {
        const response = await fetch(feed.url, { cache: 'no-store' });
        const xml = await response.text();
        const items = parseXMLItems(xml);

        for (const item of items.slice(0, 30)) {
          const title = item.title || '';
          const lowerTitle = title.toLowerCase();

          if (NEGATIVE_KEYWORDS.some(kw => lowerTitle.includes(kw))) continue;
          if (!AI_KEYWORDS.some(kw => lowerTitle.includes(kw))) continue;

          allItems.push({
            id: `${feed.name}-${item.pubDate || Date.now()}`,
            title: title.substring(0, 150),
            description: (item.description || '').substring(0, 300),
            link: item.link || '',
            source: feed.name,
            pubDate: item.pubDate || new Date().toISOString(),
            timestamp: new Date(item.pubDate || Date.now()).getTime(),
          });
        }
      } catch (e) {
        console.error(`Error scraping ${feed.name}:`, e);
      }
    }

    const merged = [...allItems, ...existing];
    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const filtered = unique.filter(item => item.timestamp > twoWeeksAgo).sort((a, b) => b.timestamp - a.timestamp);

    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
    } catch (e) {
      console.error('Error saving data:', e);
    }

    return NextResponse.json({ success: true, itemsAdded: allItems.length, totalItems: filtered.length });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
