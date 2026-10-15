import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  LogOut,
  X,
  User,
  Lock,
  Mail,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { MomlyAvatar } from './MomlyAvatar.tsx';
import { Language } from '../services/i18n.ts';
import { usageGuard, AuthUser } from '../services/usageGuard.ts';
import {
  loginWithGooglePopup,
  loginWithEmailPassword,
  registerWithEmailPassword,
} from '../services/firebase.ts';

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
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  if (!isOpen) return null;

  const isIndonesian = lang === 'id';

  // Handle Real Firebase Email / Password Sign In & Registration
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError(isIndonesian ? 'Mohon masukkan email Anda.' : 'Please enter your email.');
      return;
    }

    if (!password) {
      setAuthError(isIndonesian ? 'Mohon masukkan kata sandi Anda.' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'register') {
        const cleanName = name.trim() || 'Mama';
        if (password.length < 6) {
          setAuthError(
            isIndonesian
              ? 'Kata sandi minimal 6 karakter.'
              : 'Password must be at least 6 characters.'
          );
          setIsSubmitting(false);
          return;
        }

        const firebaseUser = await registerWithEmailPassword(cleanName, cleanEmail, password);
        const user = usageGuard.loginWithFirebaseEmail(
          firebaseUser.uid,
          cleanName,
          firebaseUser.email || cleanEmail
        );
        onSuccess(user);
      } else {
        // Sign In Mode: Checks if account actually exists in Firebase backend!
        const firebaseUser = await loginWithEmailPassword(cleanEmail, password);
        const displayName =
          firebaseUser.displayName?.trim() ||
          cleanEmail.split('@')[0] ||
          (isIndonesian ? 'Mama' : 'Mama');

        const user = usageGuard.loginWithFirebaseEmail(
          firebaseUser.uid,
          displayName,
          firebaseUser.email || cleanEmail
        );
        onSuccess(user);
      }
    } catch (err: any) {
      console.warn('Firebase Email Auth Error:', err);
      const code = err.code || '';

      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setAuthError(
          isIndonesian
            ? 'Akun belum terdaftar atau email/kata sandi salah. Jika belum punya akun, silakan klik tab "Daftar Baru".'
            : 'Account not found or invalid credentials. If you do not have an account yet, please click "Register".'
        );
      } else if (code === 'auth/email-already-in-use') {
        setAuthError(
          isIndonesian
            ? 'Email ini sudah terdaftar. Silakan pilih tab "Masuk".'
            : 'This email is already registered. Please choose "Sign In".'
        );
      } else if (code === 'auth/invalid-email') {
        setAuthError(
          isIndonesian ? 'Format alamat email tidak valid.' : 'Invalid email address format.'
        );
      } else if (code === 'auth/weak-password') {
        setAuthError(
          isIndonesian
            ? 'Kata sandi terlalu singkat (minimal 6 karakter).'
            : 'Password too weak (minimum 6 characters).'
        );
      } else if (code === 'auth/too-many-requests') {
        setAuthError(
          isIndonesian
            ? 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.'
            : 'Too many attempts. Please try again later.'
        );
      } else {
        setAuthError(
          isIndonesian
            ? `Gagal memproses (${err.message || 'Error'}). Silakan coba lagi.`
            : `Authentication failed (${err.message || 'Error'}). Please try again.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Official Google OAuth Popup
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

  // Direct 1-Click Judge Demo Bypass (Instant access without password)
  const handleJudgeBypass = () => {
    setIsSubmitting(true);
    const user = usageGuard.loginAsJudge(
      isIndonesian ? 'Juri AI Builder Cup' : 'AI Builder Cup Judge'
    );
    setTimeout(() => {
      onSuccess(user);
      setIsSubmitting(false);
    }, 150);
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
        <div className="flex flex-col items-center justify-center mb-3">
          <MomlyAvatar size="md" pose="winking" className="mb-1.5" />
          <h2 className="text-xl font-extrabold text-[#1C1228] tracking-tight">
            Mom<span className="text-[#F07B6B]">ly</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isIndonesian
              ? 'Akun Anda tersinkron aman dengan Firebase'
              : 'Your account is securely powered by Firebase'}
          </p>
        </div>

        {/* SECTION 1: GOOGLE 1-CLICK AUTH */}
        <div className="mb-3.5">
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
        </div>

        {/* OR DIVIDER */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {isIndonesian ? 'Atau dengan Email' : 'Or with Email'}
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* SECTION 2: FIREBASE EMAIL & PASSWORD AUTH (TAB SWITCHER) */}
        <div className="mb-4">
          <div className="flex items-center justify-center p-1 bg-[#F7F4FA] rounded-2xl mb-3 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#F07B6B] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isIndonesian ? 'Masuk' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#F07B6B] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isIndonesian ? 'Daftar Baru' : 'Register'}
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-2 text-left">
            {/* Name Input (Only on Register) */}
            {authMode === 'register' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isIndonesian ? 'Nama Panggilan (contoh: Gina)' : 'Your Name (e.g. Sarah)'}
                  maxLength={30}
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#FDDDD8] focus:border-[#F07B6B] bg-[#FFF8F2]/70 text-xs font-semibold text-[#1C1228] placeholder-slate-400 outline-none transition-all"
                />
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#FDDDD8] focus:border-[#F07B6B] bg-[#FFF8F2]/70 text-xs font-semibold text-[#1C1228] placeholder-slate-400 outline-none transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  authMode === 'register'
                    ? (isIndonesian ? 'Kata Sandi (min. 6 karakter)' : 'Password (min. 6 characters)')
                    : (isIndonesian ? 'Kata Sandi Akun' : 'Password')
                }
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#FDDDD8] focus:border-[#F07B6B] bg-[#FFF8F2]/70 text-xs font-semibold text-[#1C1228] placeholder-slate-400 outline-none transition-all"
              />
            </div>

            {/* Error Message */}
            {authError && (
              <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-2 font-medium text-center">
                ⚠️ {authError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFF8F2] hover:bg-[#FDDDD8]/60 border border-[#FDDDD8] text-[#1C1228] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs mt-1"
            >
              {authMode === 'register' ? (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-[#F07B6B]" />
                  <span>
                    {isSubmitting
                      ? (isIndonesian ? 'Mendaftarkan Akun...' : 'Registering...')
                      : (isIndonesian ? 'Buat Akun Baru' : 'Create New Account')}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-[#F07B6B]" />
                  <span>
                    {isSubmitting
                      ? (isIndonesian ? 'Memeriksa Akun...' : 'Verifying...')
                      : (isIndonesian ? 'Masuk ke Akun' : 'Sign In')}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In & Register */}
          <div className="mt-2 text-center">
            {authMode === 'signin' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className="text-[11px] font-semibold text-[#F07B6B] hover:underline cursor-pointer"
              >
                {isIndonesian ? 'Belum punya akun? Buat akun di sini' : "Don't have an account? Sign up here"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                }}
                className="text-[11px] font-semibold text-[#F07B6B] hover:underline cursor-pointer"
              >
                {isIndonesian ? 'Sudah punya akun? Masuk di sini' : 'Already have an account? Sign in here'}
              </button>
            )}
          </div>
        </div>

        {/* CLEAN DIVIDER FOR JUDGE DEMO */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {isIndonesian ? 'Akses Khusus Juri' : 'Judge Special Access'}
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* SECTION 3: TOMBOL DEMO JURI AI BUILDER CUP (1-KLIK LANGSUNG MASUK TANPA PASSWORD) */}
        <button
          onClick={handleJudgeBypass}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#F07B6B] via-[#F5A898] to-[#F07B6B] hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#F07B6B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer mb-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>
            {isIndonesian
              ? '✨ Demo Juri (Langsung Masuk)'
              : '✨ Judge Demo (Instant Access)'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* LOG OUT BUTTON (IF CURRENTLY LOGGED IN) */}
        {currentUser && onLogout && (
          <div className="pt-2 border-t border-slate-100 mt-2">
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
