'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (res.ok) {
      router.push('/admin/review');
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#C3E3F4] via-[#FF8E7E] to-[#FFA0B4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl border border-[#FFB89C]/30 p-8 shadow-lg">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Good News AI" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#221E1C]">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoFocus
            className="px-4 py-3 rounded-xl border border-[#CABFB6] bg-white/70 text-sm text-[#221E1C] focus:outline-none focus:ring-2 focus:ring-[#CBB9F0]"
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-xl bg-gradient-to-r from-[#CBB9F0] to-[#DFD0FF] text-[#221E1C] font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}
