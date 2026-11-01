import React, { useState, useEffect, useMemo } from 'react';
import { ITINERARY_DATA } from './data/itineraryData';
import { DayItinerary, DiaryPhoto, SpotCategory } from './types';
import { Header } from './components/Header';
import { FloatingNav, ActiveTab } from './components/FloatingNav';
import { DaySelector } from './components/DaySelector';
import { SpotCard } from './components/SpotCard';
import { SnowTipCard } from './components/SnowTipCard';
import { HotelCard } from './components/HotelCard';
import { PhotoModal } from './components/PhotoModal';
import { ShareModal } from './components/ShareModal';
import { GuideTab } from './components/GuideTab';
import { WeatherTab } from './components/WeatherTab';
import { SettingsTab } from './components/SettingsTab';
import { ShimaEnagaSvg } from './components/ShimaEnagaSvg';
import {
  Sparkles,
  MapPin,
  Calendar,
  Filter,
  Camera,
  ChevronRight,
  X,
  Compass,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const CATEGORY_FILTERS: { id: 'all' | SpotCategory; label: string }[] = [
  { id: 'all', label: '全部景點' },
  { id: 'sightseeing', label: '名勝景點' },
  { id: 'food', label: '必吃美食' },
  { id: 'shopping', label: '購物伴手' },
  { id: 'activity', label: '體驗活動' },
  { id: 'transport', label: '交通取車' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('itinerary');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<'all' | SpotCategory>('all');
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Completed spots state (stored in localStorage)
  const [completedSpotIds, setCompletedSpotIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hokkaido_completed_spots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Diary photos state (stored in localStorage)
  const [photos, setPhotos] = useState<DiaryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('hokkaido_diary_photos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active photo being previewed in modal
  const [activePhoto, setActivePhoto] = useState<DiaryPhoto | null>(null);

  // Save completed spots to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hokkaido_completed_spots', JSON.stringify(completedSpotIds));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [completedSpotIds]);

  // Save photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hokkaido_diary_photos', JSON.stringify(photos));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [photos]);

  const currentDayData = useMemo(() => {
    return (
      ITINERARY_DATA.find((d) => d.dayNumber === selectedDayNumber) ||
      ITINERARY_DATA[0]
    );
  }, [selectedDayNumber]);

  // Filtered spots for current day
  const filteredSpots = useMemo(() => {
    if (selectedCategory === 'all') return currentDayData.spots;
    return currentDayData.spots.filter((s) => s.category === selectedCategory);
  }, [currentDayData, selectedCategory]);

  const handleToggleComplete = (spotId: string) => {
    setCompletedSpotIds((prev) =>
      prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId]
    );
  };

  // Compress and save photo
  const handleAddPhoto = (spotId: string, spotName: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 960;
        const MAX_HEIGHT = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

          const now = new Date();
          const newPhoto: DiaryPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            dayNumber: selectedDayNumber,
            spotId,
            spotName,
            imageUrl: compressedDataUrl,
            caption: '',
            dateStr: `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            timestamp: Date.now(),
          };

          setPhotos((prev) => [newPhoto, ...prev]);
        }
      };
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleUpdateCaption = (photoId: string, newCaption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption: newCaption } : p))
    );
  };

  const handleRestoreData = (restoredSpots: string[], restoredPhotos: DiaryPhoto[]) => {
    setCompletedSpotIds(restoredSpots);
    setPhotos(restoredPhotos);
  };

  const handleClearPhotos = () => {
    setPhotos([]);
  };

  const handleResetCompletedSpots = () => {
    setCompletedSpotIds([]);
  };

  const handleClearAll = () => {
    setCompletedSpotIds([]);
    setPhotos([]);
    try {
      localStorage.removeItem('hokkaido_completed_spots');
      localStorage.removeItem('hokkaido_diary_photos');
      localStorage.removeItem('hokkaido_checklist_checked');
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  };

  // Total completed count for progress
  const totalCompletedSpots = ITINERARY_DATA.flatMap((d) => d.spots).filter((s) =>
    completedSpotIds.includes(s.id)
  ).length;
  const totalSpotsCount = ITINERARY_DATA.flatMap((d) => d.spots).length;

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 relative selection:bg-[#93C5FD] selection:text-[#1E3A8A] font-sans">
      {/* Subtle Gentle Snow Overlay Animation */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 select-none">
        <div className="absolute top-4 left-1/6 w-2 h-2 bg-white rounded-full animate-snow-1 blur-[0.5px]" />
        <div className="absolute top-2 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-snow-2 blur-[0.5px]" />
        <div className="absolute top-8 left-2/3 w-2.5 h-2.5 bg-white rounded-full animate-snow-3 blur-[1px]" />
        <div className="absolute top-0 left-5/6 w-1.5 h-1.5 bg-white rounded-full animate-snow-1 blur-[0.5px]" />
      </div>

      {/* Header */}
      <Header
        currentDay={selectedDayNumber}
        totalDays={ITINERARY_DATA.length}
        currentArea={currentDayData.area}
        onOpenQuickJump={() => setQuickJumpOpen(true)}
        onOpenShare={() => setShareModalOpen(true)}
        onOpenSettings={() => {
          setActiveTab('settings');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Tab 1: 行程 (Itinerary) */}
      {activeTab === 'itinerary' && (
        <main className="relative z-10 pb-28">
          {/* Day Selector */}
          <DaySelector
            selectedDay={selectedDayNumber}
            onSelectDay={(dayNum) => setSelectedDayNumber(dayNum)}
          />

          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            {/* Daily Card Header */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-medium mb-1">
                    <span className="font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-lg border border-[#DBEAFE]">
                      Day {currentDayData.dayNumber}
                    </span>
                    <span>{currentDayData.date} ({currentDayData.dayOfWeek})</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-semibold">{currentDayData.area}</span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {currentDayData.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    📍 {currentDayData.routeHighlight}
                  </p>
                </div>

                <div className="shrink-0 hidden sm:block">
                  <ShimaEnagaSvg size={48} mood="happy" />
                </div>
              </div>

              {/* Progress for this day */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    今日已造訪：
                    <strong className="text-slate-800 ml-1">
                      {currentDayData.spots.filter((s) => completedSpotIds.includes(s.id)).length}
                    </strong>{' '}
                    / {currentDayData.spots.length} 站
                  </span>
                </div>
                <div className="text-[11px] text-[#2563EB] font-bold">
                  共 {currentDayData.spots.length} 個行程站點
                </div>
              </div>
            </div>

            {/* Hotel accommodation Card (if available for the day) */}
            {currentDayData.hotel && (
              <HotelCard hotel={currentDayData.hotel} dayNumber={currentDayData.dayNumber} />
            )}

            {/* Category Filter Bar */}
            <div className="flex items-center justify-between gap-2 pt-1 pb-1">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spots Cards List */}
            <div className="space-y-3.5">
              {filteredSpots.map((spot, idx) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  index={idx}
                  isCompleted={completedSpotIds.includes(spot.id)}
                  onToggleComplete={handleToggleComplete}
                  photos={photos.filter((p) => p.spotId === spot.id)}
                  onAddPhoto={handleAddPhoto}
                  onDeletePhoto={handleDeletePhoto}
                  onViewPhoto={(photo) => setActivePhoto(photo)}
                />
              ))}

              {filteredSpots.length === 0 && (
                <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
                  <p className="text-sm">此類別今日無排定景點</p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="mt-2 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    顯示全部景點
                  </button>
                </div>
              )}
            </div>

            {/* Snow Tip Card (Required: 每一天行程下方加入「雪況提示」) */}
            <div className="pt-2">
              <SnowTipCard
                snowTip={currentDayData.snowTip}
                dayNumber={currentDayData.dayNumber}
              />
            </div>
          </div>
        </main>
      )}

      {/* Tab 2: 指南 (Guide) */}
      {activeTab === 'guide' && (
        <main className="relative z-10">
          <GuideTab />
        </main>
      )}

      {/* Tab 3: 天氣 (Weather & Snow) */}
      {activeTab === 'weather' && (
        <main className="relative z-10">
          <WeatherTab initialDay={selectedDayNumber} />
        </main>
      )}

      {/* Tab 4: 設定與備份 (Settings & Backup) */}
      {activeTab === 'settings' && (
        <main className="relative z-10">
          <SettingsTab
            completedSpotIds={completedSpotIds}
            photos={photos}
            onRestoreData={handleRestoreData}
            onClearPhotos={handleClearPhotos}
            onResetCompletedSpots={handleResetCompletedSpots}
            onClearAll={handleClearAll}
          />
        </main>
      )}

      {/* Floating Bottom Navigation */}
      <FloatingNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        photoCount={photos.length}
      />

      {/* Photo Viewer Modal */}
      <PhotoModal
        photo={activePhoto}
        onClose={() => setActivePhoto(null)}
        onDelete={handleDeletePhoto}
        onUpdateCaption={handleUpdateCaption}
      />

      {/* Quick Jump Modal */}
      {quickJumpOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-slate-900 text-base">快速跳轉天數</h3>
              </div>
              <button
                onClick={() => setQuickJumpOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-2 space-y-1.5 flex-1 pr-1">
              {ITINERARY_DATA.map((day) => {
                const isSelected = day.dayNumber === selectedDayNumber;
                const completedForDay = day.spots.filter((s) =>
                  completedSpotIds.includes(s.id)
                ).length;

                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => {
                      setSelectedDayNumber(day.dayNumber);
                      setActiveTab('itinerary');
                      setQuickJumpOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#93C5FD] shadow-xs'
                        : 'bg-[#F8FAFC] hover:bg-slate-100 border-slate-200/80'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2563EB]">
                          Day {day.dayNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          {day.date} ({day.dayOfWeek})
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-800 truncate mt-0.5">
                        {day.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {day.area}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400">
                        {completedForDay} / {day.spots.length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto mt-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
              全趟行程進度：{totalCompletedSpots} / {totalSpotsCount} 站完成
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
