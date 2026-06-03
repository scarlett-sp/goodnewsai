'use client';

import { useState } from 'react';

export default function SubmissionForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/community/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setStatus('success');
      form.reset();
      setPreview(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#86D9C2]/50 p-10 text-center">
        <div className="text-4xl mb-4">🌱</div>
        <h2 className="text-xl font-bold text-[#221E1C] mb-2">Thanks for sharing!</h2>
        <p className="text-sm text-[#221E1C]/70 mb-6">
          Your story has been submitted and will appear in the community feed once it's reviewed.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#86D9C2] to-[#BCEEE8] text-[#221E1C] text-sm font-medium hover:opacity-90 transition-all"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#FFB89C]/30 p-6 sm:p-8 flex flex-col gap-5">

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#221E1C]">Title <span className="text-[#FF8E7E]">*</span></label>
        <input
          name="title"
          required
          placeholder="What's the headline?"
          className="px-4 py-2.5 rounded-lg border border-[#CABFB6] bg-white/70 text-sm text-[#221E1C] placeholder-[#221E1C]/40 focus:outline-none focus:ring-2 focus:ring-[#CBB9F0]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#221E1C]">Link <span className="text-[#FF8E7E]">*</span></label>
        <input
          name="link"
          type="url"
          required
          placeholder="https://..."
          className="px-4 py-2.5 rounded-lg border border-[#CABFB6] bg-white/70 text-sm text-[#221E1C] placeholder-[#221E1C]/40 focus:outline-none focus:ring-2 focus:ring-[#CBB9F0]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#221E1C]">Description <span className="text-[#FF8E7E]">*</span></label>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="Tell us why this is good news..."
          className="px-4 py-2.5 rounded-lg border border-[#CABFB6] bg-white/70 text-sm text-[#221E1C] placeholder-[#221E1C]/40 focus:outline-none focus:ring-2 focus:ring-[#CBB9F0] resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#221E1C]">Your name <span className="text-[#221E1C]/40 font-normal">(optional)</span></label>
        <input
          name="submitter_name"
          placeholder="How should we credit you?"
          className="px-4 py-2.5 rounded-lg border border-[#CABFB6] bg-white/70 text-sm text-[#221E1C] placeholder-[#221E1C]/40 focus:outline-none focus:ring-2 focus:ring-[#CBB9F0]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#221E1C]">Photo <span className="text-[#221E1C]/40 font-normal">(optional)</span></label>
        <label className="cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#CABFB6] rounded-xl p-6 hover:border-[#CBB9F0] transition-colors bg-white/40">
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-cover" />
          ) : (
            <>
              <span className="text-2xl">🖼️</span>
              <span className="text-sm text-[#221E1C]/50">Click to upload an image</span>
            </>
          )}
          <input name="photo" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#CBB9F0] to-[#DFD0FF] text-[#221E1C] font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Submitting...' : 'Share your good news ✨'}
      </button>
    </form>
  );
}
