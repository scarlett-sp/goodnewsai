import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  timestamp: number;
  tags: string[];
  imageUrl?: string;
}

const RSS_FEEDS = [
  // Technology & innovation
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },

  // Healthcare & medical innovation
  { name: 'Healthcare IT News', url: 'https://www.healthcareitnews.com/feed' },
  { name: 'Medscape', url: 'https://www.medscape.com/feed/news' },

  // Nonprofit & social impact tech
  { name: 'TechSoup', url: 'https://www.techsoup.org/rss.xml' },

  // Science news
  { name: 'Nature', url: 'https://www.nature.com/nplants/rss/current.xml' },

  // Environment & sustainability
  { name: 'Carbon Brief', url: 'https://www.carbonbrief.org/feed/' },
  { name: 'Inside Climate News', url: 'https://insideclimatenews.org/feed/' },

  // Social impact & community
  { name: 'Nonprofit Tech for Good', url: 'https://www.nptechforgood.com/feed/' },
  { name: 'Global Citizen', url: 'https://www.globalcitizen.org/feed/' },

  // Education
  { name: 'EdSurge', url: 'https://www.edsurge.com/feed' },

  // Health & wellness
  { name: 'STAT News', url: 'https://www.statnews.com/feed/' },
];

const IMPACT_KEYWORDS = [
  // Single word impact areas (catch-all for broad matches)
  'health', 'medical', 'disease', 'treatment', 'patient', 'cure', 'diagnosis',
  'cancer', 'hospital', 'clinical', 'therapeutic', 'physician', 'doctor',

  'climate', 'environment', 'renewable', 'sustainable', 'conservation', 'carbon',
  'emissions', 'solar', 'wind', 'green', 'ecology', 'ecosystem',

  'education', 'learning', 'student', 'school', 'literacy', 'teach',
  'accessibility', 'disability', 'assistive', 'inclusive', 'access',

  'community', 'civic', 'citizen', 'neighborhood', 'local', 'public', 'service',
  'humanitarian', 'disaster', 'relief', 'emergency', 'crisis', 'aid',

  'agriculture', 'farming', 'crop', 'food', 'security', 'farmer',

  // Outcome keywords
  'breakthrough', 'innovation', 'advance', 'improve', 'solution', 'solve',
  'help', 'assist', 'support', 'enable', 'saves', 'save', 'benefit',
  'research', 'study', 'discovery', 'success', 'effective', 'development',
  'transform', 'achievement', 'progress', 'good', 'positive', 'impact',
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

  // Tech CEOs, Silicon Valley, company news
  'elon', 'musk', 'sam altman', 'silicon valley', 'tech ceo', 'tech founder',
  'startup founder', 'tech executive', 'company announces', 'tech company',

  // Stocks & financial news
  'stock', 'stocks', 'ipo', 'sec filing', 'investor', 'investment',
  'valuation', 'market cap', 'profitable', 'revenue', 'earnings',

  // Product launches & gadgets - expanded
  'product launch', 'launches new', 'new gadget', 'announces', 'releases new',
  'unveiled', 'introducing', 'pendant', 'wearable gadget', 'new phone',
  'new device', 'product announcement',

  // Model releases & tech company news
  'model release', 'model launch', 'new model', 'introduces model', 'announces model',
  'latest model', 'version upgrade',

  // Disruptive/negative angle language
  'disrupting', 'disrupts', 'replacing', 'replaces', 'eliminate jobs',
  'concerns about ai', 'worries about',

  // Product promos & shopping content
  'promo', 'discount', 'coupon', 'deal', 'sale', 'code', 'save off',
  'buy now', 'get started', 'best deals', 'sale price', 'limited time',

  // Entertainment & reviews
  'movie', 'review', 'best of', 'top picks', 'ranking', 'rating',
  'groupthink', 'pokemon', 'gaming', 'entertainment', 'tv show', 'film', 'netflix',

  // Environmental problems without solutions
  'illegal dump', 'illegal waste', 'pollution watchlist', 'environmental scandal',
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

  // PRIMARY FILTER: Remove explicitly negative stories
  if (NEGATIVE_KEYWORDS.some(kw => text.includes(kw))) {
    return false;
  }

  // CRITICAL: Must mention AI/ML explicitly
  const hasAI = ['ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm'].some(term => text.includes(term));
  if (!hasAI) return false;

  // SECONDARY FILTER: Must be about an impact area
  const impactAreas = [
    // Healthcare & wellness
    'health', 'medical', 'disease', 'treatment', 'patient', 'diagnosis', 'cancer',
    'therapy', 'clinical', 'pharmaceutical', 'mental health',

    // Community & social
    'community', 'homeless', 'homelessness', 'poverty', 'civic', 'neighborhood',
    'nonprofit', 'social', 'civic tech',

    // Care & vulnerable populations
    'elder', 'elderly', 'aging', 'disability', 'disabled', 'blind', 'deaf',
    'accessibility', 'assistive', 'inclusive', 'children', 'youth',

    // Education
    'education', 'learning', 'student', 'school', 'literacy', 'teach',

    // Environmental
    'climate', 'renewable', 'sustainable', 'environment', 'conservation',
    'carbon', 'emissions', 'solar', 'wind', 'green',

    // Agriculture & food
    'agriculture', 'farming', 'crop', 'food', 'security', 'farmer',

    // Animal welfare
    'animal', 'pet', 'shelter', 'wildlife', 'conservation',

    // Disaster & emergency
    'disaster', 'emergency', 'crisis', 'relief', 'rescue', 'recovery',

    // Housing & infrastructure
    'housing', 'infrastructure', 'urban'
  ];
  const hasImpactArea = impactAreas.some(area => text.includes(area));
  if (!hasImpactArea) return false;

  // TERTIARY FILTER: Must also have positive/solution language
  const positiveOutcomes = [
    'breakthrough', 'innovation', 'solution',
    'helps', 'help', 'support', 'assist', 'improve', 'improving',
    'advancing', 'advancement', 'care', 'rescue', 'aid',
    'transforming', 'transform', 'developing', 'development', 'technology', 'tool',
    'companion', 'redefining', 'fighting', 'fight', 'scale', 'detect', 'detection',
    'diagnose', 'diagnosis', 'prediction', 'predict', 'enable', 'empower', 'accelerate',
    'solve', 'solving', 'opportunity', 'potential', 'advance', 'benefit',
    'success', 'effective', 'treatment', 'therapy', 'hope', 'address', 'tackle'
  ];
  return positiveOutcomes.some(outcome => text.includes(outcome));
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

async function searchWithSerper(): Promise<NewsItem[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn('SERPER_API_KEY not configured for scrape endpoint');
    return [];
  }

  try {
    const searchQueries = [
      'AI helping healthcare diagnosis treatment',
      'AI education learning accessibility',
      'AI climate environment sustainability',
      'AI community disaster relief',
      'AI agriculture farming food security',
      'AI elderly care disability accessibility',
      'AI mental health therapy wellness',
      'AI wildlife conservation biodiversity',
      'AI poverty economic development',
      'AI housing urban planning infrastructure',
    ];

    const allResults: NewsItem[] = [];

    for (const query of searchQueries) {
      try {
        const response = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            num: 10,
            type: 'news',
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        if (data.news) {
          for (const item of data.news) {
            if (isPositiveImpactStory(item.title, item.snippet)) {
              allResults.push({
                id: `serper::${item.link}`,
                title: item.title.substring(0, 150),
                description: item.snippet.substring(0, 300),
                link: item.link,
                source: new URL(item.link).hostname || 'Web',
                pubDate: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
                timestamp: item.date ? new Date(item.date).getTime() : Date.now(),
                tags: assignTags(item.title, item.snippet),
                imageUrl: item.imageUrl || item.image || undefined,
              });
            }
          }
        }
      } catch (err) {
        console.error(`Failed to search query "${query}":`, err);
      }
    }

    return allResults;
  } catch (err) {
    console.error('Serper search error:', err);
    return [];
  }
}

async function getLikeBasedQueries(): Promise<string[]> {
  try {
    const { data: likes } = await getSupabaseAdmin()
      .from('article_likes')
      .select('article_title, article_tags')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!likes || likes.length === 0) return [];

    // Collect tags from liked articles
    const tagCounts = new Map<string, number>();
    for (const like of likes) {
      for (const tag of like.article_tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    // Top 3 most-liked tags become extra search queries
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => `AI ${tag.toLowerCase()} positive impact good news`);

    return topTags;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [rssResults, serperResults, blockedData, likeQueries] = await Promise.all([
      scrapeRSSFeeds(),
      searchWithSerper(),
      getSupabaseAdmin().from('blocked_articles').select('article_link'),
      getLikeBasedQueries(),
    ]);

    // Run extra like-based searches if we have them
    let likeResults: NewsItem[] = [];
    if (likeQueries.length > 0) {
      const apiKey = process.env.SERPER_API_KEY;
      if (apiKey) {
        const likeSearches = await Promise.all(
          likeQueries.map(async (q) => {
            try {
              const res = await fetch('https://google.serper.dev/search', {
                method: 'POST',
                headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ q, num: 5, type: 'news' }),
              });
              if (!res.ok) return [];
              const data = await res.json();
              return (data.news ?? [])
                .filter((item: { title: string; snippet?: string }) =>
                  isPositiveImpactStory(item.title, item.snippet)
                )
                .map((item: { link: string; title: string; snippet?: string; date?: string; imageUrl?: string; image?: string }) => ({
                  id: `serper::like::${item.link}`,
                  title: item.title.substring(0, 150),
                  description: (item.snippet ?? '').substring(0, 300),
                  link: item.link,
                  source: new URL(item.link).hostname,
                  pubDate: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
                  timestamp: item.date ? new Date(item.date).getTime() : Date.now(),
                  tags: assignTags(item.title, item.snippet ?? ''),
                  imageUrl: item.imageUrl || item.image || undefined,
                }));
            } catch {
              return [];
            }
          })
        );
        likeResults = likeSearches.flat();
      }
    }

    const blockedLinks = new Set(
      (blockedData.data ?? []).map((b: { article_link: string }) => b.article_link)
    );

    const allResults = [...rssResults, ...serperResults, ...likeResults];
    const unique = Array.from(new Map(allResults.map(item => [item.id, item])).values());
    const filtered = unique.filter(item => !blockedLinks.has(item.link));
    const sorted = filtered.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
