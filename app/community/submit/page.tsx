import Link from 'next/link';
import SubmissionForm from '@/components/SubmissionForm';

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#C3E3F4] via-[#FF8E7E] to-[#FFA0B4]">
      {/* Header */}
      <div className="border-b border-[#FF8E7E]/20 backdrop-blur-md bg-white/10 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Good News AI" className="h-12 w-auto" />
          </Link>
          <Link href="/community" className="text-sm text-[#221E1C]/60 hover:text-[#221E1C] transition-colors">
            ← Back to feed
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#221E1C] mb-2">Share Good News</h1>
          <p className="text-sm text-[#221E1C]/60">
            Found a story about AI doing something wonderful? Share it with the community.
            All submissions are reviewed before going live.
          </p>
        </div>
        <SubmissionForm />
      </div>
    </main>
  );
}
