import React, { useState, useEffect } from 'react';
import {
  INITIAL_CHECKLIST,
  DRIVING_RULES,
  EMERGENCY_CONTACTS,
  ChecklistItem,
} from '../data/guideData';
import { ShimaEnagaSvg } from './ShimaEnagaSvg';
import {
  Car,
  CheckSquare,
  Square,
  PhoneCall,
} from 'lucide-react';

export const GuideTab: React.FC = () => {
  // Checklist local storage
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hokkaido_checklist_checked');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem('hokkaido_checklist_checked', JSON.stringify(checkedIds));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [checkedIds]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = ['all', ...Array.from(new Set(INITIAL_CHECKLIST.map((item) => item.category)))];
  const filteredChecklist =
    activeCategory === 'all'
      ? INITIAL_CHECKLIST
      : INITIAL_CHECKLIST.filter((item) => item.category === activeCategory);

  const completedCount = INITIAL_CHECKLIST.filter((i) => checkedIds.includes(i.id)).length;
  const progressPercent = Math.round((completedCount / INITIAL_CHECKLIST.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-28">
      {/* Intro Mascot Banner */}
      <div className="bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0F9FF] p-4 rounded-3xl border border-[#BFDBFE] flex items-center gap-3.5 shadow-xs">
        <div className="shrink-0">
          <ShimaEnagaSvg size={52} mood="happy" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
            雪道自駕 ＆ 行前全攻略
          </div>
          <h2 className="text-base font-bold text-slate-900">
            初次北海道雪季自駕不用慌！
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            掌握三不原則（不急踩、不急轉、不急煞），備妥防寒與行車裝備，安心享受 12 天夢幻雪國！
          </p>
        </div>
      </div>

      {/* Section 1: 雪道自駕安全守則 */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">雪道自駕安全五大鐵則</h3>
            <p className="text-xs text-slate-500">北海道自駕出發前必讀守則</p>
          </div>
        </div>

        <div className="space-y-3">
          {DRIVING_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-1.5"
            >
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1D4ED8] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-blue-700 font-medium mt-0.5">
                    {rule.summary}
                  </p>
                </div>
              </div>
              <ul className="pl-7 space-y-1 text-xs text-slate-600">
                {rule.rules.map((r, rIdx) => (
                  <li key={rIdx} className="list-disc list-outside leading-relaxed">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: 行李與裝備檢查清單 */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">雪季必備清單</h3>
              <p className="text-xs text-slate-500">
                完成進度：{completedCount} / {INITIAL_CHECKLIST.length} 項 ({progressPercent}%)
              </p>
            </div>
          </div>

          {/* Progress Mini Bar */}
          <div className="w-16 sm:w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => {
            const totalInCat =
              cat === 'all'
                ? INITIAL_CHECKLIST.length
                : INITIAL_CHECKLIST.filter((i) => i.category === cat).length;
            const checkedInCat =
              cat === 'all'
                ? INITIAL_CHECKLIST.filter((i) => checkedIds.includes(i.id)).length
                : INITIAL_CHECKLIST.filter(
                    (i) => i.category === cat && checkedIds.includes(i.id)
                  ).length;
            const isCatAllDone = totalInCat > 0 && checkedInCat === totalInCat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat === 'all' ? '全部項目' : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeCategory === cat
                      ? isCatAllDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/20 text-white'
                      : isCatAllDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {checkedInCat}/{totalInCat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Action Helper Bar */}
        <div className="flex items-center justify-between py-1.5 px-1 border-t border-slate-100 text-[11px] text-slate-500">
          <span>
            目前檢視：<strong>{activeCategory === 'all' ? '全部清單' : activeCategory}</strong>（
            {filteredChecklist.filter((i) => checkedIds.includes(i.id)).length} /{' '}
            {filteredChecklist.length} 完成）
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentCatIds = filteredChecklist.map((i) => i.id);
                const allSelected = currentCatIds.every((id) => checkedIds.includes(id));
                if (allSelected) {
                  setCheckedIds((prev) => prev.filter((id) => !currentCatIds.includes(id)));
                } else {
                  setCheckedIds((prev) => Array.from(new Set([...prev, ...currentCatIds])));
                }
              }}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-bold cursor-pointer hover:underline"
            >
              {filteredChecklist.every((i) => checkedIds.includes(i.id))
                ? '取消本類別全選'
                : '全選本類別'}
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100 mt-1">
          {filteredChecklist.map((item) => {
            const isChecked = checkedIds.includes(item.id);

            return (
              <label
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="flex items-start gap-3 py-2.5 px-1 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer select-none"
              >
                <div className="mt-0.5 text-[#2563EB] shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 fill-[#2563EB] text-white" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-medium ${
                      isChecked ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {item.text}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {item.category}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </section>



      {/* Section 4: 緊急聯絡與道路救援 */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">緊急救援與重要電話</h3>
            <p className="text-xs text-slate-500">遇到突發狀況時點擊即可撥打</p>
          </div>
        </div>

        <div className="space-y-2">
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  {contact.name}
                </div>
                <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {contact.note}
                </div>
              </div>

              <a
                href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.phone.split('/')[0].trim()}</span>
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
