export type SpotCategory = 'food' | 'activity' | 'shopping' | 'sightseeing' | 'hotel' | 'transport';

export type SpotTagType = 'must_eat' | 'must_buy' | 'must_photo';

export interface SpotTag {
  type: SpotTagType;
  label: string;
}

export interface Spot {
  id: string;
  time: string;
  duration: string;
  name: string;
  nameJa?: string;
  category: SpotCategory;
  description: string;
  tags: SpotTag[];
  mapQuery: string;
  mapCode?: string;
  parkingInfo: string;
  gasInfo: string;
  tip?: string;
}

export interface SnowTip {
  title: string;
  roadCondition: string;
  tempRange: string;
  freezeLevel: '低' | '中等' | '警戒' | '極高危險';
  daylightNote: string;
  detail: string;
  precautions: string[];
}

export interface HotelInfo {
  name: string;
  nameJa?: string;
  checkInNote: string;
  address: string;
  mapQuery: string;
  parking: string;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  dayOfWeek: string;
  title: string;
  area: string;
  routeHighlight: string;
  hotel?: HotelInfo;
  snowTip: SnowTip;
  spots: Spot[];
}

export interface RegionWeather {
  region: string;
  condition: string;
  tempHigh: number;
  tempLow: number;
  snowChance: number;
  snowDepthCm: number;
  iceIndex: '極高 (黑冰)' | '偏高' | '中等' | '普通';
  sunsetTime: string;
  windSpeed: string;
  iconType: 'snow' | 'snow-heavy' | 'sun-snow' | 'cloud-snow';
}
