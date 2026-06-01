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
}

export default function NewsCard({ item }: NewsCardProps) {
  const date = new Date(item.pubDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl bg-gradient-to-br from-[#2A2520]/60 to-[#3A3530]/60 border border-[#CABFB6]/20 hover:border-[#FF8E7E]/50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-[#FF8E7E]/10 flex flex-col h-full"
    >
      {item.imageUrl && (
        <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-[#CABFB6]/20 to-[#6E6660]/30">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#221E1C]/80 to-transparent"></div>
        </div>
      )}

      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="inline-block px-2.5 py-1 bg-[#FF8E7E]/20 text-[#FFB89C] text-xs font-medium rounded-full border border-[#FF8E7E]/30">
            {item.source}
          </span>
          <span className="text-xs text-[#CABFB6]/60 flex-shrink-0">
            {formattedDate}
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#FFB89C] transition-colors line-clamp-3 mb-2">
          {item.title}
        </h3>

        <p className="text-xs sm:text-sm text-[#CABFB6]/70 line-clamp-3 flex-grow">
          {item.description}
        </p>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span key={tag} className="inline-block px-2 py-0.5 bg-[#CABFB6]/15 text-[#CABFB6] text-xs rounded border border-[#CABFB6]/20">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[#CABFB6]/20 flex items-center gap-1 text-[#3FA8F0] group-hover:text-[#FF8E7E] text-xs font-medium">
          Read more
          <svg
            className="w-3 h-3 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}
