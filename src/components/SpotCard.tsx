import React, { useRef, useState } from 'react';
import { Spot, SpotCategory, DiaryPhoto } from '../types';
import {
  Utensils,
  Camera,
  ShoppingBag,
  Landmark,
  Hotel,
  Car,
  Navigation,
  Fuel,
  SquareParking,
  Sparkles,
  ImagePlus,
  Trash2,
  Maximize2,
  Clock,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SpotCardProps {
  spot: Spot;
  index: number;
  isCompleted?: boolean;
  onToggleComplete?: (spotId: string) => void;
  photos: DiaryPhoto[];
  onAddPhoto: (spotId: string, spotName: string, file: File) => void;
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photo: DiaryPhoto) => void;
}

const CATEGORY_CONFIG: Record<
  SpotCategory,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  food: {
    label: '美食必吃',
    icon: Utensils,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  activity: {
    label: '體驗活動',
    icon: Sparkles,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  shopping: {
    label: '購物伴手',
    icon: ShoppingBag,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  sightseeing: {
    label: '必訪名勝',
    icon: Landmark,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  hotel: {
    label: '住宿旅宿',
    icon: Hotel,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  transport: {
    label: '交通移動',
    icon: Car,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
};

export const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  index,
  isCompleted = false,
  onToggleComplete,
  photos,
  onAddPhoto,
  onDeletePhoto,
  onViewPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDetails, setShowDetails] = useState(false);

  const cat = CATEGORY_CONFIG[spot.category] || CATEGORY_CONFIG.sightseeing;
  const CategoryIcon = cat.icon;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddPhoto(spot.id, spot.name, file);
    }
    // reset input value so re-uploading same file triggers event
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(spot.mapQuery || spot.name);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className={`relative bg-white rounded-3xl border transition-all duration-200 shadow-xs hover:shadow-md ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/70 opacity-90'
          : 'border-slate-200/90 hover:border-[#93C5FD]'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Top bar of card: Time, Duration, Category badge, Check toggle */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time stamp */}
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100/90 px-2.5 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="tabular-nums">{spot.time}</span>
            </div>

            {/* Duration */}
            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/70">
              {spot.duration}
            </span>

            {/* Category */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cat.bg} ${cat.color} ${cat.border}`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{cat.label}</span>
            </span>
          </div>

          {/* Mark as visited button */}
          {onToggleComplete && (
            <button
              onClick={() => onToggleComplete(spot.id)}
              className={`p-1.5 rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                isCompleted
                  ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                  : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
              }`}
              title={isCompleted ? '標記為未到訪' : '標記已完成'}
              aria-label={isCompleted ? '標記為未到訪' : '標記已完成'}
            >
              <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'fill-emerald-600 text-white' : ''}`} />
            </button>
          )}
        </div>

        {/* Spot Title & Japanese name */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
              }`}
            >
              <span className="text-[#3B82F6] font-mono mr-1.5 text-sm">{index + 1}.</span>
              {spot.name}
            </h2>
            {spot.nameJa && (
              <span className="text-xs text-slate-400 font-medium">{spot.nameJa}</span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {spot.description}
          </p>
        </div>

        {/* Must Eat / Must Buy / Must Photo Highlight Tags */}
        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-3">
            {spot.tags.map((tag, tIdx) => {
              let tagStyle = 'bg-amber-50 text-amber-800 border-amber-200/90';
              let iconChar = '🍽️';

              if (tag.type === 'must_eat') {
                tagStyle = 'bg-orange-50 text-orange-800 border-orange-200';
                iconChar = '🍴 必吃：';
              } else if (tag.type === 'must_buy') {
                tagStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                iconChar = '🛍️ 必買：';
              } else if (tag.type === 'must_photo') {
                tagStyle = 'bg-purple-50 text-purple-800 border-purple-200';
                iconChar = '📷 必拍：';
              }

              return (
                <span
                  key={tIdx}
                  className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-xl border ${tagStyle} shadow-2xs`}
                >
                  <span className="mr-1">{iconChar}</span>
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Local Traveler Tip */}
        {spot.tip && (
          <div className="mt-2.5 p-2.5 rounded-2xl bg-[#F0F7FF] border border-[#BFDBFE] text-xs text-[#1E3A8A] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-bold">雪季秘笈：</span>
              {spot.tip}
            </p>
          </div>
        )}

        {/* Parking & Gas Station Smart Auto-Display */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Parking Info */}
          <div className="flex items-start gap-2 bg-[#F8FAFC] p-2.5 rounded-2xl border border-slate-200/70">
            <SquareParking className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <span>停車情報</span>
                {spot.mapCode && (
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1 rounded">
                    MC: {spot.mapCode}
                  </span>
                )}
              </div>
              <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                {spot.parkingInfo}
              </p>
            </div>
          </div>

          {/* Gas Station Info */}
          <div className="flex items-start gap-2 bg-[#F8FAFC] p-2.5 rounded-2xl border border-slate-200/70">
            <Fuel className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-bold text-slate-800">周邊加油站</div>
              <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                {spot.gasInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Photos & Journaling Area */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Camera className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>本站旅記相簿</span>
              {photos.length > 0 && (
                <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-1.5 py-0.2 rounded-full font-bold">
                  {photos.length}
                </span>
              )}
            </div>

            {/* Upload Button */}
            <label className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2.5 py-1.5 rounded-xl border border-[#BFDBFE] transition-colors cursor-pointer active:scale-95">
              <ImagePlus className="w-3.5 h-3.5" />
              <span>拍照 / 上傳</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Photo Thumbnails List */}
          {photos.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative shrink-0 group rounded-xl overflow-hidden border border-slate-200 shadow-2xs w-20 h-20 bg-slate-100"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || spot.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onViewPhoto(photo)}
                      className="p-1 rounded-full bg-white/90 text-slate-800 hover:text-blue-600"
                      title="放大檢視"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="p-1 rounded-full bg-white/90 text-red-600 hover:text-red-800"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic py-1 flex items-center gap-1">
              <span>尚未上傳照片，抵達時可拍照打卡記錄專屬雪景～</span>
            </div>
          )}
        </div>

        {/* Navigation Action CTA */}
        <div className="mt-3.5 pt-2 flex items-center justify-end gap-2">
          <button
            onClick={handleOpenGoogleMaps}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer min-h-[44px]"
          >
            <Navigation className="w-4 h-4 fill-white/20" />
            <span>開啟 Google Maps 導航</span>
          </button>
        </div>
      </div>
    </article>
  );
};
