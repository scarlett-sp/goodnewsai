'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NewsCard from '@/components/NewsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchModal from '@/components/SearchModal';

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

const STORAGE_KEY = 'goodnewsai_items';
const SIX_MONTHS = 180 * 24 * 60 * 60 * 1000;

// A varied sequence that guarantees a mix of sizes across the grid
const SIZE_SEQUENCE = [
  'large', 'small', 'medium', 'small', 'large', 'medium',
  'small', 'medium', 'small', 'large', 'small', 'medium',
  'medium', 'large', 'small', 'medium', 'small', 'large',
] as const;

function getCardSize(index: number): 'small' | 'medium' | 'large' {
  return SIZE_SEQUENCE[index % SIZE_SEQUENCE.length];
}

// Rearrange articles so CSS columns renders them left-to-right by recency.
// CSS columns fills top-to-bottom per column, so to get most-recent articles
// reading across the top row we need column-major ordering:
// sorted = [1,2,3,4,5,6,7,8,9] with 3 cols → col1=[1,4,7] col2=[2,5,8] col3=[3,6,9]
// array order for columns = [1,4,7, 2,5,8, 3,6,9]
function arrangeByRecency(items: NewsItem[], numCols = 3): NewsItem[] {
  const sorted = [...items].sort((a, b) => b.timestamp - a.timestamp);
  if (sorted.length === 0) return sorted;

  // Split into rows of numCols, then interleave image cards gently
  const withImage = sorted.filter(i => i.imageUrl);
  const withoutImage = sorted.filter(i => !i.imageUrl);

  // Merge back, spacing image cards every ~(total/imageCount) positions
  const merged: NewsItem[] = [];
  const spacing = withImage.length > 0
    ? Math.max(numCols, Math.floor(sorted.length / withImage.length))
    : sorted.length;
  let imgIdx = 0, plainIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (imgIdx < withImage.length && i % spacing === 0) {
      merged.push(withImage[imgIdx++]);
    } else if (plainIdx < withoutImage.length) {
      merged.push(withoutImage[plainIdx++]);
    } else {
      merged.push(withImage[imgIdx++]);
    }
  }

  // Now rearrange into column-major order so left-to-right reading = newest first
  const numRows = Math.ceil(merged.length / numCols);
  const columns: NewsItem[][] = Array.from({ length: numCols }, () => []);
  merged.forEach((item, i) => {
    const row = Math.floor(i / numCols);
    const col = i % numCols;
    // Place item so it appears at the right visual row across all columns
    columns[col][row] = item;
  });

  return columns.flat().filter(Boolean);
}

function loadStored(): NewsItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items: NewsItem[] = JSON.parse(raw);
    const cutoff = Date.now() - SIX_MONTHS;
    return items.filter(i => i.timestamp > cutoff);
  } catch {
    return [];
  }
}

function mergeAndStore(existing: NewsItem[], fresh: NewsItem[]): NewsItem[] {
  const map = new Map(existing.map(i => [i.id, i]));
  for (const item of fresh) map.set(item.id, item);
  const cutoff = Date.now() - SIX_MONTHS;
  const merged = Array.from(map.values())
    .filter(i => i.timestamp > cutoff)
    .sort((a, b) => b.timestamp - a.timestamp);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
  return merged;
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored.length > 0) {
      setNews(arrangeByRecency(stored));
      setLoading(false);
    }
    // Always fetch fresh on load
    doRefresh(stored);
  }, []);

  const doRefresh = async (current: NewsItem[]) => {
    try {
      console.log('Fetching fresh articles...');
      const response = await fetch('/api/scrape?t=' + Date.now()); // cache-bust
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const fresh: NewsItem[] = await response.json();
      console.log('Fresh articles fetched:', fresh.length);

      // On refresh, prioritize fresh articles and clear old cache
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      } catch {}

      setNews(arrangeByRecency(fresh));
      setLastUpdate(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching news:', error);
      alert('Failed to refresh: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await doRefresh(news);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#C3E3F4] via-[#FF8E7E] to-[#FFA0B4]">
      {/* Header */}
      <div className="border-b border-[#FF8E7E]/20 backdrop-blur-md bg-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <img
              src="/logo.png"
              alt="Good News AI Logo"
              className="h-14 sm:h-16 w-auto"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href="/community"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C3E3F4] to-[#A8D5F0] hover:from-[#D6EDF8] hover:to-[#BDE3F5] text-[#221E1C] font-medium transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <img src="/community-icon.png" alt="Community" className="w-5 h-5" />
                Community
              </Link>
              <button
                onClick={() => setSearchOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#CBB9F0] to-[#DFD0FF] hover:from-[#DFD0FF] hover:to-[#EFE1FF] text-[#221E1C] font-medium transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <img src="/search-icon.png" alt="Search" className="w-5 h-5" />
                Search
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#86D9C2] to-[#BCEEE8] hover:from-[#A8EFDC] hover:to-[#CFF5F0] text-[#221E1C] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                {refreshing ? <LoadingSpinner /> : <img src="/refresh-icon.png" alt="" className="w-5 h-5" />}
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs sm:text-sm text-[#221E1C]/60 mt-3">
              Last updated: {lastUpdate}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <img
              src="/loader.gif"
              alt="Loading"
              className="h-32 sm:h-40 w-auto mb-6"
            />
            <p className="text-[#221E1C] font-medium">Loading stories...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#221E1C]">No stories yet. Click refresh to get started.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {news.map((item, index) => (
              <div key={item.id} className="break-inside-avoid mb-6">
                <NewsCard
                  item={item}
                  size={getCardSize(index)}
                  onFlag={async () => {
                    // Remove the flagged article
                    const remaining = news.filter(n => n.id !== item.id);
                    setNews(remaining);
                    // Fetch a replacement
                    try {
                      const excluded = remaining.map(n => n.link).join(',');
                      const res = await fetch(`/api/articles/replacement?excluded=${encodeURIComponent(excluded)}`);
                      if (res.ok) {
                        const replacement = await res.json();
                        if (replacement) {
                          setNews(prev => [...prev, replacement]);
                        }
                      }
                    } catch {}
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </main>
  );
}
