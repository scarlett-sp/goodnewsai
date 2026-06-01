import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import only when needed to avoid build issues
    const Parser = (await import('rss-parser')).default;
    const fs = await import('fs/promises');
    const path = await import('path');

    const parser = new Parser();
    const DATA_FILE = path.join(process.cwd(), '.data', 'news.json');

    const RSS_FEEDS = [
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
      { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
      { name: 'The Wire', url: 'https://thewire.in/feed' },
    ];

    const AI_KEYWORDS = ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'algorithm', 'gpt', 'claude', 'openai', 'anthropic', 'chatbot', 'transformer', 'llm', 'large language model'];
    const NEGATIVE_KEYWORDS = ['no-ai', 'no ai', 'concerns about ai', 'risks of ai'];

    let existing = [];
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      existing = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }

    const allItems = [];

    for (const feed of RSS_FEEDS) {
      try {
        const parsedFeed = await parser.parseURL(feed.url);
        for (const item of parsedFeed.items.slice(0, 30)) {
          const title = item.title || '';
          const lowerTitle = title.toLowerCase();

          if (NEGATIVE_KEYWORDS.some(kw => lowerTitle.includes(kw))) continue;
          if (!AI_KEYWORDS.some(kw => lowerTitle.includes(kw))) continue;

          allItems.push({
            id: `${feed.name}-${item.isoDate || Date.now()}`,
            title: title.substring(0, 150),
            description: (item.contentSnippet || '').substring(0, 300),
            link: item.link || '',
            source: feed.name,
            pubDate: item.isoDate || new Date().toISOString(),
            timestamp: new Date(item.isoDate || Date.now()).getTime(),
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
