import { NextResponse } from 'next/server';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  timestamp: number;
  tags: string[];
}

const RSS_FEEDS = [
  // Specialized scientific & research sources
  { name: 'Science Daily - AI', url: 'https://www.sciencedaily.com/feeds/computers_math/artificial_intelligence.xml' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },

  // Company research & announcements from impact-focused orgs
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/index/rss.xml' },
];

const IMPACT_KEYWORDS = [
  // Problem-solving verbs
  'ai helps', 'ai solves', 'ai saves', 'ai improves', 'ai reduces',
  'ai enables', 'ai assists', 'ai accelerates', 'ai tackles', 'ai addresses',
  'ai detects', 'ai diagnoses', 'ai discovers', 'ai develops',

  // Medical & healthcare - specific outcomes
  'ai diagnosis', 'ai treatment', 'ai disease', 'ai cancer', 'ai healthcare',
  'ai advances healthcare', 'ai medical breakthrough', 'ai patient',
  'ai drug discovery', 'ai pharmaceutical', 'ai cure',
  'early detection', 'detect early', 'diagnosis early', 'early diagnosis',
  'saves lives', 'saved lives', 'helps patients', 'treats patients',
  'pancreatic cancer', 'disease detection', 'incurable disease',

  // Research & validation
  'ai research breakthrough', 'ai landmark study', 'ai validation study',
  'ai scientific discovery', 'ai breakthrough research',

  // Deployment & practical use
  'ai deployed', 'ai practical', 'ai works', 'ai useful', 'ai real-world',
  'ai actually', 'ai launched',

  // Impact areas
  'ai climate', 'ai renewable', 'ai accessibility', 'ai poverty',
  'ai education', 'ai learning', 'ai disaster', 'ai humanitarian',
  'ai agriculture', 'ai farming', 'ai community', 'ai civic',

  // Performance & efficiency
  'ai outperforms', 'ai speeds up', 'ai automates', 'ai efficiency',
  'ai accelerates drug',

  // Specific outcomes
  'first time', 'detect early', 'up to', 'faster than', 'beat', 'outperform',

  // Social impact & solutions
  'ai for good', 'ai social impact', 'ai helping', 'ai assists', 'solves problem',
  'fixes problem', 'citizen', 'civic solution',
];

const NEGATIVE_KEYWORDS = [
  // Restrictions & criticism
  'no-ai', 'no ai', 'bans ai', 'blocks ai', 'ai threat', 'ai danger',
  'ai risk', 'ai concern', 'ai regulation', 'ftc', 'antitrust',

  // Job losses & workplace concerns
  'ai layoffs', 'job losses', 'job displacement', 'workers displaced',

  // Hype & speculation
  'ai hype', 'unrealistic', 'skeptic', 'overhyped', 'allegedly', 'reportedly',
  'could be', 'may be developing', 'is reportedly',

  // Mental health concerns & criticism
  'ai psychosis', 'ai addiction', 'mental health concern', 'psychological impact',

  // Negative angles
  'data center secrecy', 'vc thinks', 'vc debate', 'debate over ai', 'ai commentary',
  'ai criticism', 'ethical concerns', 'bias concerns',

  // Business/wealth angles - expanded
  'billionaire', 'minted', 'new billionaire', 'new rich', 'wealth gap', 'inequality',
  'venture capital raises', 'venture capital invests', 'startup raises', 'funding round',
  'raised funding', 'secures funding', 'series a', 'series b', 'series c',

  // Product launches & gadgets - expanded
  'product launch', 'launches new', 'new gadget', 'announces', 'releases new',
  'unveiled', 'introducing', 'pendant', 'wearable gadget',

  // Model releases & tech company news
  'model release', 'model launch', 'new model', 'introduces model', 'announces model',
  'latest model', 'version upgrade',

  // Disruptive/negative angle language
  'disrupting', 'disrupts', 'replacing', 'replaces', 'eliminate jobs',
  'concerns about ai', 'worries about',

  // Misc noise
  'groupthink', 'pokemon', 'gaming', 'entertainment',
];

const TAG_KEYWORDS = {
  Healthcare: ['diagnosis', 'patients', 'hospitals', 'medicine', 'clinical', 'surgery', 'genomics', 'pharmacy', 'nursing', 'radiology', 'therapy', 'telemedicine', 'vaccines', 'biotech', 'epidemic', 'drug discovery', 'patient care', 'health records', 'medical imaging', 'mental health', 'disease prevention', 'elder care', 'insurance claims', 'public health', 'rare diseases', 'cancer detection', 'wearable health', 'chronic illness', 'health data', 'healthcare access'],
  Tech: ['software', 'hardware', 'cybersecurity', 'cloud', 'chips', 'devices', 'internet', 'broadband', 'quantum', 'networks', 'coding', 'algorithms', 'platform', 'digital', 'infrastructure', 'data storage', 'open source', 'app development', 'operating systems', 'augmented reality', 'virtual reality', 'data centers', 'tech regulation', '5G networks', 'edge computing', 'tech monopolies', 'software patents', 'data breaches', 'tech workforce', 'device manufacturing'],
  Community: ['neighborhood', 'volunteers', 'nonprofit', 'civic', 'grassroots', 'outreach', 'welfare', 'housing', 'libraries', 'youth', 'seniors', 'refugees', 'inclusion', 'homelessness', 'resilience', 'local services', 'public resources', 'community programs', 'disability access', 'food security', 'digital inclusion', 'rural communities', 'urban planning', 'public safety', 'mutual aid', 'cultural centers', 'affordable childcare', 'language access', 'community health', 'faith organizations'],
  Social: ['platforms', 'algorithms', 'privacy', 'misinformation', 'identity', 'influencers', 'trolling', 'harassment', 'polarization', 'radicalization', 'deepfakes', 'moderation', 'virality', 'anonymity', 'behavior', 'social media', 'online communities', 'hate speech', 'viral content', 'echo chambers', 'personal data', 'cancel culture', 'digital literacy', 'cyberbullying', 'social trust', 'teen screen time', 'social norms', 'filter bubbles', 'community guidelines', 'digital well-being'],
  'Pop culture': ['celebrities', 'streaming', 'gaming', 'fandom', 'memes', 'television', 'movies', 'music', 'fashion', 'podcasts', 'awards', 'nostalgia', 'franchises', 'influencers', 'entertainment', 'fan communities', 'reality television', 'book adaptations', 'award shows', 'gaming influencers', 'comic book culture', 'celebrity endorsements', 'franchise reboots', 'internet humor', 'viral challenges', 'cultural criticism', 'fandom discourse', 'media consumption', 'youth culture', 'celebrity AI'],
  Art: ['creativity', 'illustration', 'photography', 'animation', 'design', 'writing', 'film', 'music', 'sculpture', 'storytelling', 'copyright', 'ownership', 'museums', 'galleries', 'identity', 'digital art', 'generative imagery', 'artist rights', 'cultural heritage', 'art authentication', 'performing arts', 'artistic collaboration', 'graphic design', 'street art', 'art market', 'AI-generated art', 'voice acting', 'screenwriting', 'art education', 'NFTs'],
  Environmental: ['climate', 'emissions', 'pollution', 'conservation', 'renewables', 'flooding', 'wildfires', 'biodiversity', 'oceans', 'deforestation', 'sustainability', 'glaciers', 'drought', 'habitat', 'ecosystems', 'carbon capture', 'solar energy', 'wind power', 'electric vehicles', 'air quality', 'climate policy', 'environmental justice', 'plastic pollution', 'water management', 'urban heat', 'sustainable agriculture', 'food systems', 'green technology', 'waste reduction', 'conservation technology'],
  Political: ['government', 'regulation', 'elections', 'policy', 'legislation', 'surveillance', 'democracy', 'lobbying', 'censorship', 'propaganda', 'rights', 'judiciary', 'law', 'security', 'transparency', 'national security', 'civil liberties', 'law enforcement', 'geopolitical tensions', 'political campaigns', 'political bias', 'disinformation', 'voter suppression', 'constitutional rights', 'political polarization', 'freedom of speech', 'authoritarian governments', 'whistleblowers', 'tech policy', 'public trust'],
  Global: ['international', 'trade', 'diplomacy', 'sanctions', 'migration', 'borders', 'sovereignty', 'inequality', 'developing nations', 'foreign policy', 'multilateral', 'geopolitics', 'diaspora', 'globalization', 'competition', 'cross-border data', 'global supply chains', 'emerging markets', 'global governance', 'humanitarian aid', 'cultural exchange', 'international standards', 'technology transfer', 'global poverty', 'international law', 'foreign investment', 'cross-border crime', 'foreign aid', 'global education', 'worldwide regulation'],
  Financial: ['markets', 'investment', 'banking', 'fraud', 'cryptocurrency', 'inflation', 'debt', 'taxes', 'stocks', 'trading', 'recession', 'insurance', 'startups', 'capital', 'wealth', 'financial forecasting', 'risk assessment', 'credit scoring', 'venture capital', 'corporate earnings', 'monetary policy', 'interest rates', 'pension funds', 'hedge funds', 'trading algorithms', 'financial literacy', 'real estate markets', 'private equity', 'financial regulation', 'wealth management'],
  Office: ['productivity', 'hiring', 'automation', 'workforce', 'remote', 'hybrid', 'burnout', 'surveillance', 'training', 'leadership', 'diversity', 'onboarding', 'scheduling', 'collaboration', 'management', 'employee monitoring', 'performance reviews', 'meeting tools', 'internal communications', 'document management', 'task automation', 'corporate training', 'employee well-being', 'organizational change', 'talent acquisition', 'office culture', 'knowledge management', 'professional development', 'return to office', 'workplace diversity'],
  Event: ['conference', 'summit', 'launch', 'keynote', 'expo', 'hackathon', 'ceremony', 'briefing', 'forum', 'workshop', 'convention', 'hearing', 'demonstration', 'announcement', 'festival', 'product launch', 'trade show', 'panel discussion', 'virtual event', 'live streamed', 'networking event', 'demo day', 'shareholder meeting', 'press conference', 'global summit', 'charity gala', 'sports event', 'corporate retreat', 'world forum', 'academic symposium'],
  Home: ['smart home', 'household', 'family', 'parenting', 'appliances', 'renovation', 'security', 'cooking', 'garden', 'budget', 'pets', 'accessibility', 'insurance', 'lighting', 'routines', 'home security', 'home entertainment', 'home office', 'home health', 'connected devices', 'home ownership', 'rental market', 'childproofing', 'smart lighting', 'home maintenance', 'family scheduling', 'pet technology', 'housing affordability', 'residential technology', 'personal assistant'],
} as const;

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

  // Filter out explicitly negative stories
  if (NEGATIVE_KEYWORDS.some(kw => text.includes(kw))) {
    return false;
  }

  // Require positive impact keywords
  return IMPACT_KEYWORDS.some(kw => text.includes(kw));
}

function assignTags(title: string, description: string = ''): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags;
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

      let sourceCount = 0;
      const maxPerSource = 1;
      for (const item of items) {
        if (sourceCount >= maxPerSource) break;
        if (isPositiveImpactStory(item.title, item.description)) {
          sourceCount++;
          results.push({
            id: `${feed.name}::rss::${item.link || item.title}`,
            title: item.title.substring(0, 150),
            description: item.description.replace(/<[^>]+>/g, '').substring(0, 300),
            link: item.link,
            source: feed.name,
            pubDate: item.pubDate || new Date().toISOString(),
            timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
            tags: assignTags(item.title, item.description),
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
    'AI diagnosis detection cancer treatment breakthrough',
    'AI healthcare medical research drug discovery',
    'AI climate renewable energy sustainability solution',
    'AI accessibility disability assistance technology',
    'AI education learning impact students',
    'AI scientific breakthrough research validation study',
    'AI malaria tuberculosis disease prevention',
    'AI community civic solution infrastructure',
    'AI disaster response humanitarian aid',
    'AI agriculture farming food security',
  ];

  const results = [];
  const seenDomains = new Set<string>();

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
            try {
              const url = new URL(result.FirstURL);
              const domain = url.hostname.replace('www.', '');

              // Only add one article per domain
              if (!seenDomains.has(domain)) {
                seenDomains.add(domain);
                results.push({
                  id: `duckduckgo::search::${result.FirstURL}`,
                  title: result.Title || query,
                  description: result.Text.substring(0, 300),
                  link: result.FirstURL,
                  source: domain,
                  pubDate: new Date().toISOString(),
                  timestamp: Date.now(),
                  tags: assignTags(result.Title || query, result.Text),
                });
              }
            } catch {
              // Skip if URL parsing fails
            }
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
