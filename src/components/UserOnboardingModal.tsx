import React, { useState } from 'react';
import { Sparkles, Heart, X, ShieldAlert } from 'lucide-react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language } from '../services/i18n.ts';
import { resolveCrisisRegion } from '../services/safetyGuard.ts';

interface UserOnboardingModalProps {
  currentName: string;
  onSaveName: (name: string) => void;
  onClose?: () => void;
  lang: Language;
  isInitialSetup?: boolean;
}

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({
  currentName,
  onSaveName,
  onClose,
  lang,
  isInitialSetup = false,
}) => {
  const [nameInput, setNameInput] = useState(currentName);
  const [countryOverride, setCountryOverride] = useState<string>(() => {
    return localStorage.getItem('momly_country_override') || 'AUTO';
  });

  const autoDetected = resolveCrisisRegion({ userCountryOverride: '' });
  const detectedLabel =
    {
      ID: '🇮🇩 Indonesia',
      IN: '🇮🇳 India',
      US_CA: '🇺🇸 US & Canada',
      UK: '🇬🇧 UK & Ireland',
      AU: '🇦🇺 Australia & NZ',
      GLOBAL: '🌐 Global',
    }[autoDetected.region] || '🌐 Global';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (countryOverride === 'AUTO') {
      localStorage.removeItem('momly_country_override');
    } else {
      localStorage.setItem('momly_country_override', countryOverride);
    }
    const clean = nameInput.trim();
    if (clean) {
      onSaveName(clean);
    } else {
      onSaveName('');
    }
  };

  const isIndonesian = lang === 'id';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1228]/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#FDDDD8] overflow-hidden text-center">
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FDDDD8]/80 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#EEE8FF]/80 rounded-full blur-2xl pointer-events-none" />

        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Momly Avatar */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#F07B6B] to-[#F5A898] shadow-lg shadow-[#F07B6B]/20 mb-2">
            <MomlyAvatar size="lg" pose="winking" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FDDDD8] text-[#F07B6B] border border-[#F07B6B]/20">
            <Heart className="w-3 h-3 fill-[#F07B6B]" />
            <span>{isIndonesian ? 'Teman Curhat Terbaikmu' : 'Your Safe Sanctuary'}</span>
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C1228] mb-1.5 tracking-tight">
          {isInitialSetup
            ? isIndonesian
              ? 'Kenalan Dulu Yuk! 🌸'
              : "Let's Get to Know You! 🌸"
            : isIndonesian
            ? 'Profil & Preferensi Mama 🌸'
            : 'Mama Profile & Settings 🌸'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed max-w-xs mx-auto">
          {isInitialSetup
            ? isIndonesian
              ? 'Biar Momly bisa menyapa dan mendengarkan ceritamu layaknya sahabat karib, siapa nama panggilan Mama?'
              : "So Momly can greet you warmly like your true lifelong bestie, what's your nickname?"
            : isIndonesian
            ? 'Atur nama panggilan dan wilayah layanan darurat agar Momly selalu siap mendampingi Mama dengan aman.'
            : 'Set your preferred nickname and crisis emergency region so Momly can accompany you safely.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">
              {isIndonesian ? 'Nama Panggilan Mama' : "Mama's Nickname"}
            </label>
            <input
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={isIndonesian ? 'Nama Panggilan (contoh: Gina)' : 'Your Nickname (e.g., Gina)'}
              maxLength={25}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#FDDDD8] focus:border-[#F07B6B] bg-[#FFF8F2]/60 text-sm font-semibold text-[#1C1228] placeholder-slate-400 outline-none transition-all shadow-inner text-center"
            />
          </div>

          {/* Emergency Crisis Region Setting */}
          <div className="text-left space-y-1.5 pt-1">
            <label className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F07B6B]" />
                {isIndonesian ? 'Wilayah Layanan Darurat' : 'Crisis Emergency Region'}
              </span>
              <span className="text-[10px] font-normal text-slate-500">
                {countryOverride === 'AUTO' ? `(Auto: ${detectedLabel})` : '(Manual)'}
              </span>
            </label>

            <select
              value={countryOverride}
              onChange={(e) => setCountryOverride(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[#FDDDD8] focus:border-[#F07B6B] bg-[#FFF8F2]/60 text-xs font-semibold text-[#1C1228] outline-none transition-all cursor-pointer"
            >
              <option value="AUTO">
                {isIndonesian
                  ? `🌐 Otomatis (Saat ini: ${detectedLabel})`
                  : `🌐 Automatic (Currently: ${detectedLabel})`}
              </option>
              <option value="ID">🇮🇩 Indonesia (112, SEJIWA 119 ext 8, Pulih)</option>
              <option value="IN">🇮🇳 India (112 ERSS, Tele-MANAS 14416, KIRAN)</option>
              <option value="US_CA">🇺🇸 United States & Canada (988, 911)</option>
              <option value="UK">🇬🇧 United Kingdom (999, Samaritans 116 123)</option>
              <option value="AU">🇦🇺 Australia & New Zealand (000, Lifeline 13 11 14)</option>
              <option value="GLOBAL">🌐 Universal Global (GSM 112/911, findahelpline)</option>
            </select>

            <p className="text-[10px] text-slate-500 leading-tight">
              {isIndonesian
                ? 'Menentukan nomor hotline darurat & bantuan profesional jika terjadi situasi krisis.'
                : 'Selects the localized emergency helplines & crisis dispatch during urgent distress.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F07B6B] via-[#F5A898] to-[#F07B6B] hover:opacity-95 active:scale-98 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-[#F07B6B]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>
                {isInitialSetup
                  ? isIndonesian
                    ? 'Simpan & Mulai Curhat ✨'
                    : 'Save & Start Chatting ✨'
                  : isIndonesian
                  ? 'Simpan Pengaturan ✨'
                  : 'Save Settings ✨'}
              </span>
            </button>

            {isInitialSetup && (
              <button
                type="button"
                onClick={() => onSaveName('')}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer"
              >
                {isIndonesian ? 'Nanti saja, panggil "Mama" saja' : 'Skip for now, just call me "Mama"'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
