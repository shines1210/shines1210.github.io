import React, { useState, useRef } from 'react';
import { ITINERARY_DATA } from '../data/itineraryData';
import { INITIAL_CHECKLIST } from '../data/guideData';
import { DiaryPhoto } from '../types';
import { ShimaEnagaSvg } from './ShimaEnagaSvg';
import {
  Download,
  FileJson,
  FileText,
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Camera,
  HardDrive,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  FileCode,
} from 'lucide-react';

interface SettingsTabProps {
  completedSpotIds: string[];
  photos: DiaryPhoto[];
  onRestoreData: (completedSpots: string[], photos: DiaryPhoto[]) => void;
  onClearPhotos: () => void;
  onResetCompletedSpots: () => void;
  onClearAll: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  completedSpotIds,
  photos,
  onRestoreData,
  onClearPhotos,
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

  // Estimate storage usage in KB
  const photosStorageBytes = JSON.stringify(photos).length * 2;
  const photosStorageKB = Math.round(photosStorageBytes / 1024);

  const showNotification = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  // 1. Download as JSON
  const handleExportJSON = () => {
    const exportData = {
      app: 'Hokkaido Snow Season Roadtrip 12Days',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      exportDateFormatted: new Date().toLocaleString('zh-TW'),
      stats: {
        totalSpots: totalCount,
        completedSpotsCount: completedCount,
        progressPercent: `${progressPercent}%`,
        photosCount: photos.length,
      },
      completedSpotIds,
      completedSpotsDetails: completedSpotsList.map((spot) => {
        // find which day this spot belongs to
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
      photos: photos.map((p) => ({
        id: p.id,
        dayNumber: p.dayNumber,
        spotId: p.spotId,
        spotName: p.spotName,
        dateStr: p.dateStr,
        caption: p.caption,
        imageUrl: p.imageUrl,
      })),
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

    showNotification('✓ JSON 完整備份檔已成功下載！');
  };

  // 2. Download as Formatted Plain Text / Markdown Journal
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
    text += `完成進度：${completedCount} / ${totalCount} 個景點 (${progressPercent}%)\n`;
    text += `照片紀錄：共 ${photos.length} 張旅記相片\n`;
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
        const spotPhotos = photos.filter((p) => p.spotId === spot.id);
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

        if (spotPhotos.length > 0) {
          text += `   📸 拍立得照片：${spotPhotos.length} 張\n`;
          spotPhotos.forEach((p, pIdx) => {
            text += `      (${pIdx + 1}) [${p.dateStr}] ${p.caption ? `心得：「${p.caption}」` : '（未填寫文字）'}\n`;
          });
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

  // 3. Download standalone HTML with embedded photos
  const handleExportHTML = () => {
    const timestamp = new Date().toLocaleDateString('zh-TW');

    let html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>北海道雪季自由行 12Days 旅程寫真備忘錄</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f4f8; color: #1e293b; padding: 20px; max-width: 800px; margin: 0 auto; }
  h1 { color: #1d4ed8; font-size: 24px; border-bottom: 2px solid #93c5fd; padding-bottom: 8px; }
  .summary { background: white; padding: 16px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .day-card { background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .day-title { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 8px; }
  .spot { padding: 10px 0; border-top: 1px solid #f1f5f9; }
  .badge-done { background: #dcfce7; color: #15803d; font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: bold; }
  .badge-todo { background: #f1f5f9; color: #64748b; font-size: 11px; padding: 2px 8px; border-radius: 12px; }
  .photo-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
  .photo-box { background: #fafaf9; border: 1px solid #e7e5e4; padding: 8px; border-radius: 12px; width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
  .photo-box img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; }
  .caption { font-size: 12px; color: #475569; margin-top: 6px; font-style: italic; }
</style>
</head>
<body>
<h1>❄️ 北海道雪季自由行 12Days 旅程紀實備份</h1>
<div class="summary">
  <p><strong>匯出時間：</strong>${timestamp}</p>
  <p><strong>景點打卡進度：</strong>${completedCount} / ${totalCount} 個站點 (${progressPercent}%)</p>
  <p><strong>照片數量：</strong>${photos.length} 張旅記照片</p>
</div>
`;

    ITINERARY_DATA.forEach((day) => {
      html += `<div class="day-card">
  <div class="day-title">Day ${day.dayNumber} · ${day.date} (${day.dayOfWeek}) - ${day.title}</div>
  <p style="font-size: 13px; color: #64748b;">📍 ${day.area} | 🚗 ${day.routeHighlight}</p>
`;

      day.spots.forEach((spot) => {
        const isDone = completedSpotIds.includes(spot.id);
        const spotPhotos = photos.filter((p) => p.spotId === spot.id);

        html += `  <div class="spot">
    <div>
      <span class="${isDone ? 'badge-done' : 'badge-todo'}">${isDone ? '✓ 已打卡' : '未打卡'}</span>
      <strong>${spot.time} ${spot.name}</strong> <span style="font-size: 12px; color: #94a3b8;">${spot.nameJa || ''}</span>
    </div>
    <div style="font-size: 12px; color: #475569; margin-top: 4px;">${spot.description}</div>
`;

        if (spotPhotos.length > 0) {
          html += `    <div class="photo-grid">\n`;
          spotPhotos.forEach((p) => {
            html += `      <div class="photo-box">
        <img src="${p.imageUrl}" alt="${p.spotName}">
        <div class="caption">${p.caption || '（照片隨筆記錄）'}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${p.dateStr}</div>
      </div>\n`;
          });
          html += `    </div>\n`;
        }

        html += `  </div>\n`;
      });

      html += `</div>\n`;
    });

    html += `</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hokkaido-trip-album-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('✓ 離線 HTML 寫真備份檔已成功下載！');
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

        if (Array.isArray(parsed.completedSpotIds) && Array.isArray(parsed.photos)) {
          onRestoreData(parsed.completedSpotIds, parsed.photos);
          setImportStatus('✓ 備份檔案已成功還原！已同步至 App。');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('⚠️ 檔案格式不符合備份檔規格，請確認是否為本 App 匯出的 JSON 檔案。');
        }
      } catch (err) {
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
            將已打卡的行程清單與隨手拍攝的雪景照片打包封存
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
              <h3 className="text-base font-bold text-slate-900">目前本機儲存統計</h3>
              <p className="text-xs text-slate-500">記錄保存在您的手機瀏覽器中</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
            約 {photosStorageKB} KB
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">已完成打卡景點</div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 tabular-nums mt-0.5">
              {completedCount} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">上傳旅記相片</div>
            <div className="text-lg sm:text-xl font-black text-[#2563EB] tabular-nums mt-0.5">
              {photos.length} <span className="text-xs font-normal text-slate-400">張</span>
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
                包含已勾選完成的景點狀態、詳細時間、所有上傳的照片及心得文字，可供未來隨時還原。
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
                文字旅記日記純文字檔 (.txt)
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                排版整齊的易讀純文字報告，條列已造訪景點、時間、打卡狀態與旅遊心得，適合列印或存入筆記。
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

        {/* Option 3: Offline Standalone HTML Album */}
        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                離線圖文寫真相簿網頁 (.html)
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                單一 HTML 檔案，所有照片已直接內嵌，不需網路即可在任何電腦或手機瀏覽器離線閱讀寫真相簿。
              </p>
            </div>
          </div>

          <button
            onClick={handleExportHTML}
            className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>下載 .HTML</span>
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
          若您先前有下載過 <code>.json</code> 備份檔，點擊下方即可上傳檔案還原已完成打卡與旅記相片。
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
            <p className="text-xs text-slate-500">注意：清除前請記得先備份資料</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Reset Completed Spots */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">重置景點打卡狀態</div>
              <div className="text-[11px] text-slate-500">保留照片，將所有景點恢復為未拜訪</div>
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

          {/* Clear Photos */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">清除所有上傳相片 ({photos.length} 張)</div>
              <div className="text-[11px] text-slate-500">釋放瀏覽器儲存空間</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`確定要刪除所有 ${photos.length} 張旅記照片嗎？此操作不可逆，請先下載備份！`)) {
                  onClearPhotos();
                  showNotification('已清空所有旅記相片');
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-100 border border-rose-300 cursor-pointer"
            >
              清空相片
            </button>
          </div>

          {/* Reset Everything */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div>
              <div className="text-xs font-bold text-rose-900">完全恢復原廠預設</div>
              <div className="text-[11px] text-rose-700">清空打卡、照片與行李清單紀錄</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('⚠️ 警告：這將會清除您在此裝置的所有旅遊打卡、相片與自訂紀錄，確定要重置嗎？')) {
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
