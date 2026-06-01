import { NextResponse } from 'next/server';

const RSS_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'The Wire', url: 'https://thewire.in/feed' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/index/rss.xml' },
];

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'deep learning',
  'neural network', 'gpt', 'claude', 'openai', 'anthropic',
  'chatbot', 'llm', 'large language model', 'generative ai',
];

const NEGATIVE_KEYWORDS = ['no-ai', 'no ai', 'bans ai', 'blocks ai'];

function extractTagContent(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
  return (match?.[1] || match?.[2] || '').trim();
}

function parseItems(xml: string) {
  const items = [];
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[0];
    const title = extractTagContent(block, 'title');
    const link = extractTagContent(block, 'link') || block.match(/<link[^>]*href="([^"]+)"/)?.[1] || '';
    const pubDate = extractTagContent(block, 'pubDate') || extractTagContent(block, 'published') || extractTagContent(block, 'updated');
    const description = extractTagContent(block, 'description') || extractTagContent(block, 'summary');
    if (title) items.push({ title, link, pubDate, description });
  }
  return items;
}

export async function GET() {
  const results = [];

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS reader)' },
        next: { revalidate: 0 },
      });
      const xml = await res.text();
      const items = parseItems(xml);

      for (const item of items.slice(0, 30)) {
        const lowerTitle = item.title.toLowerCase();
        if (NEGATIVE_KEYWORDS.some(kw => lowerTitle.includes(kw))) continue;
        if (!AI_KEYWORDS.some(kw => lowerTitle.includes(kw))) continue;

        results.push({
          id: `${feed.name}::${item.link || item.title}`,
          title: item.title.substring(0, 150),
          description: item.description.replace(/<[^>]+>/g, '').substring(0, 300),
          link: item.link,
          source: feed.name,
          pubDate: item.pubDate || new Date().toISOString(),
          timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
        });
      }
    } catch (err) {
      console.error(`Failed to fetch ${feed.name}:`, err);
    }
  }

  return NextResponse.json(results);
}
