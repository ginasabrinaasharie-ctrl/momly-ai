import React, { useState } from 'react';
import { Sparkles, ArrowRight, LogOut, X, User } from 'lucide-react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language } from '../services/i18n.ts';
import { usageGuard, AuthUser } from '../services/usageGuard.ts';
import { loginWithGooglePopup } from '../services/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  currentUser?: AuthUser | null;
  onSuccess: (user: AuthUser) => void;
  onLogout?: () => void;
  onClose?: () => void;
  lang: Language;
  onSelectLang?: (lang: Language) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onSuccess,
  onLogout,
  onClose,
  lang,
  onSelectLang,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  if (!isOpen) return null;

  const isIndonesian = lang === 'id';

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = identifier.trim() || (isIndonesian ? 'Tamu' : 'Guest');
    setIsSubmitting(true);
    const user = usageGuard.loginAsMama(clean);
    setTimeout(() => {
      onSuccess(user);
      setIsSubmitting(false);
    }, 200);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setAuthError('');
    try {
      const firebaseUser = await loginWithGooglePopup();
      const displayName =
        firebaseUser.displayName?.trim() ||
        firebaseUser.email?.split('@')[0] ||
        (isIndonesian ? 'Mama' : 'Mama');

      const user = usageGuard.loginWithFirebaseGoogle(
        firebaseUser.uid,
        displayName,
        firebaseUser.email || undefined,
        firebaseUser.photoURL || undefined
      );

      onSuccess(user);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed popup without selecting account
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError(
          isIndonesian
            ? 'Domain ini belum diotorisasi di Firebase Authentication.'
            : 'This domain is not authorized in Firebase Authentication.'
        );
      } else {
        setAuthError(
          isIndonesian
            ? 'Gagal masuk dengan Google. Silakan coba lagi.'
            : 'Google sign-in failed. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJudgeBypass = () => {
    setIsSubmitting(true);
    const user = usageGuard.loginAsJudge(
      isIndonesian ? 'Juri AI Builder Cup' : 'AI Builder Cup Judge'
    );
    setTimeout(() => {
      onSuccess(user);
      setIsSubmitting(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C1228]/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#FDDDD8] my-auto max-h-[92vh] overflow-y-auto text-center select-none">
        
        {/* Close button if user is already logged in */}
        {currentUser && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isIndonesian ? 'Tutup' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Bar: Language Switcher */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#F07B6B] bg-[#FDDDD8] px-2.5 py-0.5 rounded-full">
            Momly AI
          </span>

          <div className="inline-flex items-center gap-1 bg-[#F7F4FA] p-1 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => onSelectLang?.('en')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-[#F07B6B] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🇺🇸 EN
            </button>
            <button
              type="button"
              onClick={() => onSelectLang?.('id')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                lang === 'id'
                  ? 'bg-white text-[#F07B6B] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🇮🇩 ID
            </button>
          </div>
        </div>

        {/* Momly Avatar & Clean Heading */}
        <div className="flex flex-col items-center justify-center mb-4">
          <MomlyAvatar size="md" pose="winking" className="mb-2" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1228] tracking-tight">
            Mom<span className="text-[#F07B6B]">ly</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isIndonesian ? 'Masuk ke Akun Anda' : 'Sign in to your account'}
          </p>
        </div>

        {/* SECTION 1: DAFTAR & LOGIN UMUM */}
        <div className="space-y-2.5 mb-4">
          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.99] text-xs font-semibold text-slate-700 shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>
              {isSubmitting
                ? (isIndonesian ? 'Menghubungkan ke Google...' : 'Connecting to Google...')
                : (isIndonesian ? 'Lanjutkan dengan Google' : 'Continue with Google')}
            </span>
          </button>

          {/* Error notice if Google sign-in encounters issue */}
          {authError && (
            <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-2 font-medium">
              ⚠️ {authError}
            </p>
          )}

          {/* Standard Form: Email or Name */}
          <form onSubmit={handleStandardLogin} className="space-y-2 pt-1">
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  isIndonesian ? 'Nama atau Email Anda' : 'Your Name or Email'
                }
                maxLength={35}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#FDDDD8] focus:border-[#F07B6B] bg-[#FFF8F2]/70 text-xs font-semibold text-[#1C1228] placeholder-slate-400 outline-none transition-all text-center"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#FFF8F2] hover:bg-[#FDDDD8]/60 border border-[#FDDDD8] text-[#1C1228] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-[#F07B6B]" />
              <span>{isIndonesian ? 'Masuk' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        {/* CLEAN DIVIDER */}
        <div className="relative flex items-center justify-center my-3.5">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {isIndonesian ? 'Demo Juri' : 'Judge Demo'}
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* SECTION 2: TOMBOL DEMO JURI AI BUILDER CUP */}
        <button
          onClick={handleJudgeBypass}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#F07B6B] via-[#F5A898] to-[#F07B6B] hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#F07B6B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer mb-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>
            {isIndonesian
              ? '✨ Demo Juri AI Builder Cup'
              : '✨ AI Builder Cup Judge Demo'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* LOG OUT BUTTON (IF CURRENTLY LOGGED IN) */}
        {currentUser && onLogout && (
          <div className="pt-2 border-t border-slate-100 mt-3">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isIndonesian ? 'Keluar dari Akun (Log Out)' : 'Log Out of Account'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
