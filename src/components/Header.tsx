import React from 'react';
import { ShimaEnagaSvg } from './ShimaEnagaSvg';
import { Sparkles, Calendar, Compass, MapPin, Share2, Settings, Thermometer } from 'lucide-react';

interface HeaderProps {
  currentDay: number;
  totalDays: number;
  currentArea: string;
  liveTemp?: number;
  apparentTemp?: number;
  isLiveWeather?: boolean;
  onOpenQuickJump?: () => void;
  onOpenShare?: () => void;
  onOpenSettings?: () => void;
  onOpenWeather?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  totalDays,
  currentArea,
  liveTemp,
  apparentTemp,
  isLiveWeather,
  onOpenQuickJump,
  onOpenShare,
  onOpenSettings,
  onOpenWeather,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/92 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_rgba(59,130,246,0.06)]">
      <div className="max-w-2xl mx-auto px-4 py-2.5 sm:py-3">
        {/* Top bar with Trip Name & Mascot */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Cute Mascot Avatar */}
            <div className="relative shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#DBEAFE] border border-[#BFDBFE] p-0.5 flex items-center justify-center shadow-xs">
              <ShimaEnagaSvg size={38} mood={currentDay === 12 ? 'sleepy' : 'happy'} />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3B82F6] text-[9px] font-bold text-white shadow-xs">
                ❄
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-[#3B82F6] uppercase">
                  Hokkaido Roadtrip
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-medium text-slate-500">12 Days</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight flex items-center gap-1.5">
                北海道雪季自由行
                <span className="text-xs font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                  繞半圈
                </span>
              </h1>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Share button */}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1 bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#2563EB] border border-slate-200 hover:border-[#93C5FD] active:scale-95 transition-all px-2.5 py-1.5 rounded-2xl cursor-pointer min-h-[38px]"
              title="分享給同行旅伴"
              aria-label="分享給同行旅伴"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-bold hidden xs:inline">分享</span>
            </button>

            {/* Settings & Backup button */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex items-center justify-center bg-[#F8FAFC] hover:bg-[#EFF6FF] text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-[#93C5FD] active:scale-95 transition-all w-9 h-9 rounded-2xl cursor-pointer"
                title="旅程備份與設定"
                aria-label="旅程備份與設定"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Quick status / Day Tracker pill */}
            <button
              onClick={onOpenQuickJump}
              className="flex items-center gap-1.5 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-slate-200 hover:border-[#93C5FD] active:scale-95 transition-all px-2.5 sm:px-3 py-1.5 rounded-2xl text-left cursor-pointer min-h-[38px]"
              title="點擊切換天數"
            >
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">進度</div>
                <div className="text-xs font-bold text-[#1E40AF]">
                  D{currentDay} <span className="text-slate-400 font-normal">/ {totalDays}</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#2563EB]">
                <Compass className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Sub-strip with Dates, Location & Live Temperature */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-1 text-slate-500 font-medium truncate">
            <Calendar className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
            <span className="truncate">11/11 – 11/22</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Live Temperature Chip (Clickable to jump to Weather) */}
            {liveTemp != null && (
              <button
                onClick={onOpenWeather}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  liveTemp <= 0
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
                title="點擊查看即時氣象與黑冰觀測"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Thermometer className="w-3 h-3 text-[#2563EB] shrink-0" />
                <span>
                  {liveTemp > 0 ? `+${liveTemp}` : liveTemp}°C
                </span>
              </button>
            )}

            <div className="flex items-center gap-1 text-[#1E3A8A] font-semibold bg-[#EFF6FF] px-2 py-0.5 rounded-lg border border-[#DBEAFE]">
              <MapPin className="w-3 h-3 text-[#3B82F6] shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-[140px]">{currentArea}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
