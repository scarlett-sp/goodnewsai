'use client';

import { useEffect, useState } from 'react';
import NewsCard from '@/components/NewsCard';

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

const STORAGE_KEY = 'goodnewsai_items';
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

function loadStored(): NewsItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items: NewsItem[] = JSON.parse(raw);
    const cutoff = Date.now() - TWO_WEEKS;
    return items.filter(i => i.timestamp > cutoff);
  } catch {
    return [];
  }
}

function mergeAndStore(existing: NewsItem[], fresh: NewsItem[]): NewsItem[] {
  const map = new Map(existing.map(i => [i.id, i]));
  for (const item of fresh) map.set(item.id, item);
  const cutoff = Date.now() - TWO_WEEKS;
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

  useEffect(() => {
    const stored = loadStored();
    if (stored.length > 0) {
      setNews(stored);
      setLoading(false);
    }
    // Always fetch fresh on load
    doRefresh(stored);
  }, []);

  const doRefresh = async (current: NewsItem[]) => {
    try {
      const response = await fetch('/api/scrape');
      const fresh: NewsItem[] = await response.json();
      const merged = mergeAndStore(current, fresh);
      setNews(merged);
      setLastUpdate(new Date().toLocaleString());
    } catch (error) {
      console.error('Error fetching news:', error);
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
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#221E1C] tracking-tight">
                Good News AI
              </h1>
              <p className="text-[#221E1C]/70 text-sm sm:text-base mt-1">
                Positive developments in artificial intelligence
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF8E7E] to-[#FFA0B4] text-white font-medium hover:from-[#FFB89C] hover:to-[#FFB5C5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
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
          <div className="flex items-center justify-center py-20">
            <div className="text-[#221E1C]">
              <div className="w-8 h-8 border-2 border-[#221E1C]/30 border-t-[#FF8E7E] rounded-full animate-spin mx-auto mb-4"></div>
              Loading stories...
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#221E1C]">No stories yet. Click refresh to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
