import React, { useRef, useEffect } from 'react';
import { ITINERARY_DATA } from '../data/itineraryData';
import { ChevronLeft, ChevronRight, Snowflake } from 'lucide-react';

interface DaySelectorProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDay,
  onSelectDay,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector(
        `[data-day="${selectedDay}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [selectedDay]);

  const handlePrev = () => {
    if (selectedDay > 1) onSelectDay(selectedDay - 1);
  };

  const handleNext = () => {
    if (selectedDay < ITINERARY_DATA.length) onSelectDay(selectedDay + 1);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xs border-b border-slate-200/70 py-2.5 px-3">
      <div className="max-w-2xl mx-auto flex items-center gap-1.5">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          disabled={selectedDay === 1}
          aria-label="前一天"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Days Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {ITINERARY_DATA.map((day) => {
            const isSelected = day.dayNumber === selectedDay;

            return (
              <button
                key={day.dayNumber}
                data-day={day.dayNumber}
                onClick={() => onSelectDay(day.dayNumber)}
                className={`shrink-0 min-w-[72px] sm:min-w-[80px] py-1.5 px-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer text-center ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] text-white shadow-md shadow-blue-500/20 scale-[1.03] ring-2 ring-[#93C5FD]'
                    : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 border border-slate-200/80 active:scale-95'
                }`}
              >
                <div className="flex items-center gap-0.5 text-[11px] font-bold">
                  <span>Day {day.dayNumber}</span>
                  {isSelected && <Snowflake className="w-2.5 h-2.5 text-blue-200 inline" />}
                </div>
                <div
                  className={`text-[12px] font-bold ${
                    isSelected ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {day.date}
                </div>
                <div
                  className={`text-[10px] font-medium leading-tight ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {day.dayOfWeek}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          disabled={selectedDay === ITINERARY_DATA.length}
          aria-label="後一天"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
