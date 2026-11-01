import React, { useState } from 'react';
import { DiaryPhoto } from '../types';
import { X, Trash2, Calendar, MapPin, Save, Heart } from 'lucide-react';

interface PhotoModalProps {
  photo: DiaryPhoto | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, newCaption: string) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  onClose,
  onDelete,
  onUpdateCaption,
}) => {
  if (!photo) return null;

  const [caption, setCaption] = useState(photo.caption || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdateCaption(photo.id, caption);
    setIsEditing(false);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="關閉"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Polaroid Japanese Style Photo Container */}
        <div className="p-4 sm:p-5 bg-[#FAFAF9]">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src={photo.imageUrl}
                alt={photo.caption || '旅記照片'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Polaroid bottom caption strip */}
            <div className="mt-3 px-1">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <div className="flex items-center gap-1 font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span className="truncate max-w-[180px]">
                    {photo.spotName || `Day ${photo.dayNumber} 旅程`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{photo.dateStr}</span>
                </div>
              </div>

              {/* Caption or Edit Input */}
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="寫下這份雪國記憶（例如：超好吃、雪好大、企鵝好萌...）"
                    rows={3}
                    className="w-full text-xs sm:text-sm p-2 rounded-xl border border-[#93C5FD] focus:outline-hidden focus:ring-2 focus:ring-[#3B82F6] bg-white text-slate-800 resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>儲存心得</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className="mt-2 p-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-dashed border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group"
                  title="點擊編輯文字"
                >
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    {caption || (
                      <span className="text-slate-400 not-italic">
                        ✍️ 點擊這裡加入這張照片的旅遊心得記錄...
                      </span>
                    )}
                  </p>
                </div>
              )}

              {isSavedNotice && (
                <div className="mt-1 text-center text-[11px] text-emerald-600 font-bold">
                  ✓ 心得已成功保存！
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('確定要刪除這張旅記照片嗎？')) {
                onDelete(photo.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>刪除此照片</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            返回行程
          </button>
        </div>
      </div>
    </div>
  );
};
