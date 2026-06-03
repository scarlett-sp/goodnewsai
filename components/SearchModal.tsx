'use client';

import { useState } from 'react';
import NewsCard from './NewsCard';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate?: string;
  timestamp?: number;
  tags?: string[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Search Articles</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., healthcare, education, climate..."
              className="flex-1 px-4 py-2 border border-[#CABFB6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8E7E]"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-[#CBB9F0] to-[#DFD0FF] hover:from-[#DFD0FF] hover:to-[#EFE1FF] text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? '...' : '🔍 Search'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searched ? (
            <p className="text-gray-500 text-center py-12">
              Enter a topic to search for AI impact articles
            </p>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <img
                src="/search-loader.gif"
                alt="Searching"
                className="h-32 w-auto mb-4"
              />
              <p className="text-gray-600">Finding the good news...</p>
            </div>
          ) : results.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              No articles found matching "{query}". Try a different search term.
            </p>
          ) : (
            <div className="grid gap-4">
              {results.map((item) => (
                <NewsCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    link: item.link,
                    source: item.source,
                    pubDate: item.pubDate || '',
                    tags: item.tags || [],
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
