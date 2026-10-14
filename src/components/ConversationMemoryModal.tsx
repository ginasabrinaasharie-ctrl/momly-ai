import { X, Trash2, Calendar } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';

export interface StoredMemory {
  id: string;
  timestamp: string;
  headline: string;
  message: string;
  sentimentTag: string;
  tips: string[];
}

interface ConversationMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: StoredMemory[];
  onClearMemories: () => void;
  lang: Language;
}

export const ConversationMemoryModal: React.FC<ConversationMemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onClearMemories,
  lang,
}) => {
  if (!isOpen) return null;

  const t = translations[lang].letters;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1228]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[85vh] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#FDDDD8] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-[#FDDDD8] text-[#F07B6B] flex items-center justify-center shrink-0 shadow-xs">
            💌
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1C1228]">
              {t.title}
            </h3>
            <p className="text-[10px] text-[#8B7FA0] leading-tight">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Memory List Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {memories.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EEE8FF] text-[#9B8EC4] flex items-center justify-center text-xl">
                🌸
              </div>
              <p className="text-xs font-bold text-slate-700">{t.emptyTitle}</p>
              <p className="text-[11px] text-[#8B7FA0] max-w-xs mx-auto">
                {t.emptyDesc}
              </p>
            </div>
          ) : (
            memories.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-[#FDFCFF] to-[#F8F5FF] border border-[#EEE8FF] shadow-xs hover:border-[#FDDDD8] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDDDD8] text-[#F07B6B]">
                    {item.sentimentTag}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-[#8B7FA0]">
                    <Calendar className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-[#1C1228] mb-1 leading-snug">
                  {item.headline}
                </h4>

                <p className="text-[11px] text-slate-600 italic bg-white/80 p-2.5 rounded-xl border border-slate-100 mb-2 leading-relaxed">
                  "{item.message}"
                </p>

                {item.tips && item.tips.length > 0 && (
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#9B8EC4]">
                      {t.reminderTitle}
                    </span>
                    <ul className="text-[10px] text-slate-600 space-y-0.5 list-disc list-inside">
                      {item.tips.map((tipText, idx) => (
                        <li key={idx}>{tipText}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {memories.length > 0 && (
            <button
              onClick={onClearMemories}
              className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.clearAll}</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-xl bg-[#F07B6B] hover:bg-[#D95D4D] text-white text-[11px] font-semibold shadow-xs transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
