interface NewsCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    link: string;
    source: string;
    pubDate: string;
    imageUrl?: string;
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
      className="group rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 flex flex-col h-full"
    >
      {item.imageUrl && (
        <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        </div>
      )}

      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="inline-block px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30">
            {item.source}
          </span>
          <span className="text-xs text-slate-500 flex-shrink-0">
            {formattedDate}
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-3 mb-2">
          {item.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 flex-grow">
          {item.description}
        </p>

        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-1 text-blue-400 group-hover:text-blue-300 text-xs font-medium">
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
