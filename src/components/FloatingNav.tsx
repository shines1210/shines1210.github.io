import React from 'react';
import { Map, BookOpen, CloudSnow, Settings } from 'lucide-react';

export type ActiveTab = 'itinerary' | 'guide' | 'weather' | 'settings';

interface FloatingNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: 'itinerary' as ActiveTab,
      label: '行程',
      sublabel: 'Itinerary',
      icon: Map,
    },
    {
      id: 'guide' as ActiveTab,
      label: '指南',
      sublabel: 'Guide',
      icon: BookOpen,
    },
    {
      id: 'weather' as ActiveTab,
      label: '天氣',
      sublabel: 'Weather & Snow',
      icon: CloudSnow,
    },
    {
      id: 'settings' as ActiveTab,
      label: '設定',
      sublabel: 'Settings & Backup',
      icon: Settings,
    },
  ];

  return (
    <nav
      aria-label="主要導航"
      className="fixed bottom-3 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none"
    >
      <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-1.5 flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex-1 py-2 px-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 min-h-[48px] select-none cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[12px] font-bold tracking-tight mt-0.5 ${
                  isActive ? 'text-white' : 'text-slate-700'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
