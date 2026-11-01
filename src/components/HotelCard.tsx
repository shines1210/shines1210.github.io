import React from 'react';
import { HotelInfo } from '../types';
import { Hotel, MapPin, Navigation, SquareParking, KeyRound } from 'lucide-react';

interface HotelCardProps {
  hotel: HotelInfo;
  dayNumber: number;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, dayNumber }) => {
  const handleNavigate = () => {
    const query = encodeURIComponent(hotel.mapQuery || hotel.name);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/40 rounded-3xl border border-emerald-200/80 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Hotel className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Day {dayNumber} 當日下榻旅宿
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {hotel.name}
            </h3>
          </div>
        </div>

        <button
          onClick={handleNavigate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[38px]"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>導航</span>
        </button>
      </div>

      {hotel.nameJa && (
        <div className="text-xs text-slate-500 font-medium pl-10 -mt-1 mb-2">
          {hotel.nameJa}
        </div>
      )}

      {/* Address & Check-in info */}
      <div className="space-y-1.5 text-xs text-slate-600 pl-1 mt-2.5">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="text-slate-700 font-medium">{hotel.address}</span>
        </div>

        <div className="flex items-start gap-1.5 bg-white/80 p-2.5 rounded-2xl border border-slate-200/70">
          <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-slate-800">入住備忘：</span>
            <span className="text-slate-600 ml-1">{hotel.checkInNote}</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 bg-white/80 p-2.5 rounded-2xl border border-slate-200/70">
          <SquareParking className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-slate-800">停車說明：</span>
            <span className="text-slate-600 ml-1">{hotel.parking}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
