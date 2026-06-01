import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  timestamp: number;
  imageUrl?: string;
}

const parser = new Parser();
const DATA_DIR = join(process.cwd(), '.data');
const DATA_FILE = join(DATA_DIR, 'news.json');

const RSS_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'The Wire', url: 'https://thewire.in/feed' },
];

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'deep learning',
  'neural', 'algorithm', 'gpt', 'claude', 'openai', 'anthropic',
  'chatbot', 'transformer', 'llm', 'large language model', 'generative',
];

const NEGATIVE_KEYWORDS = [
  'no-ai', 'no ai', 'concerns about ai', 'risks of ai', 'ai threat',
];

function isPositiveAIStory(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  if (NEGATIVE_KEYWORDS.some(keyword => lowerTitle.includes(keyword))) {
    return false;
  }
  return AI_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
}

async function loadExistingData(): Promise<NewsItem[]> {
  try {
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveData(items: NewsItem[]): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const filtered = items.filter(item => item.timestamp > twoWeeksAgo);
    const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);
    await writeFile(DATA_FILE, JSON.stringify(sorted, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

async function scrapeFeeds(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);

      for (const item of parsedFeed.items.slice(0, 30)) {
        const title = item.title || '';
        if (isPositiveAIStory(title)) {
          const newsItem: NewsItem = {
            id: `${feed.name}-${item.isoDate || Date.now()}`,
            title: title.substring(0, 150),
            description: (item.contentSnippet || '').substring(0, 300),
            link: item.link || '',
            source: feed.name,
            pubDate: item.isoDate || new Date().toISOString(),
            timestamp: new Date(item.isoDate || Date.now()).getTime(),
          };
          allItems.push(newsItem);
        }
      }
    } catch (error) {
      console.error(`Error scraping ${feed.name}:`, error);
    }
  }

  return allItems;
}

export async function GET() {
  try {
    const existing = await loadExistingData();
    const fresh = await scrapeFeeds();

    const merged = [...fresh, ...existing];
    const unique = Array.from(
      new Map(merged.map(item => [item.id, item])).values()
    );

    await saveData(unique);

    return NextResponse.json({
      success: true,
      itemsAdded: fresh.length,
      totalItems: unique.length,
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { success: false, error: 'Scraping failed' },
      { status: 500 }
    );
  }
}
