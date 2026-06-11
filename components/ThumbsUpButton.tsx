'use client';

import { useState } from 'react';

interface ThumbsUpButtonProps {
  article: {
    id: string;
    title: string;
    link: string;
    source: string;
    tags?: string[];
  };
}

export default function ThumbsUpButton({ article }: ThumbsUpButtonProps) {
  const [liked, setLiked] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) return;

    setLiked(true);

    await fetch('/api/articles/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_link: article.link,
        article_title: article.title,
        article_source: article.source,
        article_tags: article.tags ?? [],
      }),
    }).catch(() => {});
  };

  return (
    <button
      onClick={handleLike}
      className={`transition-colors p-0.5 rounded ${
        liked
          ? 'text-[#86D9C2]'
          : 'text-[#221E1C]/20 hover:text-[#86D9C2]'
      }`}
      title={liked ? 'Liked!' : 'I want more like this'}
      aria-label="Like article"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'transform 0.15s ease', transform: liked ? 'scale(1.2)' : 'scale(1)' }}
      >
        <path d="M2 6.5V11M2 6.5C2 6.5 3 5.5 4 4L5.5 1.5C5.5 1.5 7 1 7 2.5V4.5H10C10.5 4.5 11.5 5 11 6L10 9.5C9.8 10.3 9 11 8 11H2" />
      </svg>
    </button>
  );
}
