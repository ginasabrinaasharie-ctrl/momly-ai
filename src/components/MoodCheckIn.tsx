import React from 'react';
import { Heart } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  subtitle: string;
  note: string;
}

interface MoodCheckInProps {
  lang: Language;
  selectedMood: MoodOption | null;
  onSelectMood: (mood: MoodOption) => void;
}

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({
  lang,
  selectedMood,
  onSelectMood,
}) => {
  const t = translations[lang];

  return (
    <div id="mood-section" className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-[#FDDDD8] shadow-sm mb-6 transition-all text-left">
      <div className="flex items-center justify-between gap-2.5 mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
          <span className="text-base shrink-0">🌙</span>
          <h3 className="text-xs sm:text-sm font-bold text-[#1C1228] leading-snug">
            {t.moodCheckInTitle}
          </h3>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEE8FF] text-[#6B5FA0] whitespace-nowrap shrink-0">
          {t.moodBadge}
        </span>
      </div>

      <p className="text-[11px] text-[#8B7FA0] mb-3 leading-relaxed">
        {t.moodCheckInSubtitle}
      </p>

      {/* Mood Selector Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 mb-3">
        {t.moods.map((mood) => {
          const isSelected = selectedMood?.id === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood)}
              className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border min-h-[64px] ${
                isSelected
                  ? 'bg-gradient-to-b from-[#FDDDD8] to-[#F5EEF8] border-[#F07B6B] shadow-xs scale-102 ring-2 ring-[#F07B6B]/30'
                  : 'bg-white hover:bg-[#FDDDD8]/20 border-slate-100 hover:border-[#FDDDD8]'
              }`}
            >
              <span className="text-xl sm:text-2xl mb-1 select-none">{mood.emoji}</span>
              <span
                className={`text-[9px] sm:text-[10px] font-semibold leading-tight text-center w-full hyphens-none tracking-tight ${
                  isSelected ? 'text-[#F07B6B]' : 'text-slate-600'
                }`}
              >
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reassuring Note from Momly */}
      {selectedMood && (
        <div className="p-3 rounded-2xl bg-[#EEE8FF]/70 border border-[#9B8EC4]/30 flex items-start gap-2 animate-in fade-in duration-300">
          <Heart className="w-3.5 h-3.5 text-[#F07B6B] shrink-0 mt-0.5 fill-[#F07B6B]" />
          <div className="text-[11px] text-[#2D2040] leading-relaxed">
            <span className="font-bold text-[#6B5FA0] block mb-0.5">
              {t.momlyWhisper}
            </span>
            {selectedMood.note}
          </div>
        </div>
      )}
    </div>
  );
};
