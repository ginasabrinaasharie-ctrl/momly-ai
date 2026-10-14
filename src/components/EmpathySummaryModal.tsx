import React from 'react';
import { Heart, Sparkles, CheckCircle2, X } from 'lucide-react';

interface EmpathySummaryModalProps {
  summary: {
    headline: string;
    message: string;
    sentimentTag: string;
    tips: string[];
  } | null;
  onClose: () => void;
}

export const EmpathySummaryModal: React.FC<EmpathySummaryModalProps> = ({
  summary,
  onClose
}) => {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Icon */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              <Sparkles className="w-3 h-3" />
              Surat Cinta Sahabat Mama
            </span>
          </div>
        </div>

        {/* Headline */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug mb-3">
          {summary.headline}
        </h3>

        {/* Warm Message */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed bg-rose-50/60 p-4 rounded-2xl border border-rose-100/80 mb-6 italic">
          "{summary.message}"
        </p>

        {/* Sentiment Tag */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Refleksi Emosi:</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
            {summary.sentimentTag}
          </span>
        </div>

        {/* 3 Actionable Gentle Tips */}
        {summary.tips && summary.tips.length > 0 && (
          <div className="space-y-3 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Langkah Kecil untuk Nafas Bunda Hari Ini:
            </h4>
            <div className="space-y-2">
              {summary.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-[0.98] text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-200 transition-all text-center"
        >
          Terima Kasih Bunda Rina, Aku Merasa Lebih Baik 🌸
        </button>
      </div>
    </div>
  );
};
