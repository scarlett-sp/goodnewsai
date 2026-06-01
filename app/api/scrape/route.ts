import { NextRequest, NextResponse } from 'next/server';
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
const DATA_FILE = join(process.cwd(), '.data', 'news.json');

const RSS_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'The Wire', url: 'https://thewire.in/feed' },
];

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'deep learning',
  'neural', 'algorithm', 'gpt', 'claude', 'openai', 'anthropic',
  'chatbot', 'transformer', 'llm', 'large language model', 'generative',
  'ai model', 'ai research', 'ai innovation', 'ai breakthrough',
];

const NEGATIVE_KEYWORDS = [
  'no-ai', 'no ai', 'no artificial intelligence',
  'concerns about ai', 'risks of ai', 'ai threat', 'ai danger',
  'ftc', 'antitrust', 'privacy concerns', 'data breach',
  'ai regulation', 'bans ai', 'restricts ai',
];

function isPositiveAIStory(title: string, description: string): boolean {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();

  if (NEGATIVE_KEYWORDS.some(keyword => lowerTitle.includes(keyword) || lowerDesc.includes(keyword))) {
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
    await mkdir(join(process.cwd(), '.data'), { recursive: true });
  } catch {
    // Directory might already exist
  }
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const filtered = items.filter(item => item.timestamp > twoWeeksAgo);
  const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);
  await writeFile(DATA_FILE, JSON.stringify(sorted, null, 2));
}

async function scrapeFeeds(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);

      for (const item of parsedFeed.items.slice(0, 30)) {
        const title = item.title || '';
        const description = item.content || item.contentSnippet || '';

        if (isPositiveAIStory(title, description)) {
          const newsItem: NewsItem = {
            id: `${feed.name}-${item.isoDate || Date.now()}`,
            title: title.substring(0, 150),
            description: description.substring(0, 300),
            link: item.link || '',
            source: feed.name,
            pubDate: item.isoDate || new Date().toISOString(),
            timestamp: new Date(item.isoDate || Date.now()).getTime(),
            imageUrl: item.enclosures?.[0]?.url || undefined,
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

export async function GET(request: NextRequest) {
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
