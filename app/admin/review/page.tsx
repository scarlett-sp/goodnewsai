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

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
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
  }, [router]);

  const handleUpdate = (id: string, updated: Partial<Submission>) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Good News AI" className="h-9 w-auto" />
            <span className="text-sm font-medium text-gray-500">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Community Submissions</h1>

        {/* Filter tabs */}
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
          <p className="text-gray-400 text-center py-20">Loading submissions...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No {filter === 'all' ? '' : filter} submissions.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <AdminCard key={item.id} item={item} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
