import { NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
}

// Filter keywords (same as scrape/route.ts)
const NEGATIVE_KEYWORDS = [
  'no-ai', 'no ai', 'bans ai', 'blocks ai', 'ai threat', 'ai danger',
  'ai risk', 'ai concern', 'ai regulation', 'ftc', 'antitrust',
  'ai layoffs', 'job losses', 'job displacement', 'workers displaced',
  'ai hype', 'unrealistic', 'skeptic', 'overhyped', 'allegedly', 'reportedly',
  'could be', 'may be developing', 'is reportedly',
  'ai psychosis', 'ai addiction', 'mental health concern', 'psychological impact',
  'data center secrecy', 'vc thinks', 'vc debate', 'debate over ai', 'ai commentary',
  'ai criticism', 'ethical concerns', 'bias concerns',
  'billionaire', 'minted', 'new billionaire', 'new rich', 'wealth gap', 'inequality',
  'venture capital raises', 'venture capital invests', 'startup raises', 'funding round',
  'raised funding', 'secures funding', 'series a', 'series b', 'series c',
  'product launch', 'launches new', 'new gadget', 'announces', 'releases new',
  'unveiled', 'introducing', 'pendant', 'wearable gadget',
  'model release', 'model launch', 'new model', 'introduces model', 'announces model',
  'latest model', 'version upgrade',
  'disrupting', 'disrupts', 'replacing', 'replaces', 'eliminate jobs',
  'concerns about ai', 'worries about',
  'promo', 'discount', 'coupon', 'deal', 'sale', 'code', 'save off',
  'buy now', 'get started', 'best deals', 'sale price', 'limited time',
  'movie', 'review', 'best of', 'top picks', 'ranking', 'rating',
  'groupthink', 'pokemon', 'gaming', 'entertainment', 'tv show', 'film', 'netflix',
  'illegal dump', 'illegal waste', 'pollution watchlist', 'environmental scandal',
];

function isPositiveImpactStory(title: string, description: string = ''): boolean {
  const text = `${title} ${description}`.toLowerCase();

  if (NEGATIVE_KEYWORDS.some(kw => text.includes(kw))) {
    return false;
  }

  const impactAreas = [
    'health', 'medical', 'disease', 'treatment', 'patient', 'diagnosis', 'cancer',
    'therapy', 'clinical', 'pharmaceutical', 'mental health',
    'community', 'homeless', 'homelessness', 'poverty', 'civic', 'neighborhood',
    'nonprofit', 'social', 'civic tech',
    'elder', 'elderly', 'aging', 'disability', 'disabled', 'blind', 'deaf',
    'accessibility', 'assistive', 'inclusive', 'children', 'youth',
    'education', 'learning', 'student', 'school', 'literacy', 'teach',
    'climate', 'renewable', 'sustainable', 'environment', 'conservation',
    'carbon', 'emissions', 'solar', 'wind', 'green',
    'agriculture', 'farming', 'crop', 'food', 'security', 'farmer',
    'animal', 'pet', 'shelter', 'wildlife', 'conservation',
    'disaster', 'emergency', 'crisis', 'relief', 'rescue', 'recovery',
    'housing', 'infrastructure', 'urban'
  ];
  const hasImpactArea = impactAreas.some(area => text.includes(area));
  if (!hasImpactArea) return false;

  const positiveOutcomes = [
    'ai', 'artificial intelligence', 'machine learning', 'breakthrough', 'innovation', 'solution',
    'helps', 'help', 'support', 'assist', 'improve', 'improving',
    'advancing', 'advancement', 'research', 'care', 'rescue', 'aid',
    'transforming', 'transform', 'developing', 'development', 'technology', 'tool',
    'companion', 'redefining', 'fighting', 'fight', 'scale', 'detect', 'detection',
    'diagnose', 'diagnosis', 'prediction', 'predict', 'enable', 'empower', 'accelerate',
    'solve', 'solving', 'opportunity', 'potential', 'advance', 'benefit',
    'success', 'effective', 'treatment', 'therapy', 'hope', 'address', 'tackle'
  ];
  return positiveOutcomes.some(outcome => text.includes(outcome));
}

async function searchWithSerper(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY not configured');
  }

  // Add "AI" to the query to focus on AI-related results
  const searchQuery = `${query} AI`;

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: searchQuery,
      num: 20, // Get more results to filter down to 3-5 good ones
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.statusText}`);
  }

  const data = await response.json();
  const results: SearchResult[] = [];

  // Process search results
  if (data.organic) {
    for (const item of data.organic) {
      if (results.length >= 5) break; // Only need 5 max before filtering

      // Serper returns: title, link, snippet
      if (isPositiveImpactStory(item.title, item.snippet)) {
        results.push({
          id: `search::${item.link}`,
          title: item.title.substring(0, 150),
          description: item.snippet.substring(0, 300),
          link: item.link,
          source: new URL(item.link).hostname || 'Web',
        });
      }
    }
  }

  return results;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const results = await searchWithSerper(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
