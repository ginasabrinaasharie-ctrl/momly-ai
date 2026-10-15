import { Calendar } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { StoredMemory } from './ConversationMemoryModal.tsx';

interface LettersViewProps {
  memories: StoredMemory[];
  onClearMemories: () => void;
  lang: Language;
}

export const LettersView: React.FC<LettersViewProps> = ({
  memories,
  onClearMemories,
  lang,
}) => {
  const t = translations[lang].letters;

  return (
    <main className="flex-1 px-4 py-6 flex flex-col text-left overflow-y-auto pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1C1228] flex items-center gap-1.5">
            <span>{t.title}</span>
            <span className="text-sm">💌</span>
          </h2>
          <p className="text-[11px] text-[#8B7FA0] leading-snug">
            {t.subtitle}
          </p>
        </div>
        {memories.length > 0 && (
          <button
            onClick={onClearMemories}
            className="text-[11px] text-rose-500 hover:text-rose-700 cursor-pointer shrink-0 ml-2"
          >
            {t.clearAll}
          </button>
        )}
      </div>

      {/* Letters List or Empty State */}
      {memories.length === 0 ? (
        <div className="my-auto py-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#EEE8FF] text-[#9B8EC4] flex items-center justify-center text-2xl shadow-xs">
            💌
          </div>
          <p className="text-xs font-bold text-slate-700">{t.emptyTitle}</p>
          <p className="text-[11px] text-[#8B7FA0] max-w-xs mx-auto leading-relaxed">
            {t.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-gradient-to-b from-[#FDFCFF] to-[#F8F5FF] border border-[#EEE8FF] shadow-xs space-y-2.5 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDDDD8] text-[#F07B6B]">
                  {item.sentimentTag}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.timestamp}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#1C1228] leading-snug">
                {item.headline}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{item.message}"
              </p>

              {item.tips && item.tips.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-[#6B5FA0] block mb-1">
                    {t.reminderTitle}
                  </span>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                    {item.tips.map((tipText, idx) => (
                      <li key={idx} className="leading-snug">
                        {tipText}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
