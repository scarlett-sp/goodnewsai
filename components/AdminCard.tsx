'use client';

import { useState } from 'react';

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

interface AdminCardProps {
  item: Submission;
  onUpdate: (id: string, updated: Partial<Submission>) => void;
}

export default function AdminCard({ item, onUpdate }: AdminCardProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [notes, setNotes] = useState(item.admin_notes ?? '');
  const [saving, setSaving] = useState(false);

  const update = async (status?: string) => {
    setSaving(true);
    const res = await fetch(`/api/admin/submissions/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, admin_notes: notes, ...(status ? { status } : {}) }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) onUpdate(item.id, data);
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  }[item.status] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {item.photo_url && (
        <img src={item.photo_url} alt={item.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-5 flex flex-col gap-4">
        {/* Status + submitter */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor}`}>
            {item.status}
          </span>
          <span className="text-xs text-gray-400">
            {item.submitter_name ?? 'Anonymous'} · {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Editable title */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CBB9F0]"
          />
        </div>

        {/* Editable description */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CBB9F0] resize-none"
          />
        </div>

        {/* Link */}
        <a href={item.link} target="_blank" rel="noopener noreferrer"
          className="text-xs text-[#FF8E7E] truncate hover:underline">
          {item.link}
        </a>

        {/* Admin notes */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Admin notes (internal)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional notes..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CBB9F0]"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => update('approved')}
            disabled={saving || item.status === 'approved'}
            className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-40"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => update('rejected')}
            disabled={saving || item.status === 'rejected'}
            className="flex-1 py-2 rounded-lg bg-red-400 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-40"
          >
            ✕ Reject
          </button>
          <button
            onClick={() => update()}
            disabled={saving}
            className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all disabled:opacity-40"
          >
            Save edits
          </button>
        </div>
      </div>
    </div>
  );
}
