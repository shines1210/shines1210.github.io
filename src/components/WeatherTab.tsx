import React, { useState } from 'react';
import { DAY_WEATHER_SUMMARIES, ROAD_RESOURCES } from '../data/weatherData';
import { ShimaEnagaSvg } from './ShimaEnagaSvg';
import { useLiveWeather } from '../hooks/useLiveWeather';
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
  RefreshCw,
  Radio,
  CheckCircle2,
  Clock,
  Sun,
  Eye,
} from 'lucide-react';

interface WeatherTabProps {
  initialDay?: number;
  liveWeatherHook?: ReturnType<typeof useLiveWeather>;
}

export const WeatherTab: React.FC<WeatherTabProps> = ({
  initialDay = 1,
  liveWeatherHook,
}) => {
  const [selectedDay, setSelectedDay] = useState(initialDay);

  // If passed from parent, use parent hook, otherwise instantiate locally
  const localHook = useLiveWeather();
  const {
    weatherMap,
    isSyncing,
    lastSyncTime,
    syncError,
    isLive,
    syncWeather,
  } = liveWeatherHook || localHook;

  const currentSummary =
    DAY_WEATHER_SUMMARIES.find((s) => s.dayNumber === selectedDay) ||
    DAY_WEATHER_SUMMARIES[0];

  const live = weatherMap[selectedDay];

  // Dynamic real-time weather values or fallback
  const currentTemp = live?.currentTemp ?? currentSummary.weather.tempHigh;
  const apparentTemp = live?.apparentTemp ?? currentSummary.weather.tempLow;
  const tempHigh = live?.tempHigh ?? currentSummary.weather.tempHigh;
  const tempLow = live?.tempLow ?? currentSummary.weather.tempLow;
  const condition = live?.condition ?? currentSummary.weather.condition;
  const snowChance = live?.snowChance ?? currentSummary.weather.snowChance;
  const snowDepthCm = live?.snowDepthCm ?? currentSummary.weather.snowDepthCm;
  const windSpeed = live?.windSpeed ?? currentSummary.weather.windSpeed;
  const sunsetTime = live?.sunsetTime ?? currentSummary.weather.sunsetTime;
  const iceIndex = live?.iceIndex ?? currentSummary.weather.iceIndex;
  const isCurrentlyLive = live?.isLive ?? false;

  const isBelowFreezing = currentTemp <= 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-28">
      {/* Weather Header Mascot Banner */}
      <div className="bg-gradient-to-r from-[#EFF6FF] via-[#F0F9FF] to-[#E0F2FE] p-4 rounded-3xl border border-[#BFDBFE] flex items-center justify-between gap-3 shadow-xs">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1">
            <Snowflake className="w-3.5 h-3.5" />
            <span>北海道道央・道東 雪況即時監測</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            12 天全線雪道與氣象觀測
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            已對接日本氣象即時預測，自動監控 12 個自駕停靠站即時氣溫與結冰黑冰警報
          </p>
        </div>
        <div className="shrink-0">
          <ShimaEnagaSvg size={52} mood="happy" />
        </div>
      </div>

      {/* Real-time Sync Status & Refresh Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-3 w-3 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSyncing ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isSyncing ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <span>{isSyncing ? '正在即時同步北海道氣溫...' : '氣象即時同步連線中'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold hidden sm:inline">
                Open-Meteo API
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>最後更新：{lastSyncTime || '剛剛'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => syncWeather()}
          disabled={isSyncing}
          className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[38px] ${
            isSyncing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white'
          }`}
          title="立即向氣象衛星伺服器同步最新氣溫"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? '同步中' : '即時同步'}</span>
        </button>
      </div>

      {syncError && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Horizontal Day Switcher with Live Temperatures */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs">
        <div className="text-xs font-bold text-slate-500 mb-2 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>選擇路線站點：</span>
          </span>
          <span className="text-[#2563EB] font-bold">
            Day {selectedDay} · {currentSummary.location}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {DAY_WEATHER_SUMMARIES.map((item) => {
            const isSelected = item.dayNumber === selectedDay;
            const dayLive = weatherMap[item.dayNumber];
            const tempVal = dayLive ? dayLive.currentTemp : item.weather.tempHigh;

            return (
              <button
                key={item.dayNumber}
                onClick={() => setSelectedDay(item.dayNumber)}
                className={`shrink-0 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center min-w-[58px] ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>D{item.dayNumber}</span>
                <span
                  className={`text-[11px] font-black mt-0.5 tabular-nums ${
                    isSelected
                      ? 'text-white'
                      : tempVal <= 0
                      ? 'text-blue-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {tempVal > 0 ? `+${tempVal}` : tempVal}°
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Weather Card for Selected Day */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div
          className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isBelowFreezing ? 'bg-blue-400' : 'bg-emerald-400'
          }`}
        />

        <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                Day {currentSummary.dayNumber} · {currentSummary.date}
              </span>
              {isCurrentlyLive && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  即時觀測中
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-1">
              {currentSummary.weather.region}
            </h3>
            <p className="text-sm font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5">
              <span>{condition}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            {/* Big Live Current Temperature */}
            <div className="flex items-baseline justify-end gap-1">
              <span
                className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${
                  isBelowFreezing ? 'text-blue-600' : 'text-slate-900'
                }`}
              >
                {currentTemp > 0 ? `+${currentTemp}` : currentTemp}°C
              </span>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              體感 {apparentTemp}°C · 高低 {tempHigh}° / {tempLow}°
            </div>

            <span
              className={`inline-block mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                iceIndex.includes('極高')
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : iceIndex.includes('偏高')
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              結冰指數：{iceIndex}
            </span>
          </div>
        </div>

        {/* 4-Stat Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs relative z-10">
          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-center gap-1">
              <CloudSnow className="w-3.5 h-3.5 text-blue-500" />
              <span>降雪/雨機率</span>
            </div>
            <div className="text-base font-bold text-blue-700 tabular-nums">
              {snowChance}%
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-center gap-1">
              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
              <span>路面/降雪量</span>
            </div>
            <div className="text-base font-bold text-slate-800 tabular-nums">
              {snowDepthCm} cm
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-center gap-1">
              <Wind className="w-3.5 h-3.5 text-slate-500" />
              <span>風速風力</span>
            </div>
            <div className="text-base font-bold text-slate-800 tabular-nums">
              {windSpeed}
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/70 text-center">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-center gap-1">
              <Sunset className="w-3.5 h-3.5 text-amber-500" />
              <span>日落天黑時刻</span>
            </div>
            <div className="text-base font-bold text-amber-700 tabular-nums">
              {sunsetTime}
            </div>
          </div>
        </div>

        {/* Real-time Dynamic Advisory Box */}
        <div
          className={`mt-4 p-3.5 rounded-2xl border text-xs leading-relaxed relative z-10 ${
            isBelowFreezing
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <AlertTriangle
              className={`w-4 h-4 shrink-0 ${
                isBelowFreezing ? 'text-rose-600' : 'text-amber-600'
              }`}
            />
            <span>
              {isBelowFreezing ? '⚠️ 即時零下低溫黑冰警示' : '❄️ 當日雪道自駕評估'}
            </span>
          </div>
          <p className="mt-0.5">
            {isBelowFreezing
              ? `目前該區即時氣溫為 ${currentTemp}°C（體感 ${apparentTemp}°C），已低於冰點！柏油路面水氣隨時反凍成透明黑冰 (Black Ice)，行經高架橋與樹蔭背陽彎道請勿急打方向盤與急踩煞車。`
              : currentSummary.snowAdvisory}
          </p>
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
