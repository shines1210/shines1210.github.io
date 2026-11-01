import { useState, useEffect, useCallback } from 'react';
import {
  LiveWeatherData,
  getBaselineWeatherData,
  getCachedLiveWeather,
  fetchLiveHokkaidoWeather,
} from '../services/weatherService';

export function useLiveWeather() {
  const [weatherMap, setWeatherMap] = useState<Record<number, LiveWeatherData>>(() => {
    const cached = getCachedLiveWeather();
    if (cached) {
      return cached.data;
    }
    return getBaselineWeatherData();
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    const cached = getCachedLiveWeather();
    return cached?.updatedAt || null;
  });
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncWeather = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const liveData = await fetchLiveHokkaidoWeather();
      setWeatherMap(liveData);
      const nowStr = new Date().toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSyncTime(nowStr);
    } catch (err) {
      console.warn('Real-time weather sync failed, falling back to cache:', err);
      setSyncError('即時氣象同步逾時，已保留最近更新資料');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial sync on mount
  useEffect(() => {
    syncWeather();

    // Auto-refresh every 15 minutes
    const interval = setInterval(() => {
      syncWeather();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [syncWeather]);

  const hasAnyLive = Object.values(weatherMap).some((w) => w.isLive);

  return {
    weatherMap,
    isSyncing,
    lastSyncTime,
    syncError,
    isLive: hasAnyLive,
    syncWeather,
  };
}
