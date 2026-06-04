'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CommunityCard from '@/components/CommunityCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Submission {
  id: string;
  title: string;
  description: string;
  link: string;
  submitter_name: string | null;
  photo_url: string | null;
  approved_at: string;
}

export default function CommunityPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/community/feed')
      .then(r => r.json())
      .then(data => {
        setSubmissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#C3E3F4] via-[#FF8E7E] to-[#FFA0B4] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#FF8E7E]/20 backdrop-blur-md bg-white/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Good News AI" className="h-12 w-auto" />
          </Link>
          <Link
            href="/community/submit"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#CBB9F0] to-[#DFD0FF] text-[#221E1C] text-sm font-medium hover:opacity-90 transition-all"
          >
            + Share your story
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#221E1C] mb-2">Community Good News</h1>
          <p className="text-sm text-[#221E1C]/60">Real stories, shared by real people, about AI making a difference.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <LoadingSpinner />
            <p className="text-[#221E1C]/60 text-sm">Loading stories...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <img src="/community-icon.png" alt="" className="w-12 h-12 mx-auto mb-4" />
            <p className="text-[#221E1C]/70 mb-6">No stories yet — be the first to share one!</p>
            <Link
              href="/community/submit"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#CBB9F0] to-[#DFD0FF] text-[#221E1C] font-medium hover:opacity-90 transition-all"
            >
              Share your good news
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {submissions.map(item => (
              <CommunityCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Discreet admin link */}
      <div className="flex-1 flex items-end justify-center pb-6">
        <Link href="/admin" className="text-xs text-[#221E1C]/20 hover:text-[#221E1C]/40 transition-colors">
          Admin
        </Link>
      </div>
    </main>
  );
}
