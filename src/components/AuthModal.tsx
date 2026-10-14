import React, { useState } from 'react';
import { Sparkles, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language } from '../services/i18n.ts';
import { usageGuard, AuthUser } from '../services/usageGuard.ts';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: AuthUser) => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, lang }) => {
  const [mamaName, setMamaName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isIndonesian = lang === 'id';

  const handleJudgeBypass = () => {
    setIsSubmitting(true);
    const user = usageGuard.loginAsJudge(
      isIndonesian ? 'Juri AI Builder Cup' : 'AI Builder Cup Judge'
    );
    setTimeout(() => {
      onSuccess(user);
      setIsSubmitting(false);
    }, 300);
  };

  const handleMamaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mamaName.trim() || (isIndonesian ? 'Mama' : 'Mama');
    setIsSubmitting(true);
    const user = usageGuard.loginAsMama(clean);
    setTimeout(() => {
      onSuccess(user);
      setIsSubmitting(false);
    }, 300);
  };

  const handleGoogleMockLogin = () => {
    setIsSubmitting(true);
    const user = usageGuard.loginAsMama(
      isIndonesian ? 'Mama' : 'Mama',
      'user@gmail.com'
    );
    setTimeout(() => {
      onSuccess(user);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1228]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#FDDDD8] overflow-hidden text-center select-none">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#F07B6B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#9B8EC4]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#F07B6B] via-[#F5A898] to-[#9B8EC4] shadow-lg shadow-[#F07B6B]/25 mb-2.5">
            <MomlyAvatar size="lg" pose="winking" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#FDDDD8] text-[#F07B6B] border border-[#F07B6B]/25 tracking-wide shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#F07B6B] fill-[#F07B6B]" />
            <span>Google Cloud AI Builder Cup 2026</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1228] tracking-tight mb-1">
          Mom<span className="text-[#F07B6B]">ly</span> : Your AI Bestie
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5 leading-relaxed">
          {isIndonesian
            ? 'Teman curhat & pendengar hangat berbasis suara tanpa rasa dihakimi, ditenagai Google Gemini.'
            : 'Your empathetic voice listening bestie with zero judgment, powered by Google Gemini.'}
        </p>

        {/* SECTION 1: PROMINENT ONE-CLICK JUDGE BYPASS BUTTON */}
        <div className="mb-5 p-4 rounded-3xl bg-gradient-to-br from-[#FFF8F2] via-[#FDDDD8]/40 to-[#EEE8FF]/50 border-2 border-[#F07B6B]/40 shadow-md text-left relative overflow-hidden">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F07B6B] block">
                {isIndonesian ? '⭐ Akses Penilaian Instan' : '⭐ Instant Evaluation Access'}
              </span>
              <h3 className="text-sm font-bold text-[#1C1228]">
                {isIndonesian ? 'Masuk Mode Juri / Reviewer' : 'Enter as Judge / Reviewer'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
              {isIndonesian ? 'Bypass 1-Klik' : '1-Click Bypass'}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 mb-3 leading-snug">
            {isIndonesian
              ? 'Khusus juri AI Builder Cup 2026 untuk menguji suara, empati, dan fitur tanpa perlu registrasi.'
              : 'Dedicated for AI Builder Cup 2026 judges to evaluate voice, empathy, and features without sign up.'}
          </p>

          <button
            onClick={handleJudgeBypass}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#F07B6B] via-[#F5A898] to-[#F07B6B] hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#F07B6B]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            <span>
              {isIndonesian
                ? '✨ Masuk Sebagai Juri (Mulai Demo)'
                : '✨ Enter as Judge (Start Demo)'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* OR DIVIDER */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {isIndonesian ? 'Atau Masuk Sebagai Mama' : 'Or Enter As Mama'}
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* SECTION 2: MAMA LOGIN FORM */}
        <form onSubmit={handleMamaSubmit} className="space-y-3 mb-4">
          <div className="relative">
            <input
              type="text"
              value={mamaName}
              onChange={(e) => setMamaName(e.target.value)}
              placeholder={
                isIndonesian
                  ? 'Ketik Nama Panggilan (contoh: Gina)'
                  : 'Enter Nickname (e.g., Gina)'
              }
              maxLength={25}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#FDDDD8] focus:border-[#F07B6B] bg-[#FFF8F2]/60 text-xs sm:text-sm font-semibold text-[#1C1228] placeholder-slate-400 outline-none transition-all shadow-inner text-center"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#FFF8F2] hover:bg-[#FDDDD8]/50 border border-[#FDDDD8] text-[#1C1228] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Heart className="w-3.5 h-3.5 text-[#F07B6B] fill-[#F07B6B]" />
            <span>
              {isIndonesian ? 'Masuk Ruang Curhat Mama' : 'Enter Sanctuary as Mama'}
            </span>
          </button>
        </form>

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleMockLogin}
          disabled={isSubmitting}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer mb-4"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{isIndonesian ? 'Lanjutkan dengan Google' : 'Continue with Google'}</span>
        </button>

        {/* Security Reassurance Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {isIndonesian
              ? 'Ruang aman terlindungi • Bebas penghakiman'
              : 'Protected safe space • Zero judgment sanctuary'}
          </span>
        </div>
      </div>
    </div>
  );
};
