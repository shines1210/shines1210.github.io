import React from 'react';
import { SnowTip } from '../types';
import { AlertTriangle, Snowflake, Thermometer, Sunset, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface SnowTipCardProps {
  snowTip: SnowTip;
  dayNumber: number;
  liveTemp?: number;
  apparentTemp?: number;
  liveCondition?: string;
  liveIceIndex?: string;
  onViewWeather?: () => void;
}

export const SnowTipCard: React.FC<SnowTipCardProps> = ({
  snowTip,
  dayNumber,
  liveTemp,
  apparentTemp,
  liveCondition,
  liveIceIndex,
  onViewWeather,
}) => {
  const isHighRisk =
    snowTip.freezeLevel === '極高危險' ||
    (liveIceIndex && liveIceIndex.includes('極高')) ||
    (liveTemp != null && liveTemp <= 0);

  return (
    <section
      aria-label="每日雪況提示"
      className={`rounded-3xl border p-4 sm:p-5 relative overflow-hidden transition-all shadow-xs ${
        isHighRisk
          ? 'bg-gradient-to-br from-[#FEF2F2] via-[#FFF1F2] to-[#EFF6FF] border-rose-300'
          : 'bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#F0FDF4] border-[#BFDBFE]'
      }`}
    >
      {/* Decorative background snowflake watermarks */}
      <div className="absolute top-2 right-2 text-blue-200/40 pointer-events-none select-none">
        <Snowflake className="w-24 h-24" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${
                isHighRisk ? 'bg-rose-500 text-white' : 'bg-[#2563EB] text-white'
              }`}
            >
              {isHighRisk ? <ShieldAlert className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Day {dayNumber} 雪道行車防護
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {snowTip.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                isHighRisk
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}
            >
              {liveIceIndex ? `結冰警戒：${liveIceIndex}` : `結冰危險度：${snowTip.freezeLevel}`}
            </span>
          </div>
        </div>

        {/* Live Weather Sync Strip if available */}
        {liveTemp != null && (
          <div className="mb-3 p-2.5 rounded-2xl bg-white/95 border border-blue-200 shadow-2xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="text-xs truncate">
                <span className="font-bold text-slate-800">即時觀測氣溫：</span>
                <span className={`font-black ml-1 ${liveTemp <= 0 ? 'text-blue-600' : 'text-emerald-700'}`}>
                  {liveTemp > 0 ? `+${liveTemp}` : liveTemp}°C
                </span>
                {apparentTemp != null && (
                  <span className="text-slate-500 ml-1.5 hidden xs:inline">
                    (體感 {apparentTemp > 0 ? `+${apparentTemp}` : apparentTemp}°C)
                  </span>
                )}
                {liveCondition && (
                  <span className="text-slate-600 ml-2 font-medium">· {liveCondition}</span>
                )}
              </div>
            </div>

            {onViewWeather && (
              <button
                onClick={onViewWeather}
                className="shrink-0 text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>天氣詳情</span>
                <span>➔</span>
              </button>
            )}
          </div>
        )}

        {/* Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs">
          <div className="flex items-start gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-200/80">
            <Thermometer className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">行程預估氣溫：</span>
              <span className="text-slate-600 ml-1">{snowTip.tempRange}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-200/80">
            <Sunset className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">日照提醒：</span>
              <span className="text-slate-600 ml-1">{snowTip.daylightNote}</span>
            </div>
          </div>
        </div>

        {/* Road status & Detailed Analysis */}
        <div className="bg-white/90 rounded-2xl p-3 border border-slate-200/90 mb-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>道路狀況概要：{snowTip.roadCondition}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{snowTip.detail}</p>
        </div>

        {/* Precautions bullet list */}
        {snowTip.precautions && snowTip.precautions.length > 0 && (
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>今日重點叮嚀：</span>
            </div>
            <ul className="space-y-1 pl-1">
              {snowTip.precautions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                  <span className="text-[#3B82F6] font-bold text-xs mt-0.5">●</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
