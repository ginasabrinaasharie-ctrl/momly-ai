import React from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language, translations } from '../services/i18n.ts';

interface EmpathySummaryModalProps {
  summary: {
    headline: string;
    message: string;
    sentimentTag: string;
    tips: string[];
  } | null;
  onClose: () => void;
  lang: Language;
}

export const EmpathySummaryModal: React.FC<EmpathySummaryModalProps> = ({
  summary,
  onClose,
  lang,
}) => {
  if (!summary) return null;

  const t = translations[lang].loveLetter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1228]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#FDDDD8] overflow-hidden text-left">
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FDDDD8]/70 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#EEE8FF]/70 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Momly Avatar Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <MomlyAvatar size="md" pose="understanding" />
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDDDD8] text-[#F07B6B] border border-[#F07B6B]/20">
              <Sparkles className="w-3 h-3 text-[#F07B6B]" />
              {t.badge}
            </span>
          </div>
        </div>

        {/* Headline */}
        <h3 className="text-base sm:text-lg font-bold text-[#1C1228] leading-snug mb-2">
          {summary.headline}
        </h3>

        {/* Warm Message */}
        <p className="text-[#2D2040] text-xs sm:text-sm leading-relaxed bg-[#FDDDD8]/40 p-3.5 rounded-2xl border border-[#FDDDD8] mb-4 italic">
          "{summary.message}"
        </p>

        {/* Sentiment Tag */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#8B7FA0]">
            {t.reflectionTagLabel}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEE8FF] text-[#6B5FA0]">
            {summary.sentimentTag}
          </span>
        </div>

        {/* Actionable Gentle Tips */}
        {summary.tips && summary.tips.length > 0 && (
          <div className="space-y-2 mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8B7FA0]">
              {t.tipsTitle}
            </h4>
            <div className="space-y-1.5">
              {summary.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F07B6B] shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#F07B6B] to-[#F5A898] hover:opacity-95 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#F07B6B]/20 transition-all text-center cursor-pointer"
        >
          {t.buttonClose}
        </button>
      </div>
    </div>
  );
};
