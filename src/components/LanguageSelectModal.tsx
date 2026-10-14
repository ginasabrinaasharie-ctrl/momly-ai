import React from 'react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language, translations } from '../services/i18n.ts';

interface LanguageSelectModalProps {
  isOpen: boolean;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onClose: () => void;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({
  isOpen,
  currentLang,
  onSelectLang,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang].languageModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1228]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#FDDDD8] text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FDDDD8]/60 rounded-full blur-2xl pointer-events-none" />

        <MomlyAvatar size="md" className="mx-auto mb-3" />

        <h3 className="text-base sm:text-lg font-bold text-[#1C1228] mb-1">
          {t.title}
        </h3>
        <p className="text-xs text-[#8B7FA0] mb-5 leading-relaxed">
          {t.subtitle}
        </p>

        <div className="space-y-2.5 mb-6 text-left">
          {/* English Option */}
          <button
            onClick={() => onSelectLang('en')}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'bg-gradient-to-r from-[#FDDDD8]/60 to-[#EEE8FF]/40 border-[#F07B6B] ring-2 ring-[#F07B6B]/30'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇺🇸</span>
              <div>
                <p className="text-xs font-bold text-[#1C1228]">English</p>
                <p className="text-[10px] text-[#8B7FA0]">Default Global Language</p>
              </div>
            </div>
            {currentLang === 'en' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#F07B6B]" />
            )}
          </button>

          {/* Indonesian Option */}
          <button
            onClick={() => onSelectLang('id')}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
              currentLang === 'id'
                ? 'bg-gradient-to-r from-[#FDDDD8]/60 to-[#EEE8FF]/40 border-[#F07B6B] ring-2 ring-[#F07B6B]/30'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🇮🇩</span>
              <div>
                <p className="text-xs font-bold text-[#1C1228]">Bahasa Indonesia</p>
                <p className="text-[10px] text-[#8B7FA0]">Logat & Sapaan Hangat Mama</p>
              </div>
            </div>
            {currentLang === 'id' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#F07B6B]" />
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F07B6B] to-[#F5A898] hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-[#F07B6B]/20 transition-all cursor-pointer"
        >
          {t.confirm}
        </button>
      </div>
    </div>
  );
};
