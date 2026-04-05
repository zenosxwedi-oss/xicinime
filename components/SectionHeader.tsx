import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  href?: string;
  viewAllLabel?: string;
}

export default function SectionHeader({ title, href, viewAllLabel = 'Lihat semua' }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
          {viewAllLabel}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
