import React, { useState, useRef } from 'react';
import { ITINERARY_DATA } from '../data/itineraryData';
import { INITIAL_CHECKLIST } from '../data/guideData';
import { ShimaEnagaSvg } from './ShimaEnagaSvg';
import {
  Download,
  FileJson,
  FileText,
  Upload,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface SettingsTabProps {
  completedSpotIds: string[];
  onRestoreData: (completedSpots: string[]) => void;
  onResetCompletedSpots: () => void;
  onClearAll: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  completedSpotIds,
  onRestoreData,
  onResetCompletedSpots,
  onClearAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Calculate statistics
  const allSpots = ITINERARY_DATA.flatMap((d) => d.spots);
  const completedSpotsList = allSpots.filter((s) => completedSpotIds.includes(s.id));
  const completedCount = completedSpotsList.length;
  const totalCount = allSpots.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Checklist statistics
  let checkedCount = 0;
  try {
    const savedChecklist = localStorage.getItem('hokkaido_checklist_checked');
    if (savedChecklist) {
      const parsed = JSON.parse(savedChecklist);
      if (Array.isArray(parsed)) checkedCount = parsed.length;
    }
  } catch {
    checkedCount = 0;
  }

  const showNotification = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  // 1. Download as JSON
  const handleExportJSON = () => {
    let checkedList: string[] = [];
    try {
      const savedChecklist = localStorage.getItem('hokkaido_checklist_checked');
      if (savedChecklist) checkedList = JSON.parse(savedChecklist);
    } catch {
      checkedList = [];
    }

    const exportData = {
      app: 'Hokkaido Snow Season Roadtrip 12Days',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      exportDateFormatted: new Date().toLocaleString('zh-TW'),
      stats: {
        totalSpots: totalCount,
        completedSpotsCount: completedCount,
        progressPercent: `${progressPercent}%`,
        checklistTotal: INITIAL_CHECKLIST.length,
        checklistCompleted: checkedList.length,
      },
      completedSpotIds,
      completedSpotsDetails: completedSpotsList.map((spot) => {
        const day = ITINERARY_DATA.find((d) => d.spots.some((s) => s.id === spot.id));
        return {
          dayNumber: day?.dayNumber,
          date: day?.date,
          area: day?.area,
          time: spot.time,
          duration: spot.duration,
          name: spot.name,
          nameJa: spot.nameJa,
          category: spot.category,
          tags: spot.tags.map((t) => t.label),
        };
      }),
      checkedChecklistIds: checkedList,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `hokkaido-trip-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('✓ JSON 行程紀錄備份檔已成功下載！');
  };

  // 2. Download as Formatted Plain Text
  const handleExportText = () => {
    const timestamp = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    let text = `========================================================\n`;
    text += `❄️ 北海道雪季自由行 12Days｜個人旅程紀實備忘錄\n`;
    text += `========================================================\n`;
    text += `匯出時間：${timestamp}\n`;
    text += `景點打卡進度：${completedCount} / ${totalCount} 個景點 (${progressPercent}%)\n`;
    text += `--------------------------------------------------------\n\n`;

    ITINERARY_DATA.forEach((day) => {
      text += `【Day ${day.dayNumber}（${day.date} ${day.dayOfWeek}）：${day.title}】\n`;
      text += `📍 地區：${day.area}\n`;
      text += `🚗 動線：${day.routeHighlight}\n`;
      if (day.hotel) {
        text += `🏨 住宿：${day.hotel.name}（${day.hotel.address}）\n`;
      }
      text += `❄️ 雪況提示：${day.snowTip.title}（氣溫：${day.snowTip.tempRange}，結冰：${day.snowTip.freezeLevel}）\n`;
      text += `--- 當日站點 ---\n`;

      day.spots.forEach((spot, idx) => {
        const isDone = completedSpotIds.includes(spot.id);
        const checkMark = isDone ? '[✓ 已造訪]' : '[ ] 未標記';

        text += `${checkMark} ${idx + 1}. ${spot.time} ${spot.name}`;
        if (spot.nameJa) text += ` (${spot.nameJa})`;
        text += ` · ${spot.duration}\n`;
        text += `   類別：${spot.category} | 導航查詢：${spot.mapQuery}\n`;
        text += `   停車：${spot.parkingInfo}\n`;
        text += `   加油：${spot.gasInfo}\n`;

        if (spot.tags.length > 0) {
          text += `   標籤：${spot.tags.map((t) => t.label).join('、')}\n`;
        }
        text += `\n`;
      });
      text += `\n`;
    });

    try {
      const savedChecklist = localStorage.getItem('hokkaido_checklist_checked');
      const checkedList: string[] = savedChecklist ? JSON.parse(savedChecklist) : [];
      if (INITIAL_CHECKLIST.length > 0) {
        text += `========================================================\n`;
        text += `📋 行李必備打包清單（共 ${INITIAL_CHECKLIST.length} 項，已完成 ${checkedList.length} 項）\n`;
        text += `========================================================\n\n`;
        const categories = Array.from(new Set(INITIAL_CHECKLIST.map((i) => i.category)));
        categories.forEach((cat) => {
          const itemsInCat = INITIAL_CHECKLIST.filter((i) => i.category === cat);
          const checkedInCat = itemsInCat.filter((i) => checkedList.includes(i.id)).length;
          text += `【${cat}】(${checkedInCat}/${itemsInCat.length})\n`;
          itemsInCat.forEach((item) => {
            const isChecked = checkedList.includes(item.id);
            text += `  ${isChecked ? '[✓]' : '[ ]'} ${item.text}\n`;
          });
          text += `\n`;
        });
      }
    } catch {
      // ignore
    }

    text += `========================================================\n`;
    text += `北海道雪季自駕回憶 · 祝行車平安、旅途愉快！\n`;
    text += `========================================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `hokkaido-trip-journal-${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('✓ 文字旅記摘要 (.txt) 已成功下載！');
  };

  // Restore from JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed.completedSpotIds)) {
          onRestoreData(parsed.completedSpotIds);

          if (Array.isArray(parsed.checkedChecklistIds)) {
            try {
              localStorage.setItem(
                'hokkaido_checklist_checked',
                JSON.stringify(parsed.checkedChecklistIds)
              );
            } catch {
              // ignore
            }
          }

          setImportStatus('✓ 備份檔案已成功還原！已同步景點打卡狀態。');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('⚠️ 檔案格式不符合備份檔規格，請確認是否為本 App 匯出的 JSON 檔案。');
        }
      } catch {
        setImportStatus('❌ 檔案解析失敗，請確認檔案內容正確。');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-28">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0F9FF] p-4 rounded-3xl border border-[#BFDBFE] flex items-center justify-between gap-3 shadow-xs">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trip Data & Backup</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            旅程紀錄備份與下載
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            將已造訪景點進度與行程打包封存為 JSON 或文字檔
          </p>
        </div>
        <div className="shrink-0">
          <ShimaEnagaSvg size={50} mood="happy" />
        </div>
      </div>

      {/* Status Notice Toast */}
      {downloadNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-300 text-blue-900 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Trip Statistics Card */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">目前本機旅程統計</h3>
              <p className="text-xs text-slate-500">記錄安全保存在您的手機瀏覽器中</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
            達成率 {progressPercent}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">已完成景點</div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 tabular-nums mt-0.5">
              {completedCount} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">行李清單勾選</div>
            <div className="text-lg sm:text-xl font-black text-[#2563EB] tabular-nums mt-0.5">
              {checkedCount} <span className="text-xs font-normal text-slate-400">/ {INITIAL_CHECKLIST.length}</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">全趟行程達成率</div>
            <div className="text-lg sm:text-xl font-black text-amber-600 tabular-nums mt-0.5">
              {progressPercent}%
            </div>
          </div>
        </div>
      </section>

      {/* Export / Download Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 mb-1 pb-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">打包下載與備份</h3>
            <p className="text-xs text-slate-500">選擇適合您的備份檔案格式</p>
          </div>
        </div>

        {/* Option 1: JSON Full Backup */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>JSON 完整打包備份檔</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-md">
                  推薦備份
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                包含已勾選完成的景點狀態、詳細時間與行李打包進度，可供未來隨時還原至 App。
              </p>
            </div>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>下載 .JSON</span>
          </button>
        </div>

        {/* Option 2: Plain Text / Markdown Journal */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                文字行程清單純文字檔 (.txt)
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                排版整齊的易讀純文字報告，條列已造訪景點、時間、導航關鍵字與行李清單，適合列印或存入筆記。
              </p>
            </div>
          </div>

          <button
            onClick={handleExportText}
            className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>下載 .TXT</span>
          </button>
        </div>
      </section>

      {/* Restore Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">還原先前備份</h3>
            <p className="text-xs text-slate-500">換手機或更換瀏覽器時可匯入還原</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 mb-3 leading-relaxed">
          若您先前有下載過 <code>.json</code> 備份檔，點擊下方即可上傳檔案還原已完成打卡進度。
        </div>

        <label className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-bold text-emerald-800">
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>選擇 JSON 備份檔進行還原...</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </label>
      </section>

      {/* Data Management / Cleanup Section */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">資料重置與清理</h3>
            <p className="text-xs text-slate-500">清除前請確認已完成下載備份</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Reset Completed Spots */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">重置景點打卡狀態</div>
              <div className="text-[11px] text-slate-500">將所有 12 天景點恢復為未打卡</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('確定要清除所有已勾選的景點打卡紀錄嗎？')) {
                  onResetCompletedSpots();
                  showNotification('已重置所有景點打卡狀態');
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 cursor-pointer"
            >
              重置打卡
            </button>
          </div>

          {/* Reset Everything */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div>
              <div className="text-xs font-bold text-rose-900">完全恢復預設值</div>
              <div className="text-[11px] text-rose-700">清空景點打卡與行李清單紀錄</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('⚠️ 警告：這將會清除您在此裝置的所有旅遊打卡與行李清單紀錄，確定要重置嗎？')) {
                  onClearAll();
                  showNotification('已重置為全新狀態');
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              全部清空
            </button>
          </div>
        </div>
      </section>

      {/* App Version Info */}
      <div className="text-center text-xs text-slate-400 pt-2 space-y-1">
        <div>北海道雪季自由行 12Days · 繞半圈隨身導覽 App</div>
        <div className="text-[11px]">版本 v1.2.0 · 支援離線瀏覽與資料備份</div>
      </div>
    </div>
  );
};
