'use client';

import { useState } from 'react';
import { Smartphone, Monitor, Apple } from 'lucide-react';

type Platform = 'android' | 'ios' | 'pc';

interface Props {
  children: (platform: Platform) => React.ReactNode;
}

export function DownloadTabs({ children }: Props) {
  const [platform, setPlatform] = useState<Platform>('android');

  const tabs: { id: Platform; label: string; icon: React.ElementType }[] = [
    { id: 'android', label: 'Android', icon: Smartphone },
    { id: 'ios',     label: 'iOS / iPhone', icon: Apple },
    { id: 'pc',      label: 'PC / Mac',     icon: Monitor },
  ];

  return (
    <div>
      <div className="flex gap-2 bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPlatform(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              platform === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-lg shadow-pink-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      {children(platform)}
    </div>
  );
}
