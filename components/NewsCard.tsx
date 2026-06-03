type CardSize = 'small' | 'medium' | 'large';

interface NewsCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    link: string;
    source: string;
    pubDate: string;
    imageUrl?: string;
    tags?: string[];
  };
  size?: CardSize;
}

function getAccentGradient(id: string): string {
  const gradients = [
    'from-[#CBB9F0] to-[#DFD0FF]',
    'from-[#86D9C2] to-[#BCEEE8]',
    'from-[#C3E3F4] to-[#A8D5F0]',
    'from-[#FFC96B] to-[#FFD680]',
    'from-[#FFA0B4] to-[#FFB5C5]',
    'from-[#FF8E7E] to-[#FFB89C]',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function NewsCard({ item, size = 'medium' }: NewsCardProps) {
  const formattedDate = item.pubDate
    ? new Date(item.pubDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const accent = getAccentGradient(item.id);
  const showHeader = size === 'large' || size === 'medium';
  const headerHeight = size === 'large' ? 'h-36' : 'h-28';
  const thumbSize = size === 'large' ? 'w-16 h-16' : 'w-12 h-12';

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl bg-white/80 backdrop-blur-sm border border-[#FFB89C]/30 hover:border-[#FF8E7E] transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-[#FF8E7E]/20 flex flex-col"
    >
      {/* Gradient header for large + medium cards */}
      {showHeader && (
        <div className={`relative ${headerHeight} bg-gradient-to-br ${accent} flex flex-col justify-between p-4`}>
          {/* Small image thumbnail in top-left if available */}
          {item.imageUrl && (
            <div className={`${thumbSize} rounded-lg overflow-hidden shadow-md shrink-0`}>
              <img
                src={item.imageUrl}
                alt={item.source}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {/* Source name at bottom-left */}
          <span className="text-[#221E1C]/50 text-xs font-medium uppercase tracking-widest self-end">
            {item.source}
          </span>
        </div>
      )}

      <div className={`${size === 'small' ? 'p-3' : 'p-4 sm:p-5'} flex flex-col gap-2`}>
        {/* Source + date — only show source here for small cards (no header) */}
        <div className="flex items-start justify-between gap-2">
          {size === 'small' ? (
            <span className="inline-block px-2.5 py-1 bg-[#FF8E7E]/15 text-[#FF8E7E] text-xs font-medium rounded-full border border-[#FF8E7E]/30 shrink-0">
              {item.source}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs text-[#221E1C]/60 shrink-0">{formattedDate}</span>
        </div>

        <h3 className={`font-semibold text-[#221E1C] group-hover:text-[#FF8E7E] transition-colors
          ${size === 'large' ? 'text-base sm:text-lg line-clamp-4' : size === 'small' ? 'text-sm line-clamp-2' : 'text-sm sm:text-base line-clamp-3'}`}>
          {item.title}
        </h3>

        {size !== 'small' && (
          <p className={`text-xs sm:text-sm text-[#221E1C]/70 ${size === 'large' ? 'line-clamp-6' : 'line-clamp-3'}`}>
            {item.description}
          </p>
        )}

        {item.tags && item.tags.length > 0 && size !== 'small' && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-[#FFB89C]/20 text-[#FF8E7E] text-xs rounded border border-[#FFB89C]/40">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 pt-2 border-t border-[#FFB89C]/20 flex items-center gap-1 text-[#FF8E7E] group-hover:text-[#FFA0B4] text-xs font-medium">
          Read more
          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}
