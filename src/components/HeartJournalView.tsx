import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { JournalEntry } from '../types/journal.ts';
import { JournalModal } from './JournalModal.tsx';

interface HeartJournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  lang: Language;
}

export const HeartJournalView: React.FC<HeartJournalViewProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  onClearAll,
  lang,
}) => {
  const t = translations[lang].journal;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex-1 px-4 py-6 flex flex-col text-left overflow-y-auto pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1C1228] flex items-center gap-1.5">
            <span>{t.title}</span>
            <span className="text-sm">🌸</span>
          </h2>
          <p className="text-[11px] text-[#8B7FA0] leading-snug">
            {t.subtitle}
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] text-rose-500 hover:text-rose-700 cursor-pointer shrink-0 ml-2"
          >
            {t.clearAll}
          </button>
        )}
      </div>

      {/* Primary Action Button: Add New Entry */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-3.5 px-4 mb-4 rounded-2xl bg-gradient-to-r from-[#F07B6B] to-[#F5A898] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#F07B6B]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>{t.newEntryButton}</span>
      </button>

      {/* Entries List or Empty State */}
      {entries.length === 0 ? (
        <div className="my-auto py-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#EEE8FF] text-[#9B8EC4] flex items-center justify-center text-2xl shadow-xs">
            📖
          </div>
          <p className="text-xs font-bold text-slate-700">{t.emptyTitle}</p>
          <p className="text-[11px] text-[#8B7FA0] max-w-xs mx-auto leading-relaxed">
            {t.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-gradient-to-b from-[#FDFCFF] to-[#F8F5FF] border border-[#EEE8FF] shadow-xs space-y-3 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.moodEmoji || '🌸'}</span>
                  <span className="text-[11px] font-bold text-slate-700">
                    {item.dateFormatted}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#EEE8FF] text-[#6B5FA0]">
                    {item.inputMethod === 'quick' && (lang === 'id' ? '⚡ Tinggal Pilih' : '⚡ Quick Tap')}
                    {item.inputMethod === 'voice' && (lang === 'id' ? '🎙️ Suara' : '🎙️ Voice')}
                    {item.inputMethod === 'text' && (lang === 'id' ? '✍️ Tulis' : '✍️ Written')}
                  </span>
                  <button
                    onClick={() => onDeleteEntry(item.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer p-1"
                    title="Hapus catatan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Gratitude Section */}
              {item.gratitude.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#F07B6B] uppercase tracking-wider block mb-1">
                    🌻 {t.gratitudeSection}
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {item.gratitude.map((g, idx) => (
                      <li key={idx} className="leading-snug">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Micro-Wins Section */}
              {item.microWins.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#6B5FA0] uppercase tracking-wider block mb-1">
                    🏆 {t.winsSection}
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {item.microWins.map((w, idx) => (
                      <li key={idx} className="leading-snug">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Momly AI Warm Validation Bubble */}
              {item.aiValidationNote && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF5F3] to-[#F8F5FF] border border-[#FDDDD8] text-slate-800 text-xs italic leading-relaxed relative">
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs shrink-0 mt-0.5">💌</span>
                    <div>
                      <p className="font-medium text-[11px] text-slate-700">
                        "{item.aiValidationNote}"
                      </p>
                      <span className="text-[9px] text-[#F07B6B] font-bold not-italic mt-0.5 block">
                        — Momly
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Journal Entry Modal */}
      <JournalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveEntry={onAddEntry}
        lang={lang}
      />
    </main>
  );
};
