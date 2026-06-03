interface Submission {
  id: string;
  title: string;
  description: string;
  link: string;
  submitter_name: string | null;
  photo_url: string | null;
  approved_at: string;
}

export default function CommunityCard({ item }: { item: Submission }) {
  const date = item.approved_at
    ? new Date(item.approved_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  let hostname = '';
  try { hostname = new URL(item.link).hostname.replace('www.', ''); } catch {}

  return (
    <article className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#FFB89C]/30 overflow-hidden shadow-sm hover:shadow-md hover:border-[#FF8E7E]/50 transition-all duration-300">
      {item.photo_url && (
        <div className="h-64 overflow-hidden">
          <img
            src={item.photo_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#CBB9F0] to-[#86D9C2] flex items-center justify-center text-white text-xs font-bold">
              {item.submitter_name ? item.submitter_name[0].toUpperCase() : '✦'}
            </span>
            <span className="text-sm text-[#221E1C]/70 font-medium">
              {item.submitter_name ?? 'Community member'}
            </span>
          </div>
          <span className="text-xs text-[#221E1C]/50">{date}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#221E1C] mb-3 leading-snug">
          {item.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-[#221E1C]/70 leading-relaxed mb-5">
          {item.description}
        </p>

        {/* Source link */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FF8E7E] hover:text-[#FFA0B4] transition-colors"
        >
          Read on {hostname || 'source'}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </article>
  );
}
