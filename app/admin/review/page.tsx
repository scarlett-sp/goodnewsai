'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminCard from '@/components/AdminCard';

interface Submission {
  id: string;
  title: string;
  description: string;
  link: string;
  submitter_name: string | null;
  photo_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface FlaggedArticle {
  article_link: string;
  article_title: string;
  article_source: string;
  flag_count: number;
  reasons: string[];
  blocked: boolean;
}

const REASON_LABELS: Record<string, string> = {
  ad: 'Is an ad',
  not_ai: "Not about AI",
  not_good_news: "Not good news",
  other: 'Other',
};

type Filter = 'all' | 'pending' | 'approved' | 'rejected';
type Section = 'submissions' | 'flags';

export default function AdminReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [flags, setFlags] = useState<FlaggedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagsLoading, setFlagsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [section, setSection] = useState<Section>('submissions');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/submissions')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null; }
        return r.json();
      })
      .then(data => {
        if (data) setSubmissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/admin/flags')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setFlags(data); setFlagsLoading(false); })
      .catch(() => setFlagsLoading(false));
  }, [router]);

  const handleUpdate = (id: string, updated: Partial<Submission>) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  const handleBlock = async (article: FlaggedArticle, unblock = false) => {
    await fetch('/api/admin/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_link: article.article_link,
        article_title: article.article_title,
        unblock,
      }),
    });
    setFlags(prev => prev.map(f =>
      f.article_link === article.article_link ? { ...f, blocked: !unblock } : f
    ));
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.status === filter);
  const counts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #CBB9F0 0%, #C3E3F4 33%, #3FA8F0 66%, #FF8E7E 100%)' }}>
      <header className="border-b border-white/20 backdrop-blur-md bg-white/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Good News AI" className="h-9 w-auto" />
            <span className="text-sm font-medium text-[#221E1C]/60">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/community" className="text-sm text-[#221E1C]/50 hover:text-[#221E1C]/80 transition-colors">← Community</a>
            <button onClick={handleLogout} className="text-sm text-[#221E1C]/50 hover:text-[#221E1C]/80 transition-colors">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Section tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setSection('submissions')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
              section === 'submissions'
                ? 'bg-[#221E1C] text-white border-[#221E1C]'
                : 'bg-white/60 text-[#221E1C] border-white/40 hover:bg-white/80'
            }`}
          >
            Submissions ({counts.pending} pending)
          </button>
          <button
            onClick={() => setSection('flags')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
              section === 'flags'
                ? 'bg-[#221E1C] text-white border-[#221E1C]'
                : 'bg-white/60 text-[#221E1C] border-white/40 hover:bg-white/80'
            }`}
          >
            Flagged Articles ({flags.filter(f => !f.blocked).length})
          </button>
        </div>

        {/* ── SUBMISSIONS ── */}
        {section === 'submissions' && (
          <>
            <div className="flex gap-2 mb-8 flex-wrap">
              {(['pending', 'approved', 'rejected', 'all'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    filter === f
                      ? 'bg-[#221E1C] text-white border-[#221E1C]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-[#221E1C]/50 text-center py-20">Loading submissions...</p>
            ) : filtered.length === 0 ? (
              <p className="text-[#221E1C]/50 text-center py-20">No {filter === 'all' ? '' : filter} submissions.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(item => (
                  <AdminCard key={item.id} item={item} onUpdate={handleUpdate} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── FLAGS ── */}
        {section === 'flags' && (
          <>
            {flagsLoading ? (
              <p className="text-[#221E1C]/50 text-center py-20">Loading flags...</p>
            ) : flags.length === 0 ? (
              <p className="text-[#221E1C]/50 text-center py-20">No flagged articles yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {flags.map(article => (
                  <div key={article.article_link} className={`bg-white/80 rounded-2xl border p-5 flex flex-col gap-3 ${article.blocked ? 'border-red-200 opacity-60' : 'border-white/40'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#221E1C] line-clamp-2">{article.article_title || 'Untitled'}</p>
                        <a href={article.article_link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#FF8E7E] hover:underline truncate block mt-0.5">
                          {article.article_link}
                        </a>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${article.flag_count >= 5 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                          {article.flag_count} flag{article.flag_count !== 1 ? 's' : ''}
                        </span>
                        {article.blocked ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-500 font-medium">Blocked</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Reasons breakdown */}
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set(article.reasons)).map(r => (
                        <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-[#FFB89C]/20 text-[#FF8E7E] border border-[#FFB89C]/40">
                          {REASON_LABELS[r] ?? r}
                        </span>
                      ))}
                    </div>

                    {/* Admin action */}
                    <div className="flex gap-2 pt-1">
                      {article.blocked ? (
                        <button
                          onClick={() => handleBlock(article, true)}
                          className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(article)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-400 hover:bg-red-500 text-white text-sm font-medium transition-all"
                        >
                          <img src="/x-icon.png" alt="" className="w-3.5 h-3.5 brightness-0 invert" />
                          Block this article
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}
