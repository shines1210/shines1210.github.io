import React, { useState } from 'react';
import { DAY_WEATHER_SUMMARIES, ROAD_RESOURCES } from '../data/weatherData';
import { ShimaEnagaSvg } from './ShimaEnagaSvg';
import {
  CloudSnow,
  Thermometer,
  Wind,
  Sunset,
  ExternalLink,
  ShieldAlert,
  Snowflake,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface WeatherTabProps {
  initialDay?: number;
}

export const WeatherTab: React.FC<WeatherTabProps> = ({ initialDay = 1 }) => {
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const currentSummary =
    DAY_WEATHER_SUMMARIES.find((s) => s.dayNumber === selectedDay) ||
    DAY_WEATHER_SUMMARIES[0];

  const { weather } = currentSummary;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-28">
      {/* Weather Header Mascot Banner */}
      <div className="bg-gradient-to-r from-[#EFF6FF] via-[#F0F9FF] to-[#E0F2FE] p-4 rounded-3xl border border-[#BFDBFE] flex items-center justify-between gap-3 shadow-xs">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1">
            <Snowflake className="w-3.5 h-3.5" />
            <span>北海道道央・道東 雪況即時監測</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            12 天全線雪道與氣象觀測
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            日落時間平均 16:10，嚴防氣溫破零度後之黑冰路況
          </p>
        </div>
        <div className="shrink-0">
          <ShimaEnagaSvg size={52} mood="happy" />
        </div>
      </div>

      {/* Horizontal Day Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs">
        <div className="text-xs font-bold text-slate-500 mb-2 px-1 flex items-center justify-between">
          <span>選擇檢視天數：</span>
          <span className="text-[#2563EB] font-bold">
            Day {selectedDay} · {currentSummary.location}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {DAY_WEATHER_SUMMARIES.map((item) => {
            const isSelected = item.dayNumber === selectedDay;

            return (
              <button
                key={item.dayNumber}
                onClick={() => setSelectedDay(item.dayNumber)}
                className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center min-w-[56px] ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>D{item.dayNumber}</span>
                <span className="text-[10px] font-normal opacity-85">
                  {item.weather.tempLow}°C
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Weather Card for Selected Day */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-semibold text-[#2563EB]">
              Day {currentSummary.dayNumber} · {currentSummary.date}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {weather.region}
            </h3>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              {weather.condition}
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-black text-slate-900 tabular-nums">
              {weather.tempHigh}°
              <span className="text-base font-normal text-slate-400">
                {' '}/ {weather.tempLow}°
              </span>
            </div>
            <span
              className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                weather.iceIndex.includes('極高')
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              道路結冰：{weather.iceIndex}
            </span>
          </div>
        </div>

        {/* 4-Stat Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1">降雪機率</div>
            <div className="text-base font-bold text-blue-700 tabular-nums">
              {weather.snowChance}%
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1">路面積雪估計</div>
            <div className="text-base font-bold text-slate-800 tabular-nums">
              {weather.snowDepthCm} cm
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1">風向風速</div>
            <div className="text-xs font-bold text-slate-800 mt-1">
              {weather.windSpeed}
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1">日落天黑時刻</div>
            <div className="text-base font-bold text-amber-700 tabular-nums">
              {weather.sunsetTime}
            </div>
          </div>
        </div>

        {/* Advisory Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>當日自駕雪況評估</span>
          </div>
          <p>{currentSummary.snowAdvisory}</p>
        </div>

        {/* Roads to Watch */}
        {currentSummary.roadsToWatch && currentSummary.roadsToWatch.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-700">當日重點監測路段：</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {currentSummary.roadsToWatch.map((road, rIdx) => (
                <span
                  key={rIdx}
                  className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-medium border border-slate-200"
                >
                  🛣️ {road}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Official Road Info & Live Cameras Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-2xl bg-sky-600 text-white flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">官方即時路況與相機</h3>
            <p className="text-xs text-slate-500">自駕出發前一鍵查詢最新通阻</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {ROAD_RESOURCES.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-[#F8FAFC] hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between gap-2 group block"
            >
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                  <span>{res.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {res.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
