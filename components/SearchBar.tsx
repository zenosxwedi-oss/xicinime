'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onClose?: () => void;
  defaultValue?: string;
}

export default function SearchBar({ onClose, defaultValue = '' }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    onClose?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari anime..."
          autoFocus
          className="w-full bg-white/5 border border-indigo-900/50 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Cari
      </button>
    </form>
  );
}
