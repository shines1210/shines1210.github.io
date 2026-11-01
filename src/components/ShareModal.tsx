import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Share2, Smartphone, Sparkles, Send } from 'lucide-react';
import { ShimaEnagaSvg } from './ShimaEnagaSvg';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Fallback to shared URL or current location
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-jaoyywwk6ssdfm2k3g45ju-800085840605.asia-northeast1.run.app';

  const handleCopy = () => {
    navigator.clipboard?.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '北海道雪季自由行 12Days 行程隨身導覽',
          text: '這是我做的北海道 12 天雪季繞半圈行程隨身 App，裡面有精確動線、Google Maps 導航、停車加油情報與每日雪況提示！',
          url: appUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md p-5 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="關閉"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE] flex items-center justify-center shrink-0">
            <ShimaEnagaSvg size={32} mood="happy" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
              Share With Friends
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              傳送給同行旅伴
            </h3>
          </div>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1">
          {/* QR Code Container */}
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center">
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-200/90 inline-block mb-2">
              <QRCodeSVG
                value={appUrl}
                size={160}
                level="M"
                includeMargin={false}
                imageSettings={{
                  src: '',
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              請朋友打開手機相機掃描 QR Code 即可立即開啟！
            </p>
          </div>

          {/* URL Copy Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">專屬分享網址：</label>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full bg-transparent text-xs text-slate-600 font-mono focus:outline-hidden px-1 select-all truncate"
              />
              <button
                onClick={handleCopy}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[36px] ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已複製</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Share to LINE / Mobile Sheet */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>透過 LINE / 通訊軟體分享給旅伴</span>
          </button>

          {/* Tip: Add to Home Screen like a native App */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1 leading-relaxed">
            <div className="font-bold flex items-center gap-1 text-amber-950">
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span>小秘笈：如何像 App 一樣加入手機桌面？</span>
            </div>
            <ul className="pl-4 list-disc space-y-0.5 text-[11px] text-amber-900/90">
              <li>
                <strong>iPhone (Safari)</strong>：點擊底部的「分享按鈕（方形箭頭）」➔ 選擇「加入主畫面」。
              </li>
              <li>
                <strong>Android (Chrome)</strong>：點擊右上角「三個點」➔ 選擇「安裝應用程式」或「新增至主畫面」。
              </li>
            </ul>
            <p className="text-[10px] text-amber-700/80 pt-0.5">
              加到桌面後點開就像原生 App 一樣全螢幕運作，自駕導航超順手！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
