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
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/index/rss.xml' },
];

const IMPACT_KEYWORDS = [
  'ai helps', 'ai solves', 'ai saves', 'ai improves', 'ai reduces',
  'ai enables', 'ai assists', 'ai accelerates healing', 'ai tackles',
  'ai addresses', 'ai advances healthcare', 'ai education', 'ai climate',
  'ai accessibility', 'ai poverty', 'ai disease', 'ai treatment',
  'ai diagnosis', 'ai discovery', 'ai research breakthrough',
];

const NEGATIVE_KEYWORDS = [
  'no-ai', 'no ai', 'bans ai', 'blocks ai', 'ai threat', 'ai danger',
  'ai risk', 'ai concern', 'ai regulation', 'ftc', 'antitrust',
  'ai layoffs', 'job losses', 'ai hype', 'unrealistic', 'skeptic',
];

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

function isPositiveImpactStory(title: string, description: string = ''): boolean {
  const text = `${title} ${description}`.toLowerCase();

  if (NEGATIVE_KEYWORDS.some(kw => text.includes(kw))) {
    return false;
  }

  return IMPACT_KEYWORDS.some(kw => text.includes(kw));
}

async function scrapeRSSFeeds(): Promise<NewsItem[]> {
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
        if (isPositiveImpactStory(item.title, item.description)) {
          results.push({
            id: `${feed.name}::rss::${item.link || item.title}`,
            title: item.title.substring(0, 150),
            description: item.description.replace(/<[^>]+>/g, '').substring(0, 300),
            link: item.link,
            source: feed.name,
            pubDate: item.pubDate || new Date().toISOString(),
            timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          });
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${feed.name}:`, err);
    }
  }

  return results;
}

async function searchDuckDuckGo(): Promise<NewsItem[]> {
  const queries = [
    'ai helps solve problems',
    'ai improves healthcare',
    'ai tackles climate change',
    'ai accessibility benefits',
    'ai education impact',
    'ai saves lives',
    'ai reduces poverty',
  ];

  const results = [];

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`,
        { next: { revalidate: 0 } }
      );
      const data = await res.json();

      if (data.Results && Array.isArray(data.Results)) {
        for (const result of data.Results.slice(0, 5)) {
          if (result.FirstURL && result.Text) {
            results.push({
              id: `duckduckgo::search::${result.FirstURL}`,
              title: result.Title || query,
              description: result.Text.substring(0, 300),
              link: result.FirstURL,
              source: 'Web Search',
              pubDate: new Date().toISOString(),
              timestamp: Date.now(),
            });
          }
        }
      }
    } catch (err) {
      console.error(`Failed DuckDuckGo search for "${query}":`, err);
    }
  }

  return results;
}

export async function GET() {
  try {
    const [rssResults, searchResults] = await Promise.all([
      scrapeRSSFeeds(),
      searchDuckDuckGo(),
    ]);

    const allResults = [...rssResults, ...searchResults];
    const unique = Array.from(new Map(allResults.map(item => [item.id, item])).values());
    const sorted = unique.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
