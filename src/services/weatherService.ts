import { RegionWeather } from '../types';
import { DAY_WEATHER_SUMMARIES } from '../data/weatherData';

export interface LiveWeatherData {
  dayNumber: number;
  locationName: string;
  currentTemp: number;
  apparentTemp: number;
  tempHigh: number;
  tempLow: number;
  weatherCode: number;
  condition: string;
  snowChance: number;
  snowDepthCm: number;
  windSpeed: string;
  sunsetTime: string;
  iceIndex: '極高 (黑冰)' | '偏高' | '中等' | '普通';
  iconType: 'snow' | 'snow-heavy' | 'sun-snow' | 'cloud-snow';
  isLive: boolean;
  updatedAt: string;
}

export interface DayCoordinate {
  dayNumber: number;
  name: string;
  region: string;
  lat: number;
  lon: number;
}

export const HOKKAIDO_DAY_COORDINATES: DayCoordinate[] = [
  { dayNumber: 1, name: '札幌市區', region: '札幌・石狩', lat: 43.0642, lon: 141.3469 },
  { dayNumber: 2, name: '小樽 ＆ 藻岩山', region: '後志・小樽', lat: 43.1907, lon: 140.9947 },
  { dayNumber: 3, name: '白色戀人 ＆ 神宮', region: '札幌西區・圓山', lat: 43.0642, lon: 141.3469 },
  { dayNumber: 4, name: '占冠 ➔ 帶廣', region: '十勝・占冠山嶺', lat: 42.9239, lon: 143.1966 },
  { dayNumber: 5, name: '帶廣 ➔ 釧路', region: '釧路・十勝平原', lat: 42.9849, lon: 144.3818 },
  { dayNumber: 6, name: '釧路 ➔ 阿寒湖', region: '阿寒摩周國立公園', lat: 43.4402, lon: 144.0927 },
  { dayNumber: 7, name: '屈斜路 ➔ 摩周 ➔ 知床', region: '摩周高地・知床半島', lat: 44.0664, lon: 144.9961 },
  { dayNumber: 8, name: '知床五湖 ＆ 知床峠', region: '知床世界遺產半島', lat: 44.1167, lon: 145.0833 },
  { dayNumber: 9, name: '能取岬 ➔ 網走 ➔ 北見', region: '鄂霍次克沿岸・北見', lat: 44.0206, lon: 144.2734 },
  { dayNumber: 10, name: '石北峠 ➔ 層雲峽 ➔ 旭川', region: '大雪山連峰・層雲峽', lat: 43.7222, lon: 142.9472 },
  { dayNumber: 11, name: '旭川 ➔ 砂川 ➔ 札幌', region: '上川・空知・旭川', lat: 43.7706, lon: 142.3649 },
  { dayNumber: 12, name: '札幌 ➔ 新千歲機場', region: '石狩・新千歲機場', lat: 42.7933, lon: 141.6733 },
];

/**
 * Interpret WMO weather interpretation codes into Chinese description and icon
 */
export function interpretWmoCode(
  code: number,
  temp: number
): { condition: string; iconType: 'snow' | 'snow-heavy' | 'sun-snow' | 'cloud-snow' } {
  // Snow codes
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    if (code === 75 || code === 86) {
      return { condition: '吹雪・強大雪', iconType: 'snow-heavy' };
    }
    if (code === 85) {
      return { condition: '強風局部陣雪', iconType: 'snow' };
    }
    if (code === 71) {
      return { condition: '初冬輕飄細雪', iconType: 'snow' };
    }
    return { condition: '持續降雪中', iconType: 'snow' };
  }

  // Freezing rain / Drizzle
  if ([56, 57, 66, 67].includes(code)) {
    return { condition: '極度低溫凍雨 (地面速結冰)', iconType: 'snow' };
  }

  // Rain / Showers
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    if (temp <= 2) {
      return { condition: '低溫濕雪・雨夾雪', iconType: 'cloud-snow' };
    }
    return { condition: '局部陣雨・濕冷', iconType: 'cloud-snow' };
  }

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return { condition: '雷雨挾帶冰霰', iconType: 'snow-heavy' };
  }

  // Fog
  if ([45, 48].includes(code)) {
    return { condition: '高山濃霧・易生霧淞', iconType: 'cloud-snow' };
  }

  // Overcast / Cloudy
  if (code === 3) {
    return { condition: temp <= 0 ? '陰天乾冷・寒流雲系' : '多雲時陰', iconType: 'cloud-snow' };
  }
  if (code === 2) {
    return { condition: temp <= 0 ? '晴時多雲・路面反凍' : '多雲偶見陽光', iconType: 'sun-snow' };
  }
  if (code === 1) {
    return { condition: temp <= 0 ? '寒風凜冽・冬陽' : '晴朗溫和', iconType: 'sun-snow' };
  }
  if (code === 0) {
    return { condition: temp <= 0 ? '萬里無雲・冷冽乾冷' : '晴空萬里', iconType: 'sun-snow' };
  }

  return { condition: '局部多雲・初冬氣候', iconType: 'cloud-snow' };
}

/**
 * Determine ice warning index based on real-time temperature, apparent temp, and weather
 */
export function calculateIceIndex(
  currentTemp: number,
  apparentTemp: number,
  tempLow: number,
  snowChance: number
): '極高 (黑冰)' | '偏高' | '中等' | '普通' {
  if (currentTemp <= 0 && snowChance > 40) return '極高 (黑冰)';
  if (apparentTemp <= -4 || tempLow <= -5) return '極高 (黑冰)';
  if (currentTemp <= 2 || tempLow <= -1) return '偏高';
  if (currentTemp <= 6) return '中等';
  return '普通';
}

const CACHE_KEY = 'hokkaido_live_weather_cache_v2';

/**
 * Get initial baseline data from local static records
 */
export function getBaselineWeatherData(): Record<number, LiveWeatherData> {
  const result: Record<number, LiveWeatherData> = {};
  DAY_WEATHER_SUMMARIES.forEach((summary) => {
    result[summary.dayNumber] = {
      dayNumber: summary.dayNumber,
      locationName: summary.location,
      currentTemp: summary.weather.tempHigh,
      apparentTemp: summary.weather.tempLow,
      tempHigh: summary.weather.tempHigh,
      tempLow: summary.weather.tempLow,
      weatherCode: 71,
      condition: summary.weather.condition,
      snowChance: summary.weather.snowChance,
      snowDepthCm: summary.weather.snowDepthCm,
      windSpeed: summary.weather.windSpeed,
      sunsetTime: summary.weather.sunsetTime,
      iceIndex: summary.weather.iceIndex,
      iconType: summary.weather.iconType,
      isLive: false,
      updatedAt: '預載基準資料',
    };
  });
  return result;
}

/**
 * Fetch real-time weather from Open-Meteo for all 12 Hokkaido route points simultaneously
 */
export async function fetchLiveHokkaidoWeather(): Promise<Record<number, LiveWeatherData>> {
  const lats = HOKKAIDO_DAY_COORDINATES.map((c) => c.lat).join(',');
  const lons = HOKKAIDO_DAY_COORDINATES.map((c) => c.lon).join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,snowfall_sum,sunset&timezone=Asia%2FTokyo`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`天氣伺服器回應異常：${response.status}`);
  }

  const data = await response.json();
  const rawList = Array.isArray(data) ? data : [data];

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const resultMap: Record<number, LiveWeatherData> = {};

  HOKKAIDO_DAY_COORDINATES.forEach((coord, idx) => {
    const locData = rawList[idx];
    const baseline = DAY_WEATHER_SUMMARIES.find((s) => s.dayNumber === coord.dayNumber);

    if (locData && locData.current) {
      const currentTemp = Math.round(locData.current.temperature_2m * 10) / 10;
      const apparentTemp = Math.round(locData.current.apparent_temperature * 10) / 10;
      const weatherCode = locData.current.weather_code ?? 0;
      const windSpeedKmH = locData.current.wind_speed_10m ?? 0;
      const windSpeedMS = Math.round((windSpeedKmH / 3.6) * 10) / 10;

      const tempHigh = locData.daily?.temperature_2m_max?.[0] != null
        ? Math.round(locData.daily.temperature_2m_max[0])
        : currentTemp + 2;

      const tempLow = locData.daily?.temperature_2m_min?.[0] != null
        ? Math.round(locData.daily.temperature_2m_min[0])
        : currentTemp - 4;

      const snowChance = locData.daily?.precipitation_probability_max?.[0] != null
        ? locData.daily.precipitation_probability_max[0]
        : (baseline?.weather.snowChance ?? 30);

      const rawSnowSum = locData.daily?.snowfall_sum?.[0] ?? 0;
      const snowDepthCm = Math.round(rawSnowSum) || (baseline?.weather.snowDepthCm ?? 5);

      let sunsetTime = baseline?.weather.sunsetTime || '16:15';
      if (locData.daily?.sunset?.[0]) {
        try {
          const sunsetDate = new Date(locData.daily.sunset[0]);
          sunsetTime = sunsetDate.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        } catch {
          // fallback
        }
      }

      const { condition, iconType } = interpretWmoCode(weatherCode, currentTemp);
      const iceIndex = calculateIceIndex(currentTemp, apparentTemp, tempLow, snowChance);

      resultMap[coord.dayNumber] = {
        dayNumber: coord.dayNumber,
        locationName: coord.name,
        currentTemp,
        apparentTemp,
        tempHigh,
        tempLow,
        weatherCode,
        condition,
        snowChance,
        snowDepthCm,
        windSpeed: `${windSpeedMS} m/s`,
        sunsetTime,
        iceIndex,
        iconType,
        isLive: true,
        updatedAt: timeFormatted,
      };
    } else {
      // Fallback to baseline
      resultMap[coord.dayNumber] = {
        dayNumber: coord.dayNumber,
        locationName: coord.name,
        currentTemp: baseline?.weather.tempHigh ?? 4,
        apparentTemp: baseline?.weather.tempLow ?? -2,
        tempHigh: baseline?.weather.tempHigh ?? 4,
        tempLow: baseline?.weather.tempLow ?? -2,
        weatherCode: 71,
        condition: baseline?.weather.condition ?? '晴偶飄雪',
        snowChance: baseline?.weather.snowChance ?? 40,
        snowDepthCm: baseline?.weather.snowDepthCm ?? 5,
        windSpeed: baseline?.weather.windSpeed ?? '3m/s',
        sunsetTime: baseline?.weather.sunsetTime ?? '16:15',
        iceIndex: baseline?.weather.iceIndex ?? '偏高',
        iconType: baseline?.weather.iconType ?? 'snow',
        isLive: false,
        updatedAt: '離線基準',
      };
    }
  });

  // Save to localStorage cache
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        updatedAt: timeFormatted,
        data: resultMap,
      })
    );
  } catch {
    // ignore
  }

  return resultMap;
}

/**
 * Load cached weather if available
 */
export function getCachedLiveWeather(): {
  data: Record<number, LiveWeatherData>;
  updatedAt: string | null;
} | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.data) {
        return {
          data: parsed.data,
          updatedAt: parsed.updatedAt || null,
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}
