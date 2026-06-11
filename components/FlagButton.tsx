'use client';

import { useState } from 'react';

interface FlagButtonProps {
  article: {
    id: string;
    title: string;
    link: string;
    source: string;
  };
  onFlagged: () => void;
  onOpenChange?: (open: boolean) => void;
}

const REASONS = [
  { key: 'ad', label: 'This article is an ad' },
  { key: 'not_ai', label: "This isn't about AI" },
  { key: 'not_good_news', label: "This isn't good news" },
  { key: 'other', label: 'Other' },
];

export default function FlagButton({ article, onFlagged, onOpenChange }: FlagButtonProps) {
  const [open, setOpen] = useState(false);

  const setOpenWithCallback = (value: boolean) => {
    setOpen(value);
    onOpenChange?.(value);
  };
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFlag = async (reason: string) => {
    setSubmitting(true);
    await fetch('/api/articles/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        article_link: article.link,
        article_title: article.title,
        article_source: article.source,
        reason,
      }),
    });
    setDone(true);
    setSubmitting(false);
    setTimeout(() => {
      setOpenWithCallback(false);
      onFlagged();
    }, 700);
  };

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenWithCallback(true); }}
        className="text-[#221E1C]/20 hover:text-[#FF8E7E] transition-colors p-0.5 rounded"
        title="Flag this article"
        aria-label="Flag article"
      >
        <svg width="12" height="13" viewBox="0 0 12 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="2" y1="1" x2="2" y2="12" />
          <path d="M2 1 L10 1 L8 4.5 L10 8 L2 8" fill="currentColor" fillOpacity="0.15" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => !submitting && setOpenWithCallback(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full mx-4 border border-[#FFB89C]/30"
            onClick={e => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center py-3">
                <p className="text-2xl mb-2">🙏</p>
                <p className="text-sm font-semibold text-[#221E1C]">Thanks for the feedback!</p>
                <p className="text-xs text-[#221E1C]/50 mt-1">We'll use this to improve the feed.</p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-[#221E1C] mb-1">Why are you flagging this?</h3>
                <p className="text-xs text-[#221E1C]/40 mb-4 line-clamp-2">{article.title}</p>
                <div className="flex flex-col gap-2">
                  {REASONS.map(r => (
                    <button
                      key={r.key}
                      onClick={() => handleFlag(r.key)}
                      disabled={submitting}
                      className="text-left px-4 py-2.5 rounded-xl border border-[#CABFB6] text-sm text-[#221E1C] hover:bg-[#FFF5F0] hover:border-[#FF8E7E] transition-all disabled:opacity-50"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setOpenWithCallback(false)}
                  className="mt-4 text-xs text-[#221E1C]/30 hover:text-[#221E1C]/60 w-full text-center transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
